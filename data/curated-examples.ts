/**
 * PLACEHOLDER DATA -- read this before trusting anything rendered from here.
 *
 * These three JSON files under ./curated-examples/ are REAL responses from a
 * LOCAL distill instance (POST /ingest against http://localhost:8000), but
 * captured with DISTILL_PROVIDER=mock. That means:
 *
 *   - source_type, source_ref, title, and meta.source_meta are REAL --
 *     distill actually fetched and parsed these live public URLs/PDF.
 *   - summary, key_points, entities, topics, and the critic verdict are NOT
 *     LLM output. MockProvider returns fixed canned strings ("A mock summary
 *     of the source document produced for tests.", "First canned key
 *     point.", confidence 0.95, etc.) regardless of the input -- see
 *     distill/src/distill/llm/mock_provider.py.
 *   - The token counts and $0.00 cost in `trace` are real artifacts of the
 *     mock pipeline run (extract + critic stage byte-counting), but they do
 *     NOT reflect what a live Gemini/OpenAI run would cost -- mock cost_usd
 *     is always 0.
 *
 * These exist so the "curated examples" section of the homepage renders
 * instantly without spending a live API key (none are funded yet). Once a
 * real provider key is funded, regenerate this directory by re-running the
 * same three POST /ingest calls with provider set to a real backend and
 * replacing the JSON files -- the shape does not change.
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
