/**
 * Thin typed client for the local distill API (POST /ingest, POST /compare,
 * GET /health). Every call returns a discriminated result -- callers must
 * branch on `ok` and, on failure, on `kind`. Nothing here throws for an
 * expected failure mode (422 source error, 429 rate limit, 502 pipeline
 * error): those are honest, typed outcomes, not exceptions to swallow.
 *
 * `credentials: "include"` is required on every call so distill's
 * `distill_visitor` httponly cookie round-trips cross-origin and the
 * per-visitor daily rate limit actually tracks the same visitor across
 * requests (see distill/src/distill/api/ratelimit.py).
 */
import type {
  CompareResponse,
  IngestResponse,
  RateLimitDetail,
  SourceType,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_DISTILL_API_URL?.replace(/\/+$/, "") ??
  "http://localhost:8000";

export interface IngestRequestBody {
  source_type: SourceType;
  value: string;
  provider?: string;
}

export interface CompareRequestBody {
  source_type: SourceType;
  value: string;
  providers: string[];
}

interface PipelineErrorDetail {
  stage: string;
  message: string;
  partial_trace?: IngestResponse["trace"];
}

export type IngestResult =
  | { ok: true; data: IngestResponse }
  | { ok: false; kind: "rate_limited"; detail: RateLimitDetail }
  | { ok: false; kind: "source_error"; message: string }
  | { ok: false; kind: "pipeline_error"; detail: PipelineErrorDetail }
  | { ok: false; kind: "network_error"; message: string };

export type CompareResult =
  | { ok: true; data: CompareResponse }
  | { ok: false; kind: "rate_limited"; detail: RateLimitDetail }
  | { ok: false; kind: "source_error"; message: string }
  | { ok: false; kind: "network_error"; message: string };

export interface HealthResponse {
  status: string;
  provider: string;
  version: string;
}

async function parseErrorDetail(res: Response): Promise<unknown> {
  try {
    const body = await res.json();
    return body?.detail;
  } catch {
    return undefined;
  }
}

export async function ingest(body: IngestRequestBody): Promise<IngestResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      ok: false,
      kind: "network_error",
      message: err instanceof Error ? err.message : "Network request failed.",
    };
  }

  if (res.ok) {
    const data = (await res.json()) as IngestResponse;
    return { ok: true, data };
  }

  const detail = await parseErrorDetail(res);

  if (res.status === 429) {
    return {
      ok: false,
      kind: "rate_limited",
      detail: (detail as RateLimitDetail) ?? {
        kind: "visitor_single",
        message: "Rate limit exceeded.",
      },
    };
  }

  if (res.status === 422) {
    return {
      ok: false,
      kind: "source_error",
      message: typeof detail === "string" ? detail : "The source could not be read.",
    };
  }

  if (res.status === 502) {
    return {
      ok: false,
      kind: "pipeline_error",
      detail: (detail as PipelineErrorDetail) ?? {
        stage: "unknown",
        message: "The pipeline failed upstream.",
      },
    };
  }

  return {
    ok: false,
    kind: "network_error",
    message: `Unexpected response: HTTP ${res.status}`,
  };
}

export async function compare(body: CompareRequestBody): Promise<CompareResult> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/compare`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch (err) {
    return {
      ok: false,
      kind: "network_error",
      message: err instanceof Error ? err.message : "Network request failed.",
    };
  }

  if (res.ok) {
    const data = (await res.json()) as CompareResponse;
    return { ok: true, data };
  }

  const detail = await parseErrorDetail(res);

  if (res.status === 429) {
    return {
      ok: false,
      kind: "rate_limited",
      detail: (detail as RateLimitDetail) ?? {
        kind: "visitor_compare",
        message: "Rate limit exceeded.",
      },
    };
  }

  if (res.status === 422) {
    return {
      ok: false,
      kind: "source_error",
      message: typeof detail === "string" ? detail : "The source could not be read.",
    };
  }

  return {
    ok: false,
    kind: "network_error",
    message: `Unexpected response: HTTP ${res.status}`,
  };
}

export async function health(): Promise<HealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, { credentials: "include" });
    if (!res.ok) return null;
    return (await res.json()) as HealthResponse;
  } catch {
    return null;
  }
}

export function apiBaseUrl(): string {
  return API_BASE;
}
