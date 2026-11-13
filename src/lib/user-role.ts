import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { APP_BASE_PATH } from "@/lib/app-config";
import {
  isAdminRole,
  normalizeKnownRole,
} from "@/components/(base)/(users)/usuarios/lib/permissions";

export { isAdminRole };

// RESOLUCIÓN Y ROLES ADMIN

export async function resolveUserRole(
  supabase: SupabaseClient,
  user: User,
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  const metadata = user.user_metadata || {};
  const fallback = metadata.rol || user.role || "user";

  if (profile?.rol) return normalizeKnownRole(profile.rol);
  if (typeof fallback === "string" && fallback !== "authenticated") {
    return normalizeKnownRole(fallback);
  }

  return "user";
}

// GUARD PÁGINAS ADMIN (SERVER)

export async function requireAdminPageAccess() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = await resolveUserRole(supabase, user);
  if (!isAdminRole(role)) {
    redirect(APP_BASE_PATH);
  }

  return { supabase, user, role };
}
