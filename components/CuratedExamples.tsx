"use client";

import { useState } from "react";
import { CURATED_EXAMPLES } from "@/data/curated-examples";
import { ResultView } from "./ResultView";

export function CuratedExamples() {
  const [activeId, setActiveId] = useState(CURATED_EXAMPLES[0].id);
  const active = CURATED_EXAMPLES.find((e) => e.id === activeId) ?? CURATED_EXAMPLES[0];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Curated examples</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Shown instantly from saved JSON -- no live API call. These were captured with{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
            DISTILL_PROVIDER=mock
          </code>{" "}
          against real public URLs, so source fetching/parsing is real but the summary, key
          points, entities, and critic verdict are the mock provider&apos;s canned placeholder
          text -- not real LLM output. They will be regenerated once a live provider key is
          funded.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CURATED_EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            type="button"
            onClick={() => setActiveId(ex.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              ex.id === activeId
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
        <div className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
          source ({active.sourceType}): {active.sourceValue}
        </div>
        <ResultView result={active.response} />
      </div>
    </section>
  );
}
