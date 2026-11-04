import { mesCalendarioGt, normalizarFechaCalendario } from "@/lib/fechas-gt";

export type VehiculosFiltroMesAnio = {
  mes: string;
  alcance: "all" | "year" | "month";
};

export function filtroMesAnioPorDefecto(): VehiculosFiltroMesAnio {
  return { mes: mesCalendarioGt(), alcance: "all" };
}

export function vehiculoCoincideFiltroMesAnio(
  invoiceDate: string,
  filtro: VehiculosFiltroMesAnio,
): boolean {
  if (filtro.alcance === "all") return true;
  const fecha = normalizarFechaCalendario(invoiceDate);
  if (!fecha) return false;
  const anio = filtro.mes.slice(0, 4);
  if (filtro.alcance === "year") {
    return fecha.startsWith(`${anio}-`);
  }
  return fecha.slice(0, 7) === filtro.mes;
}

export function seleccionarTodosFiltroVehiculos(
  filtro: VehiculosFiltroMesAnio,
): VehiculosFiltroMesAnio {
  return { ...filtro, alcance: "all" };
}

export function seleccionarAnioFiltroVehiculos(
  filtro: VehiculosFiltroMesAnio,
  year: number,
): VehiculosFiltroMesAnio {
  const mes = `${year}-${filtro.mes.slice(5, 7)}`;
  return { mes, alcance: "year" };
}

export function seleccionarMesFiltroVehiculos(
  filtro: VehiculosFiltroMesAnio,
  mes: string,
): VehiculosFiltroMesAnio {
  return { mes, alcance: "month" };
}

export function etiquetaMesFiltroVehiculos(filtro: VehiculosFiltroMesAnio): string {
  const month = Number(filtro.mes.slice(5, 7));
  const nombres = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ] as const;
  return nombres[month - 1] ?? filtro.mes;
}

export function etiquetaFiltroMesAnioVehiculos(
  filtro: VehiculosFiltroMesAnio,
): string {
  if (filtro.alcance === "all") return "Todos";
  if (filtro.alcance === "year") return filtro.mes.slice(0, 4);
  return etiquetaMesFiltroVehiculos(filtro);
}
