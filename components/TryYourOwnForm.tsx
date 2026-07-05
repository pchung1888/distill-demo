"use client";

import { useState, type FormEvent } from "react";
import { ingest, type IngestResult } from "@/lib/distill-client";
import type { SourceType } from "@/lib/types";
import { ResultView } from "./ResultView";

// gemini/openai are the funded live providers; mock stays available for a
// zero-cost look at the pipeline shape. Default to a real provider so a
// visitor sees genuine LLM output, not canned mock text.
const PROVIDERS = ["gemini", "openai", "mock"] as const;

export function TryYourOwnForm() {
  const [sourceType, setSourceType] = useState<SourceType>("url");
  const [value, setValue] = useState("");
  const [provider, setProvider] = useState<(typeof PROVIDERS)[number]>("gemini");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<IngestResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || pending) return;
    setPending(true);
    setResult(null);
    try {
      const res = await ingest({ source_type: sourceType, value: value.trim(), provider });
      setResult(res);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Try your own</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Calls the local distill API (POST /ingest) live. PDF sources are a URL to a PDF, not a
          file upload. Free daily runs are capped by a visitor cookie -- see the README.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500" htmlFor="source-type">
            Source type
          </label>
          <select
            id="source-type"
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
          <label className="text-xs font-medium text-zinc-500" htmlFor="source-value">
            {sourceType === "pdf" ? "PDF URL" : sourceType === "youtube" ? "YouTube URL" : "URL"}
          </label>
          <input
            id="source-value"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              sourceType === "pdf"
                ? "https://example.com/document.pdf"
                : sourceType === "youtube"
                  ? "https://www.youtube.com/watch?v=..."
                  : "https://example.com/article"
            }
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500" htmlFor="provider">
            Provider
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value as (typeof PROVIDERS)[number])}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {pending ? "Running..." : "Ingest"}
        </button>
      </form>

      {result && (
        <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          {result.ok ? (
            <ResultView result={result.data} />
          ) : result.kind === "rate_limited" ? (
            <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              You&apos;ve used your free live runs for today -- here are the pre-recorded examples
              above. ({result.detail.kind}: {result.detail.message})
            </div>
          ) : result.kind === "source_error" ? (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-200">
              distill could not read that source: {result.message}
            </div>
          ) : result.kind === "pipeline_error" ? (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-900 dark:bg-red-950 dark:text-red-200">
              Pipeline failed at stage &quot;{result.detail.stage}&quot;: {result.detail.message}
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
