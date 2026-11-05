"use client";

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
import { formatMonedaUsd, tituloPeriodoReporteria } from "./lib/helpers";
import {
  ReporteriaCard,
  ReporteriaChartTooltipFloat,
  ReporteriaChartTooltipHeader,
  ReporteriaChartTooltipList,
  ReporteriaChartTooltipShell,
  ReporteriaChartTooltipVehiculoRow,
  reporteriaChartPlotClass,
  reporteriaChartPlotOuterClass,
  ReporteriaChartClickHint,
  reporteriaChartTooltipCursorOnlyStyle,
  ReporteriaChartXTick,
  intervaloEjeReporteria,
  useReporteriaChartPinnedTooltip,
  useReporteriaEjeCompacto,
  type ReporteriaChartHoverAt,
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
  onSelect?: (punto: IngresoVehiculoPunto, at: ReporteriaChartHoverAt) => void;
}) {
  if (cx == null || cy == null || !payload) {
    return null;
  }

  const halo = 7;
  const nucleo = 4.5;

  return (
    <g
      className="cursor-pointer"
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(payload, { x: cx, y: cy });
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
  onSelect?: (punto: IngresoVehiculoPunto, at: ReporteriaChartHoverAt) => void;
}) {
  if (cx == null || cy == null || !payload) return null;

  return (
    <g
      className="cursor-pointer"
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.(payload, { x: cx, y: cy });
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

function IngresosTooltipBody({
  punto,
  pinned,
  onClose,
}: {
  punto: IngresoVehiculoPunto;
  pinned?: boolean;
  onClose?: () => void;
}) {
  const tituloFecha = tituloPeriodoReporteria(punto.fecha, punto.label);

  return (
    <ReporteriaChartTooltipShell pinned={pinned} onClose={onClose}>
      <ReporteriaChartTooltipHeader
        title={tituloFecha}
        withClose={Boolean(onClose)}
        trailing={
          punto.ingresos === 0
            ? "Sin compras"
            : `${punto.ingresos} compra${punto.ingresos === 1 ? "" : "s"}`
        }
      />
      {punto.vehiculos.length > 0 ? (
        <ReporteriaChartTooltipList count={punto.vehiculos.length}>
          {punto.vehiculos.map((vehiculo) => (
            <ReporteriaChartTooltipVehiculoRow
              key={vehiculo.id}
              titulo={vehiculo.titulo}
              montoLabel={formatMonedaUsd(vehiculo.monto)}
            />
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
  const {
    at,
    punto,
    pinned,
    syncFromChart,
    leaveChart,
    pinPunto,
    togglePinFromHover,
    clearPin,
    tooltipHandlers,
  } = useReporteriaChartPinnedTooltip<IngresoVehiculoPunto>();
  const ejeCompacto = useReporteriaEjeCompacto();

  const fijarPunto = (
    seleccion: IngresoVehiculoPunto,
    position: ReporteriaChartHoverAt,
  ) => {
    pinPunto(seleccion, position);
  };

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
            margin={{ top: 28, right: 24, left: 0, bottom: ejeCompacto ? 22 : 12 }}
            onMouseMove={syncFromChart}
            onMouseLeave={leaveChart}
            onClick={(_state, event) => {
              event?.stopPropagation?.();
              togglePinFromHover();
            }}
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
              dot={<IngresosDot onSelect={fijarPunto} />}
              activeDot={(props) => (
                <IngresosActiveDot {...props} onSelect={fijarPunto} />
              )}
            >
              <LabelList
                dataKey="ingresos"
                position="top"
                content={({ x, y, value }) => {
                  const cantidad = Number(value);
                  if (!cantidad || x == null || y == null) return null;
                  return (
                    <text
                      x={Number(x)}
                      y={Number(y) - 10}
                      textAnchor="middle"
                      className="fill-foreground text-[10px] font-bold"
                    >
                      {cantidad}
                    </text>
                  );
                }}
              />
            </Area>
          </AreaChart>
        </ResponsiveContainer>
        {punto && at ? (
          <ReporteriaChartTooltipFloat
            at={at}
            pinned={pinned}
            onDismiss={clearPin}
            {...tooltipHandlers}
          >
            <IngresosTooltipBody
              punto={punto}
              pinned={pinned}
              onClose={pinned ? clearPin : undefined}
            />
          </ReporteriaChartTooltipFloat>
        ) : null}
        {pinned && !ejeCompacto ? (
          <button
            type="button"
            aria-label="Cerrar detalle"
            className="absolute inset-0 z-[50] cursor-default"
            onClick={clearPin}
          />
        ) : null}
        </div>
        <ReporteriaChartClickHint label="Haz clic en un punto para ver los vehículos." />
      </div>
    </ReporteriaCard>
  );
}
