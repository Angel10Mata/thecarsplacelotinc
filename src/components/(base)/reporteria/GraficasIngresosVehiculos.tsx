"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TCPL_BRAND_RED } from "@/lib/brand-colors";
import { formatFechaManualGt } from "@/lib/fechas-gt";
import { formatMonedaUsd, tituloPeriodoReporteria } from "./lib/helpers";
import {
  ReporteriaCard,
  ReporteriaChartTooltipFloat,
  ReporteriaChartTooltipList,
  ReporteriaChartTooltipShell,
  reporteriaChartPlotClass,
  reporteriaChartPlotOuterClass,
  reporteriaChartTooltipCursorOnlyStyle,
  ReporteriaChartXTick,
  ReporteriaVehiculosModal,
  intervaloEjeReporteria,
  useReporteriaChartPinnedTooltip,
  useReporteriaEjeCompacto,
} from "./lib/reporteria-ui";
import type { IngresoVehiculoPunto } from "./lib/zod";

type IngresosDotProps = {
  cx?: number;
  cy?: number;
  payload?: IngresoVehiculoPunto;
};

function IngresosDot({
  cx,
  cy,
  payload,
  onSelect,
}: IngresosDotProps & {
  onSelect?: (punto: IngresoVehiculoPunto) => void;
}) {
  if (cx == null || cy == null || !payload || payload.ingresos <= 0) {
    return null;
  }

  const halo = 7;
  const nucleo = 4.5;

  return (
    <g
      className="cursor-pointer"
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(payload);
      }}
    >
      <circle cx={cx} cy={cy} r={18} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={halo}
        fill={TCPL_BRAND_RED.primary}
        fillOpacity={0.18}
      />
      <circle
        cx={cx}
        cy={cy}
        r={nucleo}
        fill={TCPL_BRAND_RED.primary}
        stroke="#ffffff"
        strokeWidth={2}
      />
    </g>
  );
}

function IngresosActiveDot({
  cx,
  cy,
  payload,
  onSelect,
}: IngresosDotProps & {
  onSelect?: (punto: IngresoVehiculoPunto) => void;
}) {
  if (cx == null || cy == null || !payload) return null;

  return (
    <g
      className="cursor-pointer"
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(payload);
      }}
    >
      <circle cx={cx} cy={cy} r={20} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={TCPL_BRAND_RED.bright}
        stroke="#ffffff"
        strokeWidth={2}
      />
    </g>
  );
}

function IngresosTooltipBody({ punto }: { punto: IngresoVehiculoPunto }) {
  const tituloFecha =
    punto.fecha.length === 10
      ? formatFechaManualGt(punto.fecha)
      : punto.label;

  return (
    <ReporteriaChartTooltipShell>
      <p className="text-xs font-bold uppercase tracking-widest text-brand dark:text-brand-bright">
        {tituloFecha}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {punto.ingresos === 0
          ? "Sin compras"
          : `${punto.ingresos} compra${punto.ingresos === 1 ? "" : "s"}`}
      </p>
      {punto.vehiculos.length > 0 ? (
        <ReporteriaChartTooltipList count={punto.vehiculos.length}>
          {punto.vehiculos.map((vehiculo) => (
            <li
              key={vehiculo.id}
              className="break-words text-xs font-medium text-muted-foreground"
            >
              <span className="font-bold text-foreground">{vehiculo.titulo}</span>
              {" · "}
              {formatMonedaUsd(vehiculo.monto)}
            </li>
          ))}
        </ReporteriaChartTooltipList>
      ) : null}
    </ReporteriaChartTooltipShell>
  );
}

type GraficasIngresosVehiculosProps = {
  puntos: IngresoVehiculoPunto[];
  registrados: number;
};

export function GraficasIngresosVehiculos({
  puntos,
  registrados,
}: GraficasIngresosVehiculosProps) {
  const { at, punto, syncFromChart, leaveChart, tooltipHandlers } =
    useReporteriaChartPinnedTooltip<IngresoVehiculoPunto>();
  const ejeCompacto = useReporteriaEjeCompacto();
  const [detalle, setDetalle] = useState<IngresoVehiculoPunto | null>(null);

  const abrirDetalle = (seleccion: IngresoVehiculoPunto | null) => {
    if (seleccion) setDetalle(seleccion);
  };

  const tituloDetalle = detalle
    ? tituloPeriodoReporteria(detalle.fecha, detalle.label)
    : "";
  const leadDetalle = detalle
    ? detalle.ingresos === 0
      ? "Sin compras"
      : `${detalle.ingresos} compra${detalle.ingresos === 1 ? "" : "s"}`
    : "";

  return (
    <ReporteriaCard
      title="Vehículos"
      headerAside={
        <span className="text-lg font-black tabular-nums tracking-tight text-foreground md:text-xl">
          {registrados}
        </span>
      }
    >
      <div className={reporteriaChartPlotOuterClass}>
        <div className={reporteriaChartPlotClass}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={puntos}
            margin={{ top: 28, right: 12, left: 0, bottom: ejeCompacto ? 22 : 8 }}
            onMouseMove={syncFromChart}
            onMouseLeave={leaveChart}
            onClick={() => abrirDetalle(punto)}
          >
            <defs>
              <linearGradient id="ingresosVehiculosFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={TCPL_BRAND_RED.primary}
                  stopOpacity={0.32}
                />
                <stop
                  offset="100%"
                  stopColor={TCPL_BRAND_RED.primary}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 6"
              className="stroke-zinc-200 dark:stroke-zinc-700"
              vertical={false}
            />
            <XAxis
              dataKey="fecha"
              tickLine={false}
              axisLine={false}
              interval={intervaloEjeReporteria(puntos.length, ejeCompacto)}
              minTickGap={0}
              height={ejeCompacto ? 36 : 28}
              tick={(props) => (
                <ReporteriaChartXTick
                  x={props.x}
                  y={props.y}
                  label={puntos[props.index]?.label ?? ""}
                  compact={ejeCompacto}
                />
              )}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, "auto"]}
              tickLine={false}
              axisLine={false}
              width={28}
              tick={{ fontSize: 11, fontWeight: 600 }}
              className="fill-muted-foreground"
            />
            <Tooltip
              wrapperStyle={reporteriaChartTooltipCursorOnlyStyle}
              cursor={{
                stroke: TCPL_BRAND_RED.primary,
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={() => null}
            />
            <Area
              type="linear"
              dataKey="ingresos"
              stroke={TCPL_BRAND_RED.primary}
              strokeWidth={2.5}
              fill="url(#ingresosVehiculosFill)"
              dot={<IngresosDot onSelect={abrirDetalle} />}
              activeDot={(props) => (
                <IngresosActiveDot {...props} onSelect={abrirDetalle} />
              )}
            >
              <LabelList
                dataKey="ingresos"
                position="top"
                content={({ x, y, value, index }) => {
                  const cantidad = Number(value);
                  if (!cantidad || x == null || y == null) return null;
                  const seleccionado =
                    typeof index === "number" ? puntos[index] : undefined;
                  return (
                    <text
                      x={Number(x)}
                      y={Number(y) - 10}
                      textAnchor="middle"
                      className="fill-foreground cursor-pointer text-[10px] font-bold"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (seleccionado) abrirDetalle(seleccionado);
                      }}
                    >
                      {cantidad}
                    </text>
                  );
                }}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
        {punto ? (
          <ReporteriaChartTooltipFloat at={at} {...tooltipHandlers}>
            <IngresosTooltipBody punto={punto} />
          </ReporteriaChartTooltipFloat>
        ) : null}
        </div>
      </div>
      <ReporteriaVehiculosModal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        title={tituloDetalle}
        lead={leadDetalle}
        vehiculos={detalle?.vehiculos ?? []}
      />
    </ReporteriaCard>
  );
}
