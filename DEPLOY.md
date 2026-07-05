# Deploy playbook -- distill (backend) + distill-demo (frontend)

Cross-repo, order-sensitive. All steps are HUMAN-GATED: they need your GCP
project, Vercel account, and the two live API keys. Run them yourself; nothing
here should be automated by an agent (secrets + irreversible deploys).

Backend -> Google Cloud Run. Frontend -> Vercel. There is a deliberate
chicken-and-egg (the frontend needs the backend URL; the backend's CORS needs
the frontend origin), so the order is: deploy backend, deploy frontend, then
reconcile CORS.

Prerequisites
- `gcloud` CLI installed and authenticated to a project with billing on
  (`gcloud auth login`, `gcloud config set project <PROJECT_ID>`).
- A Vercel account (and optionally the `vercel` CLI, or use the GitHub import).
- Your real GEMINI_API_KEY and OPENAI_API_KEY.
- Run backend commands from the distill repo root; frontend from this repo.

--------------------------------------------------------------------------
## Step 1 -- Backend to Cloud Run (from the `distill` repo)

1a. Store both keys in Secret Manager (never pass keys as plain env on deploy):

```
printf '%s' 'YOUR_GEMINI_KEY' | gcloud secrets create gemini-api-key --data-file=-
printf '%s' 'YOUR_OPENAI_KEY' | gcloud secrets create openai-api-key --data-file=-
```

1b. Let Cloud Run's service account read those secrets (one-time). Find the
    project number, then grant the default compute SA the accessor role:

```
PROJECT_NUMBER=$(gcloud projects describe "$(gcloud config get-value project)" --format='value(projectNumber)')
SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
for s in gemini-api-key openai-api-key; do
  gcloud secrets add-iam-policy-binding "$s" \
    --member="serviceAccount:${SA}" --role="roles/secretmanager.secretAccessor"
done
```

1c. Deploy. `--source .` builds from the Dockerfile in the cloud, so you do NOT
    need Docker installed locally. Set the default provider and both secrets.
    Leave CORS as a placeholder for now (reconciled in Step 3):

```
gcloud run deploy distill \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DISTILL_PROVIDER=gemini,DISTILL_ALLOWED_ORIGINS=https://placeholder.invalid \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest,OPENAI_API_KEY=openai-api-key:latest
```

1d. Copy the service URL it prints (looks like
    `https://distill-xxxxx-uc.a.run.app`). Verify:

```
curl -s https://distill-xxxxx-uc.a.run.app/health
# -> {"status":"ok","provider":"gemini","version":"0.1.0"}
```

RATE-LIMIT CAVEAT (decide now): distill's SQLite counter defaults to
`:memory:`, and Cloud Run scales to zero + can run multiple instances, so the
per-day caps reset on every cold start. For a low-traffic interview demo that
is harmless. If you want the caps to actually hold, add
`--min-instances=1` (small always-on cost) or move the counter to an external
store. Recommended for v1: accept the reset and mention it as a known tradeoff.

--------------------------------------------------------------------------
## Step 2 -- Frontend to Vercel (from this repo, `distill-demo`)

2a. Point the frontend at the Cloud Run URL from Step 1d. Either set it in the
    Vercel dashboard (Project -> Settings -> Environment Variables) or via CLI:

```
NEXT_PUBLIC_DISTILL_API_URL = https://distill-xxxxx-uc.a.run.app
```

2b. Deploy: import the GitHub repo at vercel.com/new (zero config -- it detects
    Next.js), or run `vercel --prod` with the CLI. Copy the resulting URL
    (looks like `https://distill-demo-xxxx.vercel.app`).

--------------------------------------------------------------------------
## Step 3 -- Reconcile CORS (back in the `distill` repo)

Now that the Vercel URL exists, allow it on the backend and redeploy config
(no rebuild needed):

```
gcloud run services update distill --region us-central1 \
  --update-env-vars DISTILL_ALLOWED_ORIGINS=https://distill-demo-xxxx.vercel.app
```

If you use a custom domain later, comma-separate it:
`DISTILL_ALLOWED_ORIGINS=https://distill-demo-xxxx.vercel.app,https://demo.yoursite.com`

--------------------------------------------------------------------------
## Step 4 -- Verify end to end

1. Open the Vercel URL in a browser.
2. Curated examples render instantly (static, no call).
3. "Try your own" with a real URL -> a real Gemini result (allow ~15-45s;
    the critic-retry loop can push a single run past a minute -- expected).
4. "Compare providers" -> real Gemini vs OpenAI table.
5. Browser console shows no CORS errors; the request goes to the Cloud Run URL.

--------------------------------------------------------------------------
## Step 5 -- Publish the URLs

- Put the live Vercel URL in this repo's README (replace "Live URL: pending").
- Put it in the distill repo's README too ("Live demo" placeholder).
- Cross-link the two repos.

--------------------------------------------------------------------------
## Cost + safety notes
- Each live run is a fraction of a cent (~$0.002-0.006). distill's global daily
  budget cap ($2 default) is the backstop; tune via DISTILL_RL_GLOBAL_BUDGET_USD.
- Keys live ONLY in Secret Manager in prod and a gitignored .env locally --
  never in the repo, never in a command that logs argv.
- Consider rotating the keys if their values were ever exposed outside Secret
  Manager (e.g. pasted somewhere logged).
