@AGENTS.md

# CLAUDE.md -- distill-demo

Portfolio demo frontend for **distill** (the sibling repo:
https://github.com/pchung1888/distill). distill is a provider-agnostic agentic
knowledge-ingestion API (FastAPI/Python) that turns a URL / YouTube / PDF into a
verified, structured `KnowledgeDoc` via an extract -> validate -> critic ->
structure pipeline. This Next.js app is the interactive front door to it.

This repo has NO business logic of its own -- it is a thin, typed client + UI
over distill's HTTP API. All pipeline behavior lives in the distill backend.

## Build + test commands
- Install:   npm install
- Dev:       npm run dev        (localhost:3000)
- Build:     npm run build      (must pass before every commit)
- Lint:      npm run lint

## Architecture
- Next.js App Router, TypeScript, Tailwind. No src/ dir.
- `lib/types.ts`      -- TS mirror of distill's Pydantic response shapes
  (IngestResponse, KnowledgeDoc, IngestTrace, CompareResponse). Keep in sync
  with distill/src/distill/models.py + api/app.py when the API changes.
- `lib/distill-client.ts` -- the only place that calls the backend. Returns a
  DISCRIMINATED result (ok / rate_limited / source_error / network_error);
  callers must switch on it, never assume success. All fetches send
  `credentials: "include"` so distill's visitor cookie round-trips.
- `data/curated-examples/*.json` -- REAL captured `/ingest` responses (gemini),
  served statically so the homepage renders instantly with no live call.
  Regenerate by re-running the three POST /ingest calls; the shape is fixed.
- `components/` -- ResultView (Clean vs Engineering View toggle), PipelineStages,
  CriticVerdict, MeteringTable, CuratedExamples, TryYourOwnForm, CompareSection.

## Conventions
- ASCII only in code and docs (no em-dashes, smart quotes, unicode arrows --
  use -- and ->). Matches the distill repo's rule.
- Honest failure UI: never fake a success or silently retry a different
  provider. A 429 shows the "you've used your free runs" message and points to
  the curated examples; a backend error renders the real error text.
- The curated examples are the instant first impression; the "try your own" and
  "compare" sections are the only paths that spend a live API call.

## Config
- `NEXT_PUBLIC_DISTILL_API_URL` (see .env.example) -- base URL of the distill
  backend. Local default http://localhost:8000; in production set it to the
  deployed Cloud Run URL. This is the ONLY env var this frontend needs.

## Relationship to distill (important)
- Secrets (Gemini/OpenAI keys), rate limiting, CORS, and all cost/latency
  metering live in the distill BACKEND, not here. This frontend holds no keys
  and no server-side state.
- When the distill API contract changes, update `lib/types.ts` and
  `lib/distill-client.ts` to match, then `npm run build` to catch drift.

## Deploy
- Frontend -> Vercel; backend -> Cloud Run. See DEPLOY.md for the exact,
  order-sensitive steps (backend first, then frontend, then reconcile CORS).
