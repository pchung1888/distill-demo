"use client";

import { useState } from "react";
import type { IngestResponse } from "@/lib/types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { PipelineStages } from "./PipelineStages";
import { CriticVerdict } from "./CriticVerdict";
import { MeteringTable } from "./MeteringTable";

type ViewMode = "clean" | "engineering";

export function ResultView({ result }: { result: IngestResponse }) {
  const [mode, setMode] = useState<ViewMode>("clean");
  const { doc, trace } = result;

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 text-sm dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setMode("clean")}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
            mode === "clean"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Clean result
        </button>
        <button
          type="button"
          onClick={() => setMode("engineering")}
          className={`rounded-md px-3 py-1.5 font-medium transition-colors ${
            mode === "engineering"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          Engineering view
        </button>
      </div>

      {mode === "clean" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-lg font-semibold">{doc.title || doc.source_ref}</h3>
            <ConfidenceBadge confidence={doc.critic.confidence} faithful={doc.critic.faithful} />
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{doc.source_ref}</p>
          <p className="text-zinc-800 dark:text-zinc-200">{doc.summary}</p>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Key points
            </div>
            <ul className="mt-1 list-inside list-disc space-y-1 text-zinc-800 dark:text-zinc-200">
              {doc.key_points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-2">
            {doc.entities.map((e, i) => (
              <span
                key={i}
                className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {e.name} <span className="text-zinc-400">({e.type})</span>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {doc.topics.map((t, i) => (
              <span
                key={i}
                className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Pipeline
            </div>
            <PipelineStages stages={trace.stages} />
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Critic verdict
            </div>
            <CriticVerdict critic={doc.critic} />
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Token / cost / latency per stage
            </div>
            <MeteringTable trace={trace} />
          </div>
        </div>
      )}
    </div>
  );
}
