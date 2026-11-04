"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarCustomerAction,
  crearCustomerAction,
  getClienteDetalleAction,
  getCustomerByIdAction,
  getCustomerByRefAction,
  listCarsByCustomerAction,
  listCustomersAction,
} from "./actions";
import type {
  ActualizarCustomerInput,
  CrearCustomerInput,
  CustomerRef,
} from "./zod";

export const customersQueryKey = ["clientes", "list"] as const;
export const customersSearchQueryKey = ["clientes", "search"] as const;

export function clienteVehiculosQueryKey(customerId: string) {
  return ["clientes", "vehiculos", customerId] as const;
}

export function customerDetailQueryKey(customerId: string) {
  return ["clientes", "detail", customerId] as const;
}

export function clienteDetalleQueryKey(customerId: string) {
  return ["clientes", "detalle", customerId] as const;
}

export function useClienteDetalle(customerId: string | null, enabled = true) {
  return useQuery({
    queryKey: customerId
      ? clienteDetalleQueryKey(customerId)
      : (["clientes", "detalle", "none"] as const),
    queryFn: async () => {
      if (!customerId) return null;
      const res = await getClienteDetalleAction(customerId);
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
    enabled: enabled && customerId !== null,
  });
}

export function customerDetailRefQueryKey(ref: CustomerRef) {
  return [
    "clientes",
    "detail",
    "ref",
    ref.nit?.trim() ?? "",
    ref.nombre?.trim() ?? "",
  ] as const;
}

export function useCustomerByRef(ref: CustomerRef | null, enabled = true) {
  const hasRef = Boolean(ref?.nit?.trim() || ref?.nombre?.trim());
  return useQuery({
    queryKey: ref
      ? customerDetailRefQueryKey(ref)
      : (["clientes", "detail", "ref", "none"] as const),
    queryFn: async () => {
      if (!ref || !hasRef) return null;
      const res = await getCustomerByRefAction(ref);
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
    enabled: enabled && hasRef,
  });
}

export function useCustomer(customerId: string | null, enabled = true) {
  return useQuery({
    queryKey: customerId
      ? customerDetailQueryKey(customerId)
      : (["clientes", "detail", "none"] as const),
    queryFn: async () => {
      if (!customerId) return null;
      const res = await getCustomerByIdAction(customerId);
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
    enabled: enabled && customerId !== null,
  });
}

export function useCustomersSearch(query: string, enabled: boolean) {
  const term = query.trim();
  return useQuery({
    queryKey: [...customersSearchQueryKey, term],
    queryFn: async () => {
      const res = await listCustomersAction(term);
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
    enabled: enabled && term.length >= 3,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: customersQueryKey,
    queryFn: async () => {
      const res = await listCustomersAction();
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
  });
}

export function useCrearCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CrearCustomerInput) => {
      const res = await crearCustomerAction(input);
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customersQueryKey });
      qc.invalidateQueries({ queryKey: customersSearchQueryKey });
    },
  });
}

export function useClienteVehiculos(customerId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: customerId
      ? clienteVehiculosQueryKey(customerId)
      : (["clientes", "vehiculos", "none"] as const),
    queryFn: async () => {
      if (!customerId) return [];
      const res = await listCarsByCustomerAction(customerId);
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
    enabled: enabled && customerId !== null,
  });
}

export function useActualizarCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ActualizarCustomerInput) => {
      const res = await actualizarCustomerAction(input);
      if (!res.ok) throw new Error(res.code);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: customersQueryKey });
      qc.invalidateQueries({ queryKey: customersSearchQueryKey });
      qc.invalidateQueries({ queryKey: customerDetailQueryKey(variables.id) });
      qc.invalidateQueries({ queryKey: clienteDetalleQueryKey(variables.id) });
      qc.invalidateQueries({ queryKey: clienteVehiculosQueryKey(variables.id) });
    },
  });
}
