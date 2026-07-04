import type { CriticResult } from "@/lib/types";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function CriticVerdict({ critic }: { critic: CriticResult }) {
  return (
    <div className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex flex-wrap items-center gap-3">
        <ConfidenceBadge confidence={critic.confidence} faithful={critic.faithful} />
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          faithful: <span className="font-mono">{String(critic.faithful)}</span>
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Issues ({critic.issues.length})
          </div>
          {critic.issues.length === 0 ? (
            <div className="mt-1 text-sm text-zinc-400">none</div>
          ) : (
            <ul className="mt-1 list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
              {critic.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Missing points ({critic.missing_points.length})
          </div>
          {critic.missing_points.length === 0 ? (
            <div className="mt-1 text-sm text-zinc-400">none</div>
          ) : (
            <ul className="mt-1 list-inside list-disc text-sm text-zinc-700 dark:text-zinc-300">
              {critic.missing_points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
