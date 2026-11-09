export type ClienteFormInvalid = {
  nombre: boolean;
  nit: boolean;
  direccion: boolean;
};

export function validarClienteFormulario(input: {
  nombre: string;
  nit: string;
  direccion: string;
}): ClienteFormInvalid | null {
  const invalid: ClienteFormInvalid = {
    nombre: !input.nombre.trim(),
    nit: !input.nit.trim(),
    direccion: !input.direccion.trim(),
  };
  if (invalid.nombre || invalid.nit || invalid.direccion) {
    return invalid;
  }
  return null;
}

export const clienteFormInvalidVacio: ClienteFormInvalid = {
  nombre: false,
  nit: false,
  direccion: false,
};

export function mensajeToastCamposCliente(invalid: ClienteFormInvalid): string {
  const etiquetas: string[] = [];
  if (invalid.nombre) etiquetas.push("nombre");
  if (invalid.nit) etiquetas.push("NIT");
  if (invalid.direccion) etiquetas.push("dirección");
  if (etiquetas.length === 0) {
    return "Completa los campos obligatorios del cliente.";
  }
  if (etiquetas.length === 1) {
    return `Falta completar: ${etiquetas[0]}.`;
  }
  return `Faltan completar: ${etiquetas.join(", ")}.`;
}
