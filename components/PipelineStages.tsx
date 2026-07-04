import type { StageTrace } from "@/lib/types";

/**
 * distill's pipeline is conceptually four stages: extract -> validate ->
 * critic -> structure (see distill/src/distill/pipeline/orchestrator.py).
 * Only extract/validate/critic ever make an LLM call, so only they can
 * appear in trace.stages; "structure" is pure Python (build_doc) and never
 * meters anything -- it's still shown here as the pipeline's last hop so the
 * full shape is visible.
 *
 * A stage name containing "repair" or "retry" means the bounded-loop safety
 * net fired (a validate JSON repair call, or a full critic-driven
 * re-extraction because confidence fell below threshold). Those are
 * highlighted distinctly rather than folded into the base stage, because
 * "it needed a repair" is itself an interesting fact about a run.
 */

type Bucket = "extract" | "validate" | "critic" | "structure";

function bucketOf(name: string): Bucket {
  if (name.startsWith("extract")) return "extract";
  if (name.startsWith("validate")) return "validate";
  if (name.startsWith("critic")) return "critic";
  return "structure";
}

function isRepairOrRetry(name: string): boolean {
  return name.includes("repair") || name.includes("retry");
}

const BUCKET_LABEL: Record<Bucket, string> = {
  extract: "Extract",
  validate: "Validate",
  critic: "Critic",
  structure: "Structure",
};

export function PipelineStages({ stages }: { stages: StageTrace[] }) {
  const buckets: Bucket[] = ["extract", "validate", "critic", "structure"];
  const byBucket = new Map<Bucket, StageTrace[]>(buckets.map((b) => [b, []]));
  for (const stage of stages) {
    byBucket.get(bucketOf(stage.name))?.push(stage);
  }

  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {buckets.map((bucket, i) => {
        const stagesInBucket = byBucket.get(bucket) ?? [];
        const hasCalls = stagesInBucket.length > 0;
        const hasRepair = stagesInBucket.some((s) => isRepairOrRetry(s.name));
        return (
          <div key={bucket} className="flex items-stretch gap-2">
            <div
              className={`min-w-[9rem] rounded-lg border p-3 ${
                hasRepair
                  ? "border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/40"
                  : hasCalls || bucket === "structure"
                    ? "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
                    : "border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950"
              }`}
            >
              <div className="text-sm font-semibold">{BUCKET_LABEL[bucket]}</div>
              {bucket === "structure" ? (
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  deterministic, no LLM call
                </div>
              ) : stagesInBucket.length === 0 ? (
                <div className="mt-1 text-xs text-zinc-400">no call recorded</div>
              ) : (
                <ul className="mt-1 space-y-0.5">
                  {stagesInBucket.map((s, idx) => (
                    <li
                      key={idx}
                      className={`text-xs ${
                        isRepairOrRetry(s.name)
                          ? "font-medium text-amber-700 dark:text-amber-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {s.name}
                      {isRepairOrRetry(s.name) ? " (extra call)" : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {i < buckets.length - 1 && (
              <div className="flex items-center text-zinc-400" aria-hidden>
                {"->"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
