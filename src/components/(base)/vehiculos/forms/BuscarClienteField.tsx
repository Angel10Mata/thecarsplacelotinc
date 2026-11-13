"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide";
import {
  ModalField,
  ModalLabel,
  ModalInput,
} from "@/components/ui/general-modal";
import { SigetActionButton, sigetAccent } from "@/components/ui/siget-action-button";
import { cn } from "@/lib/utils";
import CrearClienteModal from "@/components/(base)/clientes/forms/Crear";
import { useCustomersSearch } from "@/components/(base)/clientes/lib/hooks";
import { customerRowFromClienteListRow } from "@/components/(base)/clientes/lib/helpers";
import type { CustomerRow } from "@/components/(base)/clientes/lib/zod";
import { useUserContext } from "@/components/(base)/providers/UserProvider";
import { canManageClientesYVehiculos } from "@/components/(base)/(users)/usuarios/lib/permissions";

const MIN_SEARCH = 3;

type BuscarClienteFieldProps = {
  label?: string;
  query: string;
  selected: CustomerRow | null;
  onQueryChange: (value: string) => void;
  onSelect: (customer: CustomerRow) => void;
  onClearSelection: () => void;
};

export function BuscarClienteField({
  label = "Cliente",
  query,
  selected,
  onQueryChange,
  onSelect,
  onClearSelection,
}: BuscarClienteFieldProps) {
  const { effectiveRole } = useUserContext();
  const puedeGestionar = canManageClientesYVehiculos(effectiveRole);
  const [open, setOpen] = useState(false);
  const [crearClienteOpen, setCrearClienteOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const term = query.trim();
  const canSearch = term.length >= MIN_SEARCH && !selected;
  const { data: matches = [], isFetching } = useCustomersSearch(query, open && canSearch);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative">
    {puedeGestionar ? (
      <CrearClienteModal
        open={crearClienteOpen}
        onOpenChange={setCrearClienteOpen}
        onCreated={(customer) => {
          onSelect(customer);
          onQueryChange("");
          setOpen(false);
        }}
      />
    ) : null}
    <ModalField>
      <ModalLabel htmlFor="buscar-cliente">{label}</ModalLabel>
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <ModalInput
            id="buscar-cliente"
            type="search"
            autoComplete="off"
            value={selected ? selected.customer_name : query}
            readOnly={Boolean(selected)}
            placeholder={`Escribe al menos ${MIN_SEARCH} letras…`}
            onChange={(e) => {
              onClearSelection();
              onQueryChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className={cn(selected && "bg-zinc-50 dark:bg-zinc-800/50")}
          />
          {open && canSearch ? (
            <div
              className={cn(
                "absolute left-0 right-0 top-full z-[250] mt-1 max-h-52 overflow-y-auto rounded-lg border border-zinc-200 bg-white py-1 opacity-100 shadow-md dark:border-zinc-700 dark:bg-zinc-900",
              )}
            >
              {isFetching ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">Buscando…</p>
              ) : matches.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Sin coincidencias para «{term}».
                </p>
              ) : (
                matches.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => {
                      onSelect(customerRowFromClienteListRow(row));
                      setOpen(false);
                    }}
                    className="flex w-full cursor-pointer flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="font-semibold text-foreground">{row.nombre}</span>
                    {row.nit ? (
                      <span className="text-xs text-muted-foreground">NIT {row.nit}</span>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        {puedeGestionar ? (
          <SigetActionButton
            label="Crear"
            iconOnly
            accentColor={sigetAccent.crear}
            morphFrom={Plus}
            morphTo={Plus}
            morphOnHover={false}
            ariaLabel="Crear cliente"
            className="size-10 w-10 shrink-0"
            onClick={() => {
              setOpen(false);
              setCrearClienteOpen(true);
            }}
          />
        ) : null}
      </div>
      {selected ? (
        <button
          type="button"
          onClick={() => {
            onClearSelection();
            onQueryChange("");
            setOpen(false);
          }}
          className="mt-1 text-xs font-bold text-brand hover:underline dark:text-brand-bright"
        >
          Quitar selección
        </button>
      ) : null}
      {!selected && term.length > 0 && term.length < MIN_SEARCH ? (
        <p className="text-xs text-muted-foreground">
          Escribe {MIN_SEARCH - term.length} letra{MIN_SEARCH - term.length === 1 ? "" : "s"} más para buscar.
        </p>
      ) : null}
    </ModalField>
    </div>
  );
}
