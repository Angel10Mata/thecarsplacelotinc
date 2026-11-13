"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { isAdminRole } from "@/components/(base)/(users)/usuarios/lib/permissions";
import { APP_AJUSTES_PATH, APP_BASE_PATH } from "@/lib/app-config";

function RoleSimulationGuard() {
  const { effectiveRole, simulatedRole } = useUserContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!simulatedRole) return;
    if (!isAdminRole(effectiveRole) && pathname.startsWith(APP_AJUSTES_PATH)) {
      router.replace(APP_BASE_PATH);
    }
  }, [simulatedRole, effectiveRole, pathname, router]);

  return null;
}

export function SimulatedRoleShell() {
  return <RoleSimulationGuard />;
}
