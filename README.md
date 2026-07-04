# distill-demo

Portfolio demo frontend for [`distill`](https://github.com) (local path during
development: `D:\playground\distill\distill`), a provider-agnostic agentic
knowledge-ingestion service (Python/FastAPI). distill turns a URL, YouTube
video, or PDF into a structured, validated `KnowledgeDoc` through a four-stage
pipeline (extract -> validate -> critic -> structure), metering every LLM
call's tokens, cost, and latency into an `IngestTrace`.

This repo is a Next.js (App Router, TypeScript, Tailwind) frontend that calls
that backend directly from the browser. It does not have its own database or
auth -- it is a stateless client.

## Two-tier interaction model

1. **Curated examples** (top of the page) render instantly from static JSON
   checked into this repo under `data/curated-examples/`. No live API call.
   These were captured by actually calling a local distill instance
   (`DISTILL_PROVIDER=mock`) against three real public sources:
   - AI/engineering: `https://docs.python.org/3/tutorial/introduction.html`
   - General interest: `https://www.nationalgeographic.com/animals/mammals/facts/domestic-cat`
   - PDF: `https://unctad.org/system/files/official-document/wir2020_en.pdf`

   **These are placeholder data, not real LLM output.** distill really fetched
   and parsed those URLs/PDF (title, source metadata are real), but
   `DISTILL_PROVIDER=mock` returns fixed canned strings for summary, key
   points, entities, topics, and the critic verdict -- see
   `distill/src/distill/llm/mock_provider.py`. Cost is always $0 under mock.
   Once a live provider key (Gemini/OpenAI/Anthropic) is funded, regenerate
   `data/curated-examples/*.json` by re-running the same three `POST /ingest`
   calls with a real provider and swapping the files in -- the shape does not
   change. See the doc comment at the top of `data/curated-examples.ts` for
   the full disclosure.

2. **Try your own** and **Compare providers**, below the curated examples,
   call the live local distill API (`POST /ingest` and `POST /compare`
   respectively). Both are rate-limited server-side by distill's SQLite-backed
   per-visitor daily cap (a `distill_visitor` httponly cookie identifies the
   browser, no login) -- default 5 single runs and 1 compare run per day, plus
   a shared global daily USD budget. A 429 response is shown honestly
   ("You've used your free live runs for today -- here are the pre-recorded
   examples above") and never silently retried with a different provider or
   faked as a success.

Every result -- curated or live -- renders through the same `<ResultView>`
component with a **Clean result** / **Engineering view** toggle. Engineering
view shows the four pipeline stages (with repair/retry stages such as
`validate_repair` or `critic_retry` highlighted distinctly when present), the
critic's full verdict, and a per-stage token/cost/latency table with computed
totals.

## Running locally

You need both repos: `distill` (backend) and this one (frontend).

1. Start distill locally (from the `distill` repo):

   ```bash
   DISTILL_PROVIDER=mock DISTILL_ALLOWED_ORIGINS=http://localhost:3000 \
     uv run uvicorn distill.api.app:app --port 8000
   ```

   Swap `DISTILL_PROVIDER=mock` for a real provider once keys are funded --
   see `distill/.env.example`.

2. In this repo, copy `.env.example` to `.env.local` (already done for local
   dev; the default already points at `http://localhost:8000`):

   ```bash
   cp .env.example .env.local
   ```

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open http://localhost:3000. The curated examples render immediately. "Try
   your own" and "Compare providers" need the distill server from step 1
   running and reachable at `NEXT_PUBLIC_DISTILL_API_URL`.

## Why credentials: "include"

distill's rate limiter identifies a visitor via an httponly cookie
(`distill_visitor`), not a login. For that cookie to round-trip on
cross-origin requests (frontend on :3000, backend on :8000), every fetch in
`lib/distill-client.ts` sets `credentials: "include"`, and distill's CORS
config must list this frontend's origin in `DISTILL_ALLOWED_ORIGINS`.

## What this is not

- Not deployed anywhere yet (no Vercel, no gcloud) -- local-only for now.
- No live LLM keys configured -- curated examples use `DISTILL_PROVIDER=mock`,
  clearly labeled as placeholder pending funded keys.
- No auth, no file-upload PDF handling (PDF sources are a URL to a PDF,
  matching distill's `PDFSource`), no database beyond distill's own SQLite
  rate-limit counters.
