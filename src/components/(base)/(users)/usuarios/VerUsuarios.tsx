"use client";

import { useState, useMemo, Fragment, useEffect } from "react";
import { useUsers } from "./lib/hooks";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { canCreateUsers, ROLE_LABELS } from "./lib/permissions";
import { ModuleDataLoadingPanel } from "@/components/ui/module-page-loading";
import { UserPlus, Check } from "lucide";
import { UserX, Search } from "lucide-react";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import VerPerfil from "@/components/(base)/(users)/profile/VerPerfil";
import dynamic from "next/dynamic";

const SignUp = dynamic(
  () => import("@/components/(base)/(auth)/signup/SignUp"),
  { ssr: false },
);
import {
  modulePageHeaderClass,
  modulePageHeaderStackClass,
  modulePageShellClass,
  modulePageTitleClass,
} from "@/lib/module-layout";
import { ModuleHeaderBackButton } from "@/components/(base)/layout/ModuleHeaderBackButton";
import {
  moduleTableAccentBarClass,
  moduleTableBodyClass,
  moduleTableCellClass,
  moduleTableClass,
  ModuleTableFooter,
  moduleTableHeadCellClass,
  moduleTableHeadRowClass,
  moduleTableRowClass,
  moduleTableScrollClass,
  moduleTableSearchClass,
  moduleTableShellClass,
} from "@/components/ui/module-table";
import { cn } from "@/lib/utils";

// Usuarios
export function VerUsuarios() {
  const { effectiveRole } = useUserContext();
  const canCreateUser = canCreateUsers(effectiveRole);

  // Datos
  const { data: users, isLoading, isError, refetch } = useUsers(effectiveRole);

  // Estado
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "all">(10);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsLargeScreen(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleUserClick = (id: string) => {
    setSelectedUserId(id);
    setIsProfileOpen(true);
  };

  const handleCloseSignUp = () => {
    setIsSignUpOpen(false);
    refetch();
  };

  const roleLabels = ROLE_LABELS;

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users
      .filter((u) =>
        (u.nombre || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        const nameA = a.nombre || "";
        const nameB = b.nombre || "";
        return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
      });
  }, [users, searchQuery]);

  const totalUsers = filteredUsers.length;
  const isAll = pageSize === "all";
  const totalPages = isAll ? 1 : Math.ceil(totalUsers / (pageSize as number));

  const paginatedUsers = useMemo(() => {
    if (isAll) return filteredUsers;
    const size = pageSize as number;
    return filteredUsers.slice((currentPage - 1) * size, currentPage * size);
  }, [filteredUsers, isAll, currentPage, pageSize]);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPageSize(val === "all" ? "all" : Number(val));
    setCurrentPage(1);
  };

  if (isLoading) {
    return <ModuleDataLoadingPanel minHeightClass="min-h-[10rem]" />;
  }

  if (isError) {
    return (
      <div className="flex h-40 w-full flex-col items-center justify-center gap-2 text-destructive">
        <UserX className="h-8 w-8" />
        <p>Error al cargar usuarios</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          modulePageShellClass,
          "min-h-0 gap-2 pt-0 pb-0 md:pt-0 md:pb-8 mt-0 md:mt-4",
        )}
      >
        <header className={modulePageHeaderClass}>
          <div className={modulePageHeaderStackClass}>
            <ModuleHeaderBackButton />
            <div className="flex w-full min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className={modulePageTitleClass}>Gestión de Usuarios</h1>
              </div>
              {canCreateUser && !isSignUpOpen && (
                <SigetActionButton
                  label="Crear"
                  accentColor={sigetAccent.crear}
                  morphFrom={UserPlus}
                  morphTo={Check}
                  onClick={() => setIsSignUpOpen(true)}
                  ariaLabel="Crear usuario en la base de datos"
                  className="w-auto shrink-0"
                />
              )}
            </div>
          </div>
        </header>

        <div className={cn(moduleTableShellClass, "min-w-0 flex-1 flex-col p-0")}>
          <div className={moduleTableAccentBarClass} aria-hidden />
          <div className="px-3 py-4 sm:px-5 sm:py-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={moduleTableSearchClass}
              />
            </div>
          </div>
          <div
            className={cn(
              moduleTableScrollClass,
              "min-h-0 overflow-auto max-md:min-h-0 md:min-h-[400px]",
            )}
          >
            <table className={moduleTableClass}>
            <thead>
              <tr className={moduleTableHeadRowClass}>
                <th className={moduleTableHeadCellClass}>Nombre</th>
                <th className={cn(moduleTableHeadCellClass, "text-right")}>
                  Rol
                </th>
              </tr>
            </thead>
            <tbody className={moduleTableBodyClass}>
              {paginatedUsers.map((userItem, index) => {
                const firstLetter = (userItem.nombre || "#")
                  .charAt(0)
                  .toUpperCase();
                const prevFirstLetter =
                  index > 0
                    ? (paginatedUsers[index - 1].nombre || "#")
                        .charAt(0)
                        .toUpperCase()
                    : null;
                const showSeparator = firstLetter !== prevFirstLetter;

                return (
                  <Fragment key={userItem.id}>
                    {showSeparator && (
                      <tr>
                        <td
                          colSpan={2}
                          className="bg-zinc-100 dark:bg-zinc-800/50 px-5 py-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
                        >
                          {firstLetter}
                        </td>
                      </tr>
                    )}
                    <tr
                      onClick={() => handleUserClick(userItem.id)}
                      className={cn(moduleTableRowClass, "group cursor-pointer")}
                    >
                      <td className={cn(moduleTableCellClass, "font-medium group-hover:text-primary transition-colors")}>
                        {userItem.nombre || "Sin Nombre"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="capitalize text-[10px] font-bold bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                            {userItem.rol ? roleLabels[userItem.rol] || userItem.rol : "Sin Rol"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="p-12 flex flex-col items-center gap-4 text-center text-muted-foreground text-xs uppercase font-medium">
              <p>
                {searchQuery
                  ? "No se encontraron coincidencias."
                  : canCreateUser
                    ? "Aún no hay usuarios. Crea el primero con el botón superior."
                    : "No hay usuarios disponibles."}
              </p>
              {canCreateUser && !searchQuery && !isSignUpOpen && (
                <SigetActionButton
                  label="Crear usuario"
                  accentColor={sigetAccent.crear}
                  morphFrom={UserPlus}
                  morphTo={Check}
                  onClick={() => setIsSignUpOpen(true)}
                  className="w-auto shrink-0 normal-case"
                />
              )}
            </div>
          )}
          </div>

          {/* Barra de Paginación */}
          {!isAll && (
            <ModuleTableFooter
              itemCount={filteredUsers.length}
              pageSize={pageSize as number}
              setPageSize={setPageSize}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <VerPerfil
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userId={selectedUserId}
      />

      {isSignUpOpen && canCreateUser && (
        <SignUp
          isOpen
          onClose={handleCloseSignUp}
          onSuccess={() => refetch()}
          presentation={isLargeScreen ? "modal" : "fullscreen"}
        />
      )}
    </>
  );
}
