"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
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
  ReporteriaChartTooltipList,
  ReporteriaChartTooltipShell,
  formatMontoCompactoUsd,
  reporteriaChartPlotClass,
  reporteriaChartPlotOuterClass,
  reporteriaChartTooltipCursorOnlyStyle,
  reporteriaPuntoDesdeClick,
  ReporteriaChartXTick,
  ReporteriaVehiculosModal,
  intervaloEjeReporteria,
  useReporteriaChartPinnedTooltip,
  useReporteriaEjeCompacto,
} from "./lib/reporteria-ui";
import type { DineroMesPunto } from "./lib/zod";

const COLOR_COMPRA_SALIDA = TCPL_BRAND_RED.primary;

function DineroTooltipBody({ punto }: { punto: DineroMesPunto }) {
  return (
    <ReporteriaChartTooltipShell>
      <p className="text-xs font-bold uppercase tracking-widest text-brand dark:text-brand-bright">
        {punto.label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {punto.vendido <= 0
          ? "Sin compras"
          : `Compra de: ${formatMonedaUsd(punto.vendido)}`}
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

type GraficasDineroVehiculosProps = {
  puntos: DineroMesPunto[];
  vendido: number;
};

export function GraficasDineroVehiculos({
  puntos,
  vendido,
}: GraficasDineroVehiculosProps) {
  const { at, punto, syncFromChart, leaveChart, tooltipHandlers } =
    useReporteriaChartPinnedTooltip<DineroMesPunto>();
  const ejeCompacto = useReporteriaEjeCompacto();
  const [detalle, setDetalle] = useState<DineroMesPunto | null>(null);

  const abrirDetalle = (seleccion: DineroMesPunto | null) => {
    if (seleccion) setDetalle(seleccion);
  };

  return (
    <ReporteriaCard
      title="Compra"
      headerAside={
        <span className="text-lg font-black tabular-nums tracking-tight text-foreground md:text-xl">
          {formatMonedaUsd(vendido)}
        </span>
      }
    >
      <div className={reporteriaChartPlotOuterClass}>
        <div className={reporteriaChartPlotClass}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={puntos}
            margin={{ top: 28, right: 10, left: 4, bottom: ejeCompacto ? 22 : 8 }}
            onMouseMove={syncFromChart}
            onMouseLeave={leaveChart}
          >
            <CartesianGrid
              strokeDasharray="4 6"
              className="stroke-zinc-200 dark:stroke-zinc-700"
              vertical={false}
            />
            <XAxis
              dataKey="mes"
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
              tickLine={false}
              axisLine={false}
              width={72}
              tickFormatter={(value: number) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  notation: "compact",
                  maximumFractionDigits: 1,
                }).format(value)
              }
              tick={{ fontSize: 11, fontWeight: 600 }}
              className="fill-muted-foreground"
            />
            <Tooltip
              wrapperStyle={reporteriaChartTooltipCursorOnlyStyle}
              cursor={{ fill: "rgb(24 24 27 / 0.06)" }}
              content={() => null}
            />
            <Bar
              dataKey="vendido"
              fill={COLOR_COMPRA_SALIDA}
              radius={[8, 8, 0, 0]}
              className="cursor-pointer"
              onClick={(data, index) =>
                abrirDetalle(reporteriaPuntoDesdeClick(data, index, puntos))
              }
            >
              <LabelList
                dataKey="vendido"
                position="top"
                content={({ x, y, width, value }) => {
                  const monto = Number(value);
                  if (!monto || x == null || y == null || width == null) return null;
                  return (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) - 6}
                      textAnchor="middle"
                      className="fill-foreground text-[10px] font-bold"
                    >
                      {formatMontoCompactoUsd(monto)}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        {punto ? (
          <ReporteriaChartTooltipFloat at={at} {...tooltipHandlers}>
            <DineroTooltipBody punto={punto} />
          </ReporteriaChartTooltipFloat>
        ) : null}
        </div>
      </div>
      <ReporteriaVehiculosModal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        title={detalle ? tituloPeriodoReporteria(detalle.mes, detalle.label) : ""}
        lead={
          detalle
            ? detalle.vendido <= 0
              ? "Sin compras"
              : `Compra de: ${formatMonedaUsd(detalle.vendido)}`
            : ""
        }
        vehiculos={detalle?.vehiculos ?? []}
      />
    </ReporteriaCard>
  );
}
