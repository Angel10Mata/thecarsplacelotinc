"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mapCarToListRow, enrichVehiculoListRows } from "./helpers";
import {
  actualizarCarAction,
  crearCarAction,
  getCarForEditAction,
  listCarsAction,
} from "./actions";
import { VehiculoActionError } from "./action-errors";
import { publicInventoryQueryKey } from "@/components/(base)/inventario-publico/lib/hooks";
import { customersQueryKey } from "@/components/(base)/clientes/lib/hooks";
import type { ActualizarCarInput, CrearCarInput } from "./zod";

function throwIfActionFailed(
  res: { ok: false; code: string; detail?: string | null },
): never {
  throw new VehiculoActionError(res.code, res.detail ?? undefined);
}

export const carsQueryKey = ["vehiculos", "cars"] as const;

export function useCars() {
  return useQuery({
    queryKey: carsQueryKey,
    queryFn: async () => {
      const res = await listCarsAction();
      if (!res.ok) throw new Error(res.code);
      return enrichVehiculoListRows(
        res.data.map(({ car, customer }) => mapCarToListRow(car, customer)),
      );
    },
  });
}

export function useCrearCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CrearCarInput) => {
      const res = await crearCarAction(input);
      if (!res.ok) throwIfActionFailed(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: carsQueryKey });
      qc.invalidateQueries({ queryKey: publicInventoryQueryKey });
      qc.invalidateQueries({ queryKey: customersQueryKey });
      qc.invalidateQueries({ queryKey: ["clientes", "detalle"] });
      qc.invalidateQueries({ queryKey: ["clientes", "vehiculos"] });
    },
  });
}

export function useCarForEdit(carId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [...carsQueryKey, "edit", carId] as const,
    enabled: enabled && !!carId,
    queryFn: async () => {
      if (!carId) throw new Error("NOT_FOUND");
      const res = await getCarForEditAction(carId);
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
  });
}

export function useActualizarCar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ActualizarCarInput) => {
      const res = await actualizarCarAction(input);
      if (!res.ok) throwIfActionFailed(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: carsQueryKey });
      qc.invalidateQueries({ queryKey: publicInventoryQueryKey });
      qc.invalidateQueries({ queryKey: customersQueryKey });
      qc.invalidateQueries({ queryKey: ["clientes", "detalle"] });
      qc.invalidateQueries({ queryKey: ["clientes", "vehiculos"] });
    },
  });
}
