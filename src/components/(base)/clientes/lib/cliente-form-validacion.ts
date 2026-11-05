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
