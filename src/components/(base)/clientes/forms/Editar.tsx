"use client";

import { useEffect, useState } from "react";
import {
  ModalShell,
  ModalForm,
  ModalField,
  ModalLabel,
  ModalInput,
  ModalFooter,
  ModalCancelButton,
  ModalSubmit,
  toast,
  modalActionMessage,
} from "@/components/ui/general-modal";
import { useActualizarCustomer } from "../lib/hooks";
import type { ClienteListRow } from "../lib/zod";
import {
  clienteFormInvalidVacio,
  validarClienteFormulario,
  type ClienteFormInvalid,
} from "../lib/cliente-form-validacion";

type EditarClienteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClienteListRow | null;
};

export default function EditarClienteModal({
  open,
  onOpenChange,
  cliente,
}: EditarClienteModalProps) {
  const actualizar = useActualizarCustomer();
  const [customerName, setCustomerName] = useState("");
  const [customerNit, setCustomerNit] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [invalid, setInvalid] = useState<ClienteFormInvalid>(
    clienteFormInvalidVacio,
  );

  useEffect(() => {
    if (!open || !cliente) return;
    setCustomerName(cliente.nombre);
    setCustomerNit(cliente.nit ?? "");
    setCustomerAddress(cliente.direccion ?? "");
    setInvalid(clienteFormInvalidVacio);
  }, [open, cliente]);

  const handleClose = () => {
    if (actualizar.isPending) return;
    onOpenChange(false);
  };

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      title="Editar cliente"
      maxWidth="max-w-lg"
    >
      <ModalForm
        onSubmit={async (e) => {
          e.preventDefault();
          if (!cliente) return;
          const errores = validarClienteFormulario({
            nombre: customerName,
            nit: customerNit,
            direccion: customerAddress,
          });
          if (errores) {
            setInvalid(errores);
            return;
          }
          setInvalid(clienteFormInvalidVacio);
          try {
            await actualizar.mutateAsync({
              id: cliente.id,
              customer_name: customerName,
              customer_nit: customerNit,
              customer_address: customerAddress,
            });
            toast.success("Cliente actualizado.");
            handleClose();
          } catch (err) {
            const code = err instanceof Error ? err.message : "DB_ERROR";
            toast.error(
              modalActionMessage(code, "No se pudo actualizar el cliente."),
            );
          }
        }}
      >
        <ModalField>
          <ModalLabel>Nombre</ModalLabel>
          <ModalInput
            value={customerName}
            invalid={invalid.nombre}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (invalid.nombre) {
                setInvalid((prev) => ({ ...prev, nombre: false }));
              }
            }}
            autoFocus
          />
        </ModalField>
        <ModalField>
          <ModalLabel>NIT</ModalLabel>
          <ModalInput
            value={customerNit}
            invalid={invalid.nit}
            onChange={(e) => {
              setCustomerNit(e.target.value);
              if (invalid.nit) {
                setInvalid((prev) => ({ ...prev, nit: false }));
              }
            }}
          />
        </ModalField>
        <ModalField>
          <ModalLabel>Dirección</ModalLabel>
          <ModalInput
            value={customerAddress}
            invalid={invalid.direccion}
            onChange={(e) => {
              setCustomerAddress(e.target.value);
              if (invalid.direccion) {
                setInvalid((prev) => ({ ...prev, direccion: false }));
              }
            }}
          />
        </ModalField>
        <ModalFooter>
          <ModalCancelButton onClick={handleClose} disabled={actualizar.isPending} />
          <ModalSubmit disabled={actualizar.isPending} label="Guardar" />
        </ModalFooter>
      </ModalForm>
    </ModalShell>
  );
}
