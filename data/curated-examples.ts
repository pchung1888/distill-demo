/**
 * REAL captured responses -- these are genuine live LLM output.
 *
 * Each JSON file under ./curated-examples/ is a real POST /ingest response
 * from distill running with DISTILL_PROVIDER=gemini (gemini-2.5-flash)
 * against the public URL/PDF named below. summary, key_points, entities,
 * topics, and the critic verdict are actual Gemini output; the token counts
 * and cost_usd in `trace` are the real metered cost of that run (a fraction
 * of a cent each). They are captured once and served statically so the
 * homepage renders instantly without a live API call on every page load.
 *
 * To refresh: re-run the same three POST /ingest calls against a live
 * backend and replace the JSON files -- the shape does not change. The
 * "try your own" and "compare" sections below always call the live backend.
 */
import aiEngineering from "./curated-examples/ai-engineering.json";
import neutral from "./curated-examples/neutral.json";
import pdf from "./curated-examples/pdf.json";
import type { CuratedExample, IngestResponse } from "@/lib/types";

export const CURATED_EXAMPLES: CuratedExample[] = [
  {
    id: "ai-engineering",
    label: "AI / Engineering",
    category: "ai-engineering",
    sourceType: "url",
    sourceValue: "https://docs.python.org/3/tutorial/introduction.html",
    response: aiEngineering as IngestResponse,
  },
  {
    id: "neutral",
    label: "General Interest",
    category: "neutral",
    sourceType: "url",
    sourceValue: "https://www.nationalgeographic.com/animals/mammals/facts/domestic-cat",
    response: neutral as IngestResponse,
  },
  {
    id: "pdf",
    label: "PDF Document",
    category: "pdf",
    sourceType: "pdf",
    sourceValue: "https://unctad.org/system/files/official-document/wir2020_en.pdf",
    response: pdf as IngestResponse,
  },
];
