import type { IngestTrace } from "@/lib/types";

function fmtCost(usd: number): string {
  return `$${usd.toFixed(4)}`;
}

export function MeteringTable({ trace }: { trace: IngestTrace }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            <th className="py-2 pr-4">Stage</th>
            <th className="py-2 pr-4 text-right">Tokens in</th>
            <th className="py-2 pr-4 text-right">Tokens out</th>
            <th className="py-2 pr-4 text-right">Cost</th>
            <th className="py-2 text-right">Latency</th>
          </tr>
        </thead>
        <tbody>
          {trace.stages.map((s, i) => (
            <tr key={i} className="border-b border-zinc-100 dark:border-zinc-900">
              <td className="py-2 pr-4 font-mono text-xs">{s.name}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{s.tokens_in.toLocaleString()}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{s.tokens_out.toLocaleString()}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{fmtCost(s.cost_usd)}</td>
              <td className="py-2 text-right tabular-nums">{s.latency_ms} ms</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold">
            <td className="py-2 pr-4">Total</td>
            <td className="py-2 pr-4 text-right tabular-nums">
              {trace.total_tokens_in.toLocaleString()}
            </td>
            <td className="py-2 pr-4 text-right tabular-nums">
              {trace.total_tokens_out.toLocaleString()}
            </td>
            <td className="py-2 pr-4 text-right tabular-nums">{fmtCost(trace.total_cost_usd)}</td>
            <td className="py-2 text-right tabular-nums">{trace.total_latency_ms} ms</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
