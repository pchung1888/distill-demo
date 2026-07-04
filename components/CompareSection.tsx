"use client";

import { useState, type FormEvent } from "react";
import { compare, type CompareResult } from "@/lib/distill-client";
import type { SourceType } from "@/lib/types";
import { ResultView } from "./ResultView";

const COMPARE_PROVIDERS = ["gemini", "openai"];

function fmtCost(usd: number): string {
  return `$${usd.toFixed(4)}`;
}

export function CompareSection() {
  const [sourceType, setSourceType] = useState<SourceType>("url");
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || pending) return;
    setPending(true);
    setResult(null);
    setExpanded(null);
    try {
      const res = await compare({
        source_type: sourceType,
        value: value.trim(),
        providers: COMPARE_PROVIDERS,
      });
      setResult(res);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Compare providers</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Runs the same source through {COMPARE_PROVIDERS.join(" and ")} and compares confidence,
          cost, latency, and tokens side by side. Uses a separate, stricter daily cap from
          &quot;try your own&quot; -- see the README.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500" htmlFor="compare-source-type">
            Source type
          </label>
          <select
            id="compare-source-type"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="url">url</option>
            <option value="youtube">youtube</option>
            <option value="pdf">pdf</option>
          </select>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500" htmlFor="compare-value">
            Value
          </label>
          <input
            id="compare-value"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://example.com/article"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            required
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pending ? "Comparing..." : "Compare"}
        </button>
      </form>

      {result && (
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          {result.ok ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
                      <th className="py-2 pr-4">Provider</th>
                      <th className="py-2 pr-4 text-right">Confidence</th>
                      <th className="py-2 pr-4 text-right">Cost</th>
                      <th className="py-2 pr-4 text-right">Latency</th>
                      <th className="py-2 pr-4 text-right">Tokens (in/out)</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.results.map((r) => (
                      <tr key={r.provider} className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-2 pr-4 font-medium">{r.provider}</td>
                        {r.error ? (
                          <td className="py-2 text-red-600 dark:text-red-400" colSpan={5}>
                            error: {r.error}
                          </td>
                        ) : (
                          <>
                            <td className="py-2 pr-4 text-right tabular-nums">
                              {r.doc ? `${Math.round(r.doc.critic.confidence * 100)}%` : "-"}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums">
                              {r.trace ? fmtCost(r.trace.total_cost_usd) : "-"}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums">
                              {r.trace ? `${r.trace.total_latency_ms} ms` : "-"}
                            </td>
                            <td className="py-2 pr-4 text-right tabular-nums">
                              {r.trace
                                ? `${r.trace.total_tokens_in} / ${r.trace.total_tokens_out}`
                                : "-"}
                            </td>
                            <td className="py-2 text-right">
                              {r.doc && r.trace && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpanded(expanded === r.provider ? null : r.provider)
                                  }
                                  className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {expanded === r.provider ? "hide" : "view"}
                                </button>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.data.results.map(
                (r) =>
                  expanded === r.provider &&
                  r.doc &&
                  r.trace && (
                    <div
                      key={r.provider}
                      className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                    >
                      <ResultView result={{ doc: r.doc, trace: r.trace, markdown: "" }} />
                    </div>
                  ),
              )}
            </div>
          ) : result.kind === "rate_limited" ? (
            <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              You&apos;ve used your free live runs for today -- here are the pre-recorded examples
              above. ({result.detail.kind}: {result.detail.message})
            </div>
          ) : result.kind === "source_error" ? (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-200">
              distill could not read that source: {result.message}
            </div>
          ) : (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-200">
              {result.message}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
