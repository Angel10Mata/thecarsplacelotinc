"use client";

// CONTEXTO DE USUARIO Y ROL

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { normalizeKnownRole } from "@/components/(base)/(users)/usuarios/lib/permissions";

const SIMULATED_ROLE_STORAGE_KEY = "tcpl-simulated-role";

interface UserContextValue {
  user: User | null;
  simulatedRole: string | null;
  setSimulatedRole: (role: string | null) => void;
  effectiveRole: string;
  realRole: string;
  isSimulating: boolean;
  initialProfileRole: string | null;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  simulatedRole: null,
  setSimulatedRole: () => {},
  effectiveRole: "user",
  realRole: "user",
  isSimulating: false,
  initialProfileRole: null,
});

function resolveRealRole(
  user: User | null,
  profileRole: string | null,
  initialProfileRole: string | null,
): string {
  if (!user) return "user";
  const metadata = user.user_metadata ?? {};
  const fromMeta =
    typeof metadata.rol === "string" && metadata.rol.trim()
      ? metadata.rol.trim()
      : null;
  const fromProfile = profileRole ?? initialProfileRole;
  if (fromProfile) return normalizeKnownRole(fromProfile);
  if (fromMeta) return normalizeKnownRole(fromMeta);
  if (user.role && user.role !== "authenticated") {
    return normalizeKnownRole(user.role);
  }
  return "user";
}

// PROVIDER

function isTransientFetchError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("failed to fetch") || m.includes("network");
}

export function UserProvider({
  user: initialUser,
  initialProfileRole = null,
  children,
}: {
  user: User | null;
  initialProfileRole?: string | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [profileRole, setProfileRole] = useState<string | null>(
    initialProfileRole,
  );
  const [simulatedRole, setSimulatedRole] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    setProfileRole(initialProfileRole);
  }, [initialProfileRole, initialUser?.id]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        setProfileRole(null);
        setSimulatedRole(null);
        return;
      }
      setUser(session.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!user) {
      setProfileRole(null);
      return;
    }
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          if (!isTransientFetchError(error.message)) {
            console.error(
              "UserProvider: Error al obtener perfil:",
              JSON.stringify(error),
            );
          }
          return;
        }
        if (data?.rol) {
          setProfileRole(data.rol);
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        if (!isTransientFetchError(message)) {
          console.error("UserProvider: Error inesperado al obtener perfil:", err);
        }
      }
    };

    void fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.id, supabase]);

  const realRole = resolveRealRole(user, profileRole, initialProfileRole);

  const setSimulatedRolePersisted = useCallback(
    (role: string | null) => {
      if (normalizeKnownRole(realRole) !== "super") {
        setSimulatedRole(null);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(SIMULATED_ROLE_STORAGE_KEY);
        }
        return;
      }
      const next = role ? normalizeKnownRole(role) : null;
      setSimulatedRole(next);
      if (typeof window !== "undefined") {
        if (next) {
          sessionStorage.setItem(SIMULATED_ROLE_STORAGE_KEY, next);
        } else {
          sessionStorage.removeItem(SIMULATED_ROLE_STORAGE_KEY);
        }
      }
    },
    [realRole],
  );

  useEffect(() => {
    if (normalizeKnownRole(realRole) !== "super") {
      setSimulatedRole(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(SIMULATED_ROLE_STORAGE_KEY);
      }
      return;
    }
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(SIMULATED_ROLE_STORAGE_KEY);
    if (!stored) return;
    const normalized = normalizeKnownRole(stored);
    if (normalized === "admin" || normalized === "user") {
      setSimulatedRole(normalized);
    }
  }, [realRole]);

  const effectiveRole = simulatedRole || realRole;
  const isSimulating = simulatedRole !== null;

  return (
    <UserContext.Provider
      value={{
        user,
        simulatedRole,
        setSimulatedRole: setSimulatedRolePersisted,
        effectiveRole,
        realRole,
        isSimulating,
        initialProfileRole,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// HOOKS

export const useUser = () => {
  const ctx = useContext(UserContext);
  return ctx.user;
};

export const useUserContext = () => {
  return useContext(UserContext);
};
