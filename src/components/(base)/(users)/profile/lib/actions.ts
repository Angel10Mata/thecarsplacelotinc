"use server";

import { createClient } from "@/utils/supabase/server";
import type { AdminUserAttributes } from "@supabase/supabase-js";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { APP_AJUSTES_PATH, APP_BASE_PATH } from "@/lib/app-config";
import { resolveUserRole } from "@/lib/user-role";
import {
  canAssignRole,
  canManageUsers,
  isUserVisibleToActor,
  normalizeKnownRole,
} from "@/components/(base)/(users)/usuarios/lib/permissions";
import { mensajeErrorEs } from "@/lib/supabase-errors-es";
import { mensajeSiServiceRoleKeyInvalida } from "@/lib/supabase-service-role-env";
import {
  MENSAJE_ERROR_GENERAL,
  MENSAJE_ERROR_SISTEMA,
  mensajeParaUsuario,
} from "@/lib/mensajes-usuario";
import { ProfileFormValues } from "./zod";

// Perfil
export async function getProfileById(userId: string) {
  if (!userId) return null;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Fallback a admin client por si RLS bloquea (típico en usuarios nuevos)
      const admin = createAdminClient();
      const { data: adminData, error: adminErr } = await admin
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (!adminErr && adminData) {
        return adminData;
      }
    }
    throw new Error(error.message);
  }

  return data;
}

// Credenciales
export async function getUserAuthData(userId: string) {
  if (mensajeSiServiceRoleKeyInvalida()) {
    return { username: "", phone: "", banned_until: null };
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    return { username: "", phone: "", banned_until: null };
  }

  const meta = data.user.user_metadata || {};
  const userWithBan = data.user as { banned_until?: string } & typeof data.user;

  return {
    username: meta.username || data.user.email?.split("@")[0] || "",
    phone: meta.phone || data.user.phone || "",
    banned_until: userWithBan.banned_until || null,
  };
}

export async function updateProfile(
  userId: string,
  formData: Partial<ProfileFormValues>,
) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const {
    data: { user: actor },
  } = await supabase.auth.getUser();
  if (!actor) {
    throw new Error("Debes iniciar sesión.");
  }

  const actorRole = await resolveUserRole(supabase, actor);
  const isSelf = actor.id === userId;

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", userId)
    .maybeSingle();

  const targetRole = targetProfile?.rol || "user";

  if (formData.rol) {
    formData.rol = normalizeKnownRole(formData.rol) as ProfileFormValues["rol"];
  }

  if (formData.rol && formData.rol !== normalizeKnownRole(targetRole)) {
    if (isSelf) {
      throw new Error("No puedes cambiar tu propio rol.");
    }
    if (
      !canManageUsers(actorRole) ||
      !isUserVisibleToActor(targetRole, actorRole) ||
      !canAssignRole(actorRole, formData.rol)
    ) {
      throw new Error("No tienes permiso para cambiar este rol.");
    }
  }

  const rawData = {
    nombre: formData.nombre,
    email: formData.email,
    telefono: formData.telefono,
    dpi: formData.dpi,
    nit: formData.nit,
    direccion: formData.direccion,
    fecha_nacimiento: formData.fecha_nacimiento,
    genero: formData.genero,
    contacto_emergencia: formData.contacto_emergencia,
    telefono_emergencia: formData.telefono_emergencia,
    rol: formData.rol,
  };

  const profileData = Object.fromEntries(
    Object.entries(rawData).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  );

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", userId);

  if (profileError) {
    throw new Error(profileError.message);
  }

  revalidatePath(`${APP_AJUSTES_PATH}/usuarios`);

  const metadataUpdates: Record<string, string> = {};

  if (formData.telefono) metadataUpdates.phone = formData.telefono;
  if (formData.nombre) metadataUpdates.nombre = formData.nombre;
  if (formData.rol) metadataUpdates.rol = formData.rol;

  if (Object.keys(metadataUpdates).length > 0) {
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: metadataUpdates,
      },
    );

    if (authError) {
      console.error("Error updating auth metadata:", authError);
    }
  }

  return { success: true };
}

export async function updateUserCredentials(
  userId: string,
  username?: string,
  password?: string,
) {
  if (!username && !password) return { success: true };

  if (mensajeSiServiceRoleKeyInvalida()) {
    throw new Error(MENSAJE_ERROR_SISTEMA);
  }

  const supabase = await createClient();
  const {
    data: { user: actor },
  } = await supabase.auth.getUser();
  if (!actor) {
    throw new Error("Debes iniciar sesión.");
  }

  const actorRole = await resolveUserRole(supabase, actor);
  const isSelf = actor.id === userId;

  if (!isSelf) {
    if (!canManageUsers(actorRole)) {
      throw new Error("No tienes permiso para editar este usuario.");
    }
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", userId)
      .maybeSingle();
    if (!isUserVisibleToActor(targetProfile?.rol, actorRole)) {
      throw new Error("No tienes permiso para editar este usuario.");
    }
  }

  const supabaseAdmin = createAdminClient();
  const authUpdates: AdminUserAttributes = {};

  if (password) {
    authUpdates.password = password;
  }

  if (username) {
    const { data: existing } = await supabaseAdmin.auth.admin.getUserById(userId);
    const prevMeta =
      (existing?.user?.user_metadata as Record<string, unknown> | undefined) ??
      {};
    authUpdates.email = `${username}@app.com`;
    authUpdates.email_confirm = true;
    authUpdates.user_metadata = {
      ...prevMeta,
      username,
    };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    authUpdates,
  );

  if (error) {
    throw new Error(mensajeErrorEs(error.message));
  }

  if (password && !isSelf) {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ ultimo_cambio_password: null })
      .eq("id", userId);
    if (profileError) {
      console.error(
        "[updateUserCredentials] ultimo_cambio_password:",
        profileError.message,
      );
    }
  }

  return { success: true };
}

export type DeleteUsuarioResult =
  | { ok: true }
  | { ok: false; message: string };

export async function deleteUsuario(
  userId: string,
): Promise<DeleteUsuarioResult> {
  try {
    if (!userId?.trim()) {
      return { ok: false, message: MENSAJE_ERROR_GENERAL };
    }

    if (mensajeSiServiceRoleKeyInvalida()) {
      return { ok: false, message: MENSAJE_ERROR_SISTEMA };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!supabaseUrl || !serviceKey) {
      return { ok: false, message: MENSAJE_ERROR_SISTEMA };
    }

    const supabase = await createClient();
    const {
      data: { user: actor },
    } = await supabase.auth.getUser();
    if (!actor) {
      return { ok: false, message: "Debes iniciar sesión." };
    }

    if (actor.id === userId) {
      return { ok: false, message: "No puedes eliminar tu propia cuenta." };
    }

    const actorRole = await resolveUserRole(supabase, actor);
    if (normalizeKnownRole(actorRole) !== "super") {
      return { ok: false, message: "No tienes permiso para eliminar usuarios." };
    }

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", userId)
      .maybeSingle();

    if (normalizeKnownRole(targetProfile?.rol) === "super") {
      return { ok: false, message: "No se puede eliminar una cuenta Sistemas." };
    }

    const supabaseAdmin = createAdminClient();

    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      return {
        ok: false,
        message: mensajeParaUsuario(
          mensajeErrorEs(deleteAuthError.message),
          MENSAJE_ERROR_GENERAL,
        ),
      };
    }

    try {
      revalidatePath(`${APP_AJUSTES_PATH}/usuarios`);
    } catch (revalidateError) {
      console.error("revalidatePath usuarios:", revalidateError);
    }

    return { ok: true };
  } catch (error: unknown) {
    console.error("deleteUsuario:", error);
    return { ok: false, message: MENSAJE_ERROR_GENERAL };
  }
}

// Estado cuenta
export async function toggleUserStatus(userId: string, isBanned: boolean) {
  const supabaseAdmin = createAdminClient();

  const banDuration = isBanned ? "876600h" : "none";

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: banDuration,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`${APP_AJUSTES_PATH}/usuarios`);
  return { success: true };
}
