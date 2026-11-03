import { formatMonedaUsd } from "./lib/helpers";
import { ReporteriaCard } from "./lib/reporteria-ui";
import type { RankingCliente } from "./lib/zod";

type RankingClientesReporteriaProps = {
  clientes: RankingCliente[];
};

export function RankingClientesReporteria({
  clientes,
}: RankingClientesReporteriaProps) {
  return (
    <ReporteriaCard title="Clientes">
      {clientes.length === 0 ? (
        <p className="px-4 py-12 text-center text-sm font-semibold text-muted-foreground md:px-6">
          No hay clientes en el periodo seleccionado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-zinc-100 text-left text-[10px] font-bold uppercase tracking-widest text-brand dark:border-zinc-700 dark:bg-zinc-800 dark:text-brand-bright">
                <th className="px-4 py-3 md:px-6">Cliente</th>
                <th className="px-4 py-3 md:px-6">NIT</th>
                <th className="px-4 py-3 text-right md:px-6">Unidades</th>
                <th className="px-4 py-3 text-right md:px-6">Monto compra</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b border-border bg-white last:border-b-0 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <td className="px-4 py-3 font-semibold text-foreground md:px-6">
                    {cliente.nombre}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground md:px-6">
                    {cliente.nit ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-foreground md:px-6">
                    {cliente.unidades}
                  </td>
                  <td className="px-4 py-3 text-right font-black tabular-nums text-foreground md:px-6">
                    {formatMonedaUsd(cliente.monto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ReporteriaCard>
  );
}
