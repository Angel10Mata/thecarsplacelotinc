"use server";

import { mensajeSiServiceRoleKeyInvalida } from "@/lib/supabase-service-role-env";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { resolveUserRole } from "@/lib/user-role";
import { canManageClientesYVehiculos } from "@/components/(base)/(users)/usuarios/lib/permissions";
import {
  CAR_IMAGE_MAX_BYTES,
  CAR_PDF_MAX_BYTES,
  carMediaStorageBucketForPath,
  isValidCarMediaStoragePath,
} from "./car-images";
import { classifyStorageError } from "./storage-messages";

async function requireStorageAccess(): Promise<
  | { ok: true; user: { id: string } }
  | { ok: false; code: "UNAUTHORIZED" | "FORBIDDEN" }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, code: "UNAUTHORIZED" };

  const role = await resolveUserRole(supabase, user);
  if (!canManageClientesYVehiculos(role)) {
    return { ok: false, code: "FORBIDDEN" };
  }

  return { ok: true, user };
}

function storageClient() {
  if (!mensajeSiServiceRoleKeyInvalida()) {
    return createAdminClient();
  }
  return null;
}

export async function uploadCarImageStorageAction(formData: FormData) {
  const auth = await requireStorageAccess();
  if (!auth.ok) {
    return { ok: false as const, code: auth.code };
  }

  const file = formData.get("file");
  const path = formData.get("path");
  const replacePath = formData.get("replacePath");

  if (!(file instanceof Blob) || typeof path !== "string" || !path.trim()) {
    return { ok: false as const, code: "VALIDATION" as const };
  }

  const pathTrim = path.trim();
  if (!isValidCarMediaStoragePath(pathTrim)) {
    return { ok: false as const, code: "VALIDATION" as const };
  }

  const isPdf = pathTrim.endsWith(".pdf");
  if (isPdf && file.size > CAR_PDF_MAX_BYTES) {
    return { ok: false as const, code: "STORAGE_SIZE" as const };
  }
  if (!isPdf && file.size > CAR_IMAGE_MAX_BYTES) {
    return { ok: false as const, code: "STORAGE_SIZE" as const };
  }

  const bucket = carMediaStorageBucketForPath(pathTrim);
  const admin = storageClient();
  const supabase = admin ?? (await createClient());

  const upsert = formData.get("upsert") === "true";

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(pathTrim, file, {
      upsert,
      contentType: isPdf ? "application/pdf" : "image/jpeg",
      cacheControl: "0",
    });

  if (uploadError) {
    console.error("uploadCarImageStorage:", uploadError.message);
    return {
      ok: false as const,
      code: classifyStorageError(uploadError.message),
      detail: uploadError.message,
    };
  }

  if (typeof replacePath === "string" && replacePath.trim()) {
    const replaceTrim = replacePath.trim();
    await supabase.storage
      .from(carMediaStorageBucketForPath(replaceTrim))
      .remove([replaceTrim]);
  }

  return { ok: true as const, path: path.trim() };
}

export async function removeCarImageStorageAction(path: string) {
  const auth = await requireStorageAccess();
  if (!auth.ok) {
    return { ok: false as const, code: auth.code };
  }

  const trimmed = path.trim();
  if (!trimmed || /^https?:\/\//i.test(trimmed)) {
    return { ok: true as const };
  }

  const admin = storageClient();
  const supabase = admin ?? (await createClient());

  const { error } = await supabase.storage
    .from(carMediaStorageBucketForPath(trimmed))
    .remove([trimmed]);

  if (error) {
    console.error("removeCarImageStorage:", error.message);
    return { ok: false as const, code: "STORAGE_ERROR" as const };
  }

  return { ok: true as const };
}
