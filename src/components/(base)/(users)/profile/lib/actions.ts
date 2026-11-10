"use server";

import { createClient } from "@/utils/supabase/server";
import {
  createClient as createSupabaseAdmin,
  type AdminUserAttributes,
} from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { APP_AJUSTES_PATH, APP_BASE_PATH } from "@/lib/app-config";
import { resolveUserRole } from "@/lib/user-role";
import {
  canAssignRole,
  canManageUsers,
  isUserVisibleToActor,
  normalizeKnownRole,
} from "@/components/(base)/(users)/usuarios/lib/permissions";
import { ProfileFormValues } from "./zod";

// Helpers
function getAdminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

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
      const admin = getAdminClient();
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
  const supabaseAdmin = getAdminClient();

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
  const supabaseAdmin = getAdminClient();

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

  const supabaseAdmin = getAdminClient();
  const authUpdates: AdminUserAttributes = {};

  if (password) {
    authUpdates.password = password;
  }

  if (username) {
    authUpdates.email = `${username}@app.com`;
    authUpdates.email_confirm = true;
    authUpdates.user_metadata = {
      username: username,
    };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    authUpdates,
  );

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

// Estado cuenta
export async function toggleUserStatus(userId: string, isBanned: boolean) {
  const supabaseAdmin = getAdminClient();

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
