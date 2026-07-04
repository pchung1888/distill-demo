export function ConfidenceBadge({
  confidence,
  faithful,
}: {
  confidence: number;
  faithful: boolean;
}) {
  const pct = Math.round(confidence * 100);
  const tone = !faithful
    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
    : pct >= 85
      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
      : pct >= 70
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
        : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${tone}`}
      title={faithful ? "Critic judged this faithful to the source" : "Critic flagged faithfulness issues"}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {pct}% confidence
      {!faithful && " -- not faithful"}
    </span>
  );
}
