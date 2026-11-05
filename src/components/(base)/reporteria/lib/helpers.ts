import { DEFAULT_CAR_STATUS, formatMarcaModeloDisplay } from "@/components/(base)/vehiculos/lib/helpers";
import {
  fechaCalendarioGt,
  formatFechaCalendarioGt,
  formatFechaManualGt,
  LOCALE_GT,
  TIMEZONE_GT,
  timestamptzToFechaCalendarioGt,
  ultimoDiaMesCalendario,
} from "@/lib/fechas-gt";
import type {
  DineroMesPunto,
  DineroVehiculoLinea,
  IngresoVehiculoMarca,
  IngresoVehiculoPunto,
  RankingCliente,
  ReporteriaCampoFecha,
  ReporteriaFiltroCalendario,
  ReporteriaPeriodo,
  ReporteriaVehiculoRow,
  ReporteriaVista,
} from "./zod";

export const REPORTERIA_PERIODOS: ReporteriaPeriodo[] = [7, 30, 90, "all"];
export const REPORTERIA_INGRESOS_DIAS = 30;

function addDaysCalendario(fecha: string, days: number): string {
  const [year, month, day] = fecha.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  utc.setUTCDate(utc.getUTCDate() + days);
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const d = String(utc.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addMonthsCalendario(mes: string, months: number): string {
  const [year, month] = mes.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1 + months, 1, 12, 0, 0));
  const y = utc.getUTCFullYear();
  const m = String(utc.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function diasEntre(inicio: string, fin: string): number {
  const [y1, m1, d1] = inicio.split("-").map(Number);
  const [y2, m2, d2] = fin.split("-").map(Number);
  const a = Date.UTC(y1, m1 - 1, d1);
  const b = Date.UTC(y2, m2 - 1, d2);
  return Math.round((b - a) / 86_400_000);
}

export function montoVehiculo(row: ReporteriaVehiculoRow): number {
  const amount = row.car_price ?? row.total;
  return Number.isFinite(amount) ? amount : 0;
}

export function estatusVehiculo(row: ReporteriaVehiculoRow): string {
  return row.car_status?.trim().toUpperCase() || DEFAULT_CAR_STATUS;
}

export function fechaFilaVehiculo(
  row: ReporteriaVehiculoRow,
  campo: ReporteriaCampoFecha,
): string {
  const raw = campo === "factura" ? row.invoice_date : row.created_at;
  return timestamptzToFechaCalendarioGt(raw);
}

export function resolverRangoPeriodo(
  rows: ReporteriaVehiculoRow[],
  campo: ReporteriaCampoFecha,
  periodo: ReporteriaPeriodo,
  hoy = fechaCalendarioGt(),
): { inicio: string; fin: string } {
  if (periodo !== "all") {
    return { inicio: addDaysCalendario(hoy, -(periodo - 1)), fin: hoy };
  }

  let inicio = hoy;
  for (const row of rows) {
    const fecha = fechaFilaVehiculo(row, campo);
    if (fecha && fecha < inicio) inicio = fecha;
  }
  return { inicio, fin: hoy };
}

export function filasEnPeriodo(
  rows: ReporteriaVehiculoRow[],
  campo: ReporteriaCampoFecha,
  inicio: string,
  fin: string,
): ReporteriaVehiculoRow[] {
  return rows.filter((row) => {
    const fecha = fechaFilaVehiculo(row, campo);
    return Boolean(fecha) && fecha >= inicio && fecha <= fin;
  });
}

export function mapIngresoVehiculoMarca(
  row: ReporteriaVehiculoRow,
): IngresoVehiculoMarca {
  return {
    id: row.id,
    titulo: formatMarcaModeloDisplay(row.car_title, row.car_model),
    factura: row.invoice_number,
    monto: montoVehiculo(row),
  };
}

function mapDineroVehiculoLinea(row: ReporteriaVehiculoRow): DineroVehiculoLinea {
  return {
    id: row.id,
    titulo: formatMarcaModeloDisplay(row.car_title, row.car_model),
    factura: row.invoice_number,
    monto: montoVehiculo(row),
  };
}

type DineroBucket = {
  vendido: number;
  lote: number;
  vehiculos: DineroVehiculoLinea[];
};

function vacioDineroBucket(): DineroBucket {
  return { vendido: 0, lote: 0, vehiculos: [] };
}

function acumularDineroFila(bucket: DineroBucket, row: ReporteriaVehiculoRow): void {
  const monto = montoVehiculo(row);
  if (estatusVehiculo(row) === "AVAILABLE") {
    bucket.lote += monto;
    return;
  }
  bucket.vendido += monto;
  bucket.vehiculos.push(mapDineroVehiculoLinea(row));
}

export function buildIngresosVehiculosSerie(
  rows: ReporteriaVehiculoRow[],
  campo: ReporteriaCampoFecha,
  inicio: string,
  fin: string,
): IngresoVehiculoPunto[] {
  const porClave = new Map<string, IngresoVehiculoMarca[]>();

  for (const row of rows) {
    const fecha = fechaFilaVehiculo(row, campo);
    if (!fecha) continue;
    const clave = diasEntre(inicio, fin) > 90 ? fecha.slice(0, 7) : fecha;
    const actuales = porClave.get(clave) ?? [];
    actuales.push(mapIngresoVehiculoMarca(row));
    porClave.set(clave, actuales);
  }

  if (diasEntre(inicio, fin) > 90) {
    const puntos: IngresoVehiculoPunto[] = [];
    let mes = inicio.slice(0, 7);
    const mesFin = fin.slice(0, 7);
    while (mes <= mesFin) {
      const vehiculos = porClave.get(mes) ?? [];
      puntos.push({
        fecha: mes,
        label: etiquetaEjeMesGrafica(mes, inicio, fin),
        ingresos: vehiculos.length,
        vehiculos,
      });
      mes = addMonthsCalendario(mes, 1);
    }
    return puntos;
  }

  const puntos: IngresoVehiculoPunto[] = [];
  const totalDias = diasEntre(inicio, fin) + 1;

  if (totalDias === 1) {
    const vehiculos = rows.map(mapIngresoVehiculoMarca);
    puntos.push({
      fecha: inicio,
      label: formatFechaCalendarioGt(inicio, {
        day: "2-digit",
        month: "short",
      }),
      ingresos: vehiculos.length,
      vehiculos,
    });
    return puntos;
  }

  for (let offset = 0; offset < totalDias; offset += 1) {
    const fecha = addDaysCalendario(inicio, offset);
    const vehiculos = porClave.get(fecha) ?? [];
    puntos.push({
      fecha,
      label: formatFechaCalendarioGt(fecha, {
        day: "2-digit",
        month: "short",
      }),
      ingresos: vehiculos.length,
      vehiculos,
    });
  }
  return puntos;
}

export function expandirPuntosGraficaCompras(
  puntos: IngresoVehiculoPunto[],
  diaActivo?: string,
): IngresoVehiculoPunto[] {
  if (puntos.length !== 1 || puntos[0].fecha.length !== 10) return puntos;

  const central =
    diaActivo && diaActivo.length === 10
      ? { ...puntos[0], fecha: diaActivo, label: formatFechaCalendarioGt(diaActivo, { day: "2-digit", month: "short" }) }
      : puntos[0];
  const vacio = (fecha: string): IngresoVehiculoPunto => ({
    fecha,
    label: formatFechaCalendarioGt(fecha, {
      day: "2-digit",
      month: "short",
    }),
    ingresos: 0,
    vehiculos: [],
  });

  return [
    vacio(addDaysCalendario(central.fecha, -1)),
    central,
    vacio(addDaysCalendario(central.fecha, 1)),
  ];
}

export function resumenIngresosVehiculos(puntos: IngresoVehiculoPunto[]) {
  const vehiculos = puntos.reduce((acc, punto) => acc + punto.ingresos, 0);
  const ultimo = [...puntos].reverse().find((punto) => punto.ingresos > 0);

  return {
    vehiculos,
    ultimoFechaLabel: ultimo
      ? ultimo.fecha.length === 7
        ? formatFechaCalendarioGt(`${ultimo.fecha}-01`, {
            month: "short",
            year: "numeric",
          })
        : formatFechaManualGt(ultimo.fecha)
      : "—",
  };
}

export function formatMonedaUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function resumenDineroVehiculos(rows: ReporteriaVehiculoRow[]) {
  let vendido = 0;
  let lote = 0;
  let unidadesVendidas = 0;
  let unidadesLote = 0;

  for (const row of rows) {
    const monto = montoVehiculo(row);
    if (estatusVehiculo(row) === "AVAILABLE") {
      lote += monto;
      unidadesLote += 1;
    } else {
      vendido += monto;
      unidadesVendidas += 1;
    }
  }

  return { vendido, lote, unidadesVendidas, unidadesLote };
}

export function buildDineroPorMes(
  rows: ReporteriaVehiculoRow[],
  campo: ReporteriaCampoFecha,
  inicio: string,
  fin: string,
): DineroMesPunto[] {
  const span = diasEntre(inicio, fin);

  if (span > 90) {
    const porMes = new Map<string, DineroBucket>();

    for (const row of rows) {
      const fecha = fechaFilaVehiculo(row, campo);
      if (!fecha || fecha < inicio || fecha > fin) continue;
      const mes = fecha.slice(0, 7);
      const actual = porMes.get(mes) ?? vacioDineroBucket();
      acumularDineroFila(actual, row);
      porMes.set(mes, actual);
    }

    const puntos: DineroMesPunto[] = [];
    let mes = inicio.slice(0, 7);
    const mesFin = fin.slice(0, 7);
    while (mes <= mesFin) {
      const valores = porMes.get(mes) ?? vacioDineroBucket();
      puntos.push({
        mes,
        label: etiquetaEjeMesGrafica(mes, inicio, fin),
        vendido: valores.vendido,
        lote: valores.lote,
        vehiculos: valores.vehiculos,
      });
      mes = addMonthsCalendario(mes, 1);
    }
    return puntos;
  }

  const porDia = new Map<string, DineroBucket>();

  for (const row of rows) {
    const fecha = fechaFilaVehiculo(row, campo);
    if (!fecha || fecha < inicio || fecha > fin) continue;
    const actual = porDia.get(fecha) ?? vacioDineroBucket();
    acumularDineroFila(actual, row);
    porDia.set(fecha, actual);
  }

  const puntos: DineroMesPunto[] = [];
  for (let offset = 0; offset <= span; offset += 1) {
    const fecha = addDaysCalendario(inicio, offset);
    const valores = porDia.get(fecha) ?? vacioDineroBucket();
    puntos.push({
      mes: fecha,
      label: formatFechaCalendarioGt(fecha, {
        day: "2-digit",
        month: "short",
      }),
      vendido: valores.vendido,
      lote: valores.lote,
      vehiculos: valores.vehiculos,
    });
  }
  return puntos;
}

export function buildRankingClientes(
  rows: ReporteriaVehiculoRow[],
): RankingCliente[] {
  const porCliente = new Map<string, RankingCliente>();

  for (const row of rows) {
    const id = row.customer_id ?? "sin-cliente";
    const actual = porCliente.get(id) ?? {
      id,
      nombre: row.clienteNombre?.trim() || "Sin cliente",
      nit: row.clienteNit,
      unidades: 0,
      monto: 0,
    };
    actual.unidades += 1;
    actual.monto += montoVehiculo(row);
    porCliente.set(id, actual);
  }

  return [...porCliente.values()].sort((a, b) => {
    if (b.monto !== a.monto) return b.monto - a.monto;
    return b.unidades - a.unidades;
  });
}

export function etiquetaPeriodo(periodo: ReporteriaPeriodo): string {
  if (periodo === "all") return "Todo el historial";
  return `Últimos ${periodo} días`;
}

const MESES_LARGOS = [
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

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function etiquetaEjeMesGrafica(mes: string, inicio: string, fin: string): string {
  const mismoAnio = inicio.slice(0, 4) === fin.slice(0, 4);
  const masDeUnMes = diasEntre(inicio, fin) > 31;
  return formatFechaCalendarioGt(`${mes}-01`, {
    month: "short",
    ...(mismoAnio && masDeUnMes ? {} : { year: "numeric" }),
  });
}

function ultimoDiaMes(mes: string): string {
  const [year, month] = mes.split("-").map(Number);
  return `${mes}-${pad2(ultimoDiaMesCalendario(year, month))}`;
}

export function filtroCalendarioInicial(
  hoy = fechaCalendarioGt(),
): ReporteriaFiltroCalendario {
  const mes = hoy.slice(0, 7);
  return {
    vista: "mes",
    dia: hoy,
    mes,
    alcance: "year",
    semana: 1,
    rangoInicio: `${mes}-01`,
    rangoFin: hoy,
  };
}

export function etiquetaSoloMes(mes: string): string {
  const month = Number(mes.slice(5, 7));
  const nombre = MESES_LARGOS[month - 1];
  return nombre ?? mes;
}

export function etiquetaMesPickerTrigger(
  filtro: Pick<ReporteriaFiltroCalendario, "alcance" | "mes">,
): string {
  if (filtro.alcance === "year") return "Todos los meses";
  return etiquetaSoloMes(filtro.mes);
}

export function etiquetaAnioPicker(
  filtro: Pick<ReporteriaFiltroCalendario, "alcance" | "mes">,
): string {
  if (filtro.alcance === "year") return filtro.mes.slice(0, 4);
  return etiquetaSoloMes(filtro.mes);
}

export function etiquetaMesLargo(mes: string): string {
  const [year, month] = mes.split("-").map(Number);
  const nombre = MESES_LARGOS[month - 1];
  return nombre ? `${nombre} ${year}` : mes;
}

export function tituloPeriodoReporteria(clave: string, fallback = ""): string {
  if (clave.length === 7) return etiquetaMesLargo(clave);
  if (clave.length === 10) return formatFechaManualGt(clave);
  return fallback || clave;
}

function capAbreviaturaEje(value: string): string {
  const limpio = value.replace(/\./g, "").trim();
  if (!limpio) return limpio;
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
}

export function lineasEjeFechaReporteria(label: string): [string, string | null] {
  const partes = label.replace(/\./g, "").replace(/\s+/g, " ").trim().split(" ");
  const ultima = partes[partes.length - 1] ?? "";
  if (partes.length >= 2 && /^\d{4}$/.test(ultima)) {
    return [capAbreviaturaEje(partes.slice(0, -1).join(" ")).slice(0, 3), ultima.slice(2)];
  }
  if (partes.length >= 2 && /^\d{1,2}$/.test(partes[0] ?? "")) {
    return [partes[0], capAbreviaturaEje(partes.slice(1).join(" "))];
  }
  return [label, null];
}

export function totalSemanasMes(mes: string): number {
  const [year, month] = mes.split("-").map(Number);
  return Math.ceil(ultimoDiaMesCalendario(year, month) / 7);
}

export function etiquetaRangoSemanaCorto(inicio: string, fin: string): string {
  const parte = (iso: string) => {
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const abbr = new Intl.DateTimeFormat(LOCALE_GT, {
      weekday: "short",
      timeZone: TIMEZONE_GT,
    })
      .format(date)
      .replace(/\./g, "")
      .trim();
    const cap = abbr.charAt(0).toUpperCase() + abbr.slice(1);
    return `${cap} ${day}`;
  };
  return `${parte(inicio)} - ${parte(fin)}`;
}

export function opcionesAlcanceMesSelect(
  mes: string,
): Array<{ value: number; label: string }> {
  const total = totalSemanasMes(mes);
  const opciones: Array<{ value: number; label: string }> = [];
  for (let semana = 1; semana <= total; semana += 1) {
    const { inicio, fin } = rangoSemanaMes(mes, semana);
    opciones.push({
      value: semana,
      label: etiquetaRangoSemanaCorto(inicio, fin),
    });
  }
  return opciones;
}

export function etiquetaAlcanceMesTrigger(
  filtro: Pick<ReporteriaFiltroCalendario, "alcance" | "mes" | "semana">,
): string {
  if (filtro.alcance === "year") return "Todo el año";
  if (filtro.alcance === "month") return "Semana";
  const { inicio, fin } = rangoSemanaMes(filtro.mes, filtro.semana);
  return etiquetaRangoSemanaCorto(inicio, fin);
}

export function aplicarAlcanceMesSelect(
  filtro: ReporteriaFiltroCalendario,
  raw: string,
): ReporteriaFiltroCalendario {
  const semana = Number(raw);
  return { ...filtro, alcance: "week", semana };
}

export function rangoSemanaMes(
  mes: string,
  semana: number,
): { inicio: string; fin: string } {
  const last = ultimoDiaMes(mes);
  const startDay = (semana - 1) * 7 + 1;
  const endIso = addDaysCalendario(`${mes}-01`, semana * 7 - 1);
  return {
    inicio: `${mes}-${pad2(startDay)}`,
    fin: endIso > last ? last : endIso,
  };
}

export function resolverRangoCalendario(
  filtro: ReporteriaFiltroCalendario,
): { inicio: string; fin: string } {
  if (filtro.vista === "dia") {
    return { inicio: filtro.dia, fin: filtro.dia };
  }
  if (filtro.vista === "rango") {
    const inicio =
      filtro.rangoInicio <= filtro.rangoFin
        ? filtro.rangoInicio
        : filtro.rangoFin;
    const fin =
      filtro.rangoInicio <= filtro.rangoFin
        ? filtro.rangoFin
        : filtro.rangoInicio;
    return { inicio, fin };
  }
  if (filtro.alcance === "year") {
    const year = filtro.mes.slice(0, 4);
    return { inicio: `${year}-01-01`, fin: `${year}-12-31` };
  }
  if (filtro.alcance === "month") {
    return { inicio: `${filtro.mes}-01`, fin: ultimoDiaMes(filtro.mes) };
  }
  return rangoSemanaMes(filtro.mes, filtro.semana);
}

export function resolverRangoGraficaCompras(
  filtro: ReporteriaFiltroCalendario,
): { inicio: string; fin: string } {
  return resolverRangoCalendario(filtro);
}

export function opcionesMesesAnio(
  mesActual: string,
): Array<{ value: string; label: string }> {
  const year = mesActual.slice(0, 4);
  return MESES_LARGOS.map((label, index) => ({
    value: `${year}-${pad2(index + 1)}`,
    label,
  }));
}

export function moverAnioFiltroCalendario(
  filtro: ReporteriaFiltroCalendario,
  direccion: -1 | 1,
): ReporteriaFiltroCalendario {
  const [year, month] = filtro.mes.split("-").map(Number);
  const mes = `${year + direccion}-${pad2(month)}`;
  return { ...filtro, mes, alcance: "month", semana: 1, dia: `${mes}-01` };
}

export function seleccionarAnioMesPicker(
  filtro: ReporteriaFiltroCalendario,
  year: number,
): ReporteriaFiltroCalendario {
  const mes = `${year}-${filtro.mes.slice(5, 7)}`;
  return {
    ...filtro,
    mes,
    alcance: "year",
    semana: 1,
    dia: `${mes}-01`,
  };
}

export function seleccionarMesMesPicker(
  filtro: ReporteriaFiltroCalendario,
  mes: string,
): ReporteriaFiltroCalendario {
  return {
    ...filtro,
    mes,
    alcance: "month",
    semana: 1,
    dia: `${mes}-01`,
  };
}

export function etiquetaFiltroCalendario(
  filtro: ReporteriaFiltroCalendario,
): string {
  if (filtro.vista === "dia") {
    return formatFechaManualGt(filtro.dia);
  }
  if (filtro.vista === "rango") {
    const { inicio, fin } = resolverRangoCalendario(filtro);
    return `${formatFechaManualGt(inicio)} – ${formatFechaManualGt(fin)}`;
  }
  if (filtro.alcance === "year") {
    return `Año ${filtro.mes.slice(0, 4)}`;
  }
  if (filtro.alcance === "month") {
    return etiquetaMesLargo(filtro.mes);
  }
  return `${etiquetaMesLargo(filtro.mes)}, semana ${filtro.semana}`;
}

export function moverFiltroCalendario(
  filtro: ReporteriaFiltroCalendario,
  direccion: -1 | 1,
): ReporteriaFiltroCalendario {
  if (filtro.vista === "dia") {
    const dia = addDaysCalendario(filtro.dia, direccion);
    return {
      ...filtro,
      dia,
      mes: dia.slice(0, 7),
      alcance: "month",
      semana: 1,
    };
  }
  if (filtro.vista === "rango") {
    const { inicio, fin } = resolverRangoCalendario(filtro);
    const largo = diasEntre(inicio, fin);
    return {
      ...filtro,
      rangoInicio: addDaysCalendario(inicio, direccion * (largo + 1)),
      rangoFin: addDaysCalendario(fin, direccion * (largo + 1)),
    };
  }
  const mes = addMonthsCalendario(filtro.mes, direccion);
  return { ...filtro, mes, alcance: "month", semana: 1, dia: `${mes}-01` };
}

export function cambiarVistaFiltro(
  filtro: ReporteriaFiltroCalendario,
  vista: ReporteriaVista,
): ReporteriaFiltroCalendario {
  if (vista === "dia") {
    const hoy = fechaCalendarioGt();
    let dia = filtro.dia;
    if (!dia || !dia.startsWith(filtro.mes)) {
      dia = filtro.mes === hoy.slice(0, 7) ? hoy : ultimoDiaMes(filtro.mes);
    }
    return { ...filtro, vista, dia };
  }
  if (vista === "rango") {
    return {
      ...filtro,
      vista,
      rangoInicio: `${filtro.mes}-01`,
      rangoFin: ultimoDiaMes(filtro.mes),
    };
  }
  return {
    ...filtro,
    vista,
    mes: filtro.dia.slice(0, 7),
    alcance: "year",
    semana: 1,
  };
}
