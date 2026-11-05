"use client";

import { useRef } from "react";
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
  ReporteriaChartTooltipHeader,
  ReporteriaChartTooltipList,
  ReporteriaChartTooltipShell,
  ReporteriaChartTooltipVehiculoRow,
  formatMontoCompactoUsd,
  reporteriaChartPlotClass,
  reporteriaChartPlotOuterClass,
  ReporteriaChartClickHint,
  reporteriaChartTooltipAtFromBarTarget,
  reporteriaChartTooltipCursorOnlyStyle,
  reporteriaPuntoDesdeClick,
  ReporteriaChartXTick,
  intervaloEjeReporteria,
  useReporteriaChartPinnedTooltip,
  useReporteriaEjeCompacto,
} from "./lib/reporteria-ui";
import type { DineroMesPunto } from "./lib/zod";

const COLOR_COMPRA_SALIDA = TCPL_BRAND_RED.primary;

function DineroTooltipBody({
  punto,
  pinned,
  onClose,
}: {
  punto: DineroMesPunto;
  pinned?: boolean;
  onClose?: () => void;
}) {
  return (
    <ReporteriaChartTooltipShell pinned={pinned} onClose={onClose}>
      <ReporteriaChartTooltipHeader
        title={tituloPeriodoReporteria(punto.mes, punto.label)}
        withClose={Boolean(onClose)}
        trailing={
          punto.vendido <= 0
            ? "Sin compras"
            : formatMonedaUsd(punto.vendido)
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

type GraficasDineroVehiculosProps = {
  puntos: DineroMesPunto[];
  vendido: number;
};

export function GraficasDineroVehiculos({
  puntos,
  vendido,
}: GraficasDineroVehiculosProps) {
  const {
    at,
    punto,
    pinned,
    leaveChart,
    pinPunto,
    showAt,
    togglePinFromHover,
    clearPin,
    tooltipHandlers,
  } = useReporteriaChartPinnedTooltip<DineroMesPunto>();
  const plotRef = useRef<HTMLDivElement>(null);
  const ejeCompacto = useReporteriaEjeCompacto();

  const posicionDesdeBar = (nativeEvent: Event | undefined) =>
    reporteriaChartTooltipAtFromBarTarget(nativeEvent, plotRef.current);

  const fijarDesdeBar = (
    data: unknown,
    index: unknown,
    nativeEvent?: Event,
  ) => {
    const seleccion = reporteriaPuntoDesdeClick(data, index, puntos);
    if (!seleccion) return;
    const position = posicionDesdeBar(nativeEvent);
    if (!position) return;
    pinPunto(seleccion, position);
  };

  const hoverBar = (data: unknown, index: unknown, nativeEvent?: Event) => {
    if (pinned) return;
    const seleccion = reporteriaPuntoDesdeClick(data, index, puntos);
    const position = posicionDesdeBar(nativeEvent);
    if (!seleccion || !position) return;
    showAt(seleccion, position);
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
        <div ref={plotRef} className={reporteriaChartPlotClass}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={puntos}
            margin={{ top: 28, right: 24, left: 4, bottom: ejeCompacto ? 22 : 12 }}
            onMouseLeave={leaveChart}
            onClick={(_state, event) => {
              event?.stopPropagation?.();
              togglePinFromHover();
            }}
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
              onMouseEnter={(_entry, index, event) => {
                hoverBar(_entry, index, event.nativeEvent);
              }}
              onClick={(data, index, event) => {
                event?.stopPropagation();
                fijarDesdeBar(data, index, event.nativeEvent);
              }}
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
        {punto && at ? (
          <ReporteriaChartTooltipFloat
            at={at}
            pinned={pinned}
            onDismiss={clearPin}
            {...tooltipHandlers}
          >
            <DineroTooltipBody
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
        <ReporteriaChartClickHint label="Haz clic en una barra para ver los vehículos." />
      </div>
    </ReporteriaCard>
  );
}
