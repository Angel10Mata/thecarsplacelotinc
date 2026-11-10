"use client";

import { useState } from "react";
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
import { useCrearCustomer } from "../lib/hooks";
import type { CustomerRow } from "../lib/zod";
import {
  clienteFormInvalidVacio,
  mensajeToastCamposCliente,
  validarClienteFormulario,
  type ClienteFormInvalid,
} from "../lib/cliente-form-validacion";

type CrearClienteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (customer: CustomerRow) => void;
};

export default function CrearClienteModal({
  open,
  onOpenChange,
  onCreated,
}: CrearClienteModalProps) {
  const crear = useCrearCustomer();
  const [customerName, setCustomerName] = useState("");
  const [customerNit, setCustomerNit] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [invalid, setInvalid] = useState<ClienteFormInvalid>(
    clienteFormInvalidVacio,
  );

  const reset = () => {
    setCustomerName("");
    setCustomerNit("");
    setCustomerAddress("");
    setInvalid(clienteFormInvalidVacio);
  };

  const handleClose = () => {
    if (crear.isPending) return;
    onOpenChange(false);
    reset();
  };

  return (
    <ModalShell open={open} onClose={handleClose} title="Añadir cliente" maxWidth="max-w-lg">
      <ModalForm
        onSubmit={async (e) => {
          e.preventDefault();
          const errores = validarClienteFormulario({
            nombre: customerName,
            nit: customerNit,
            direccion: customerAddress,
          });
          if (errores) {
            setInvalid(errores);
            toast.warn(mensajeToastCamposCliente(errores));
            return;
          }
          setInvalid(clienteFormInvalidVacio);
          try {
            const created = await crear.mutateAsync({
              customer_name: customerName,
              customer_nit: customerNit,
              customer_address: customerAddress,
            });
            toast.success("Cliente registrado.");
            onCreated?.(created);
            handleClose();
          } catch (err) {
            const code = err instanceof Error ? err.message : "DB_ERROR";
            toast.error(
              modalActionMessage(code, "No se pudo guardar el cliente."),
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
          <ModalCancelButton onClick={handleClose} disabled={crear.isPending} />
          <ModalSubmit
            disabled={crear.isPending}
            loading={crear.isPending}
            label="Guardar"
          />
        </ModalFooter>
      </ModalForm>
    </ModalShell>
  );
}
