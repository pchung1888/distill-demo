/**
 * Types mirroring distill's Pydantic models (see distill/src/distill/models.py
 * and distill/src/distill/api/app.py). Kept hand-written rather than
 * generated because distill does not currently publish an OpenAPI client --
 * if that changes, this file is the first thing to replace.
 */

export type SourceType = "url" | "youtube" | "pdf";

export interface Entity {
  name: string;
  type: string;
  mentions?: number | null;
}

export interface CriticResult {
  confidence: number; // 0..1
  faithful: boolean;
  issues: string[];
  missing_points: string[];
}

export interface KnowledgeDoc {
  source_type: SourceType;
  source_ref: string;
  title?: string | null;
  summary: string;
  key_points: string[];
  entities: Entity[];
  topics: string[];
  critic: CriticResult;
  created_at: string;
  fetched_at?: string | null;
  meta: Record<string, unknown>;
}

export interface StageTrace {
  name: string;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  latency_ms: number;
}

export interface IngestTrace {
  stages: StageTrace[];
  total_tokens_in: number;
  total_tokens_out: number;
  total_cost_usd: number;
  total_latency_ms: number;
}

export interface IngestResponse {
  doc: KnowledgeDoc;
  trace: IngestTrace;
  markdown: string;
}

export interface ProviderResult {
  provider: string;
  doc?: KnowledgeDoc | null;
  trace?: IngestTrace | null;
  error?: string | null;
}

export interface CompareResponse {
  results: ProviderResult[];
}

export type RateLimitKind = "visitor_single" | "visitor_compare" | "global_budget";

export interface RateLimitDetail {
  kind: RateLimitKind;
  message: string;
}

/** A curated (pre-recorded) example bundled with the frontend. */
export interface CuratedExample {
  id: string;
  label: string;
  category: "ai-engineering" | "neutral" | "pdf";
  sourceType: SourceType;
  sourceValue: string;
  response: IngestResponse;
}
