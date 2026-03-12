# Siemens Energy — Gas Turbine AI Maintenance Assistant (PoC)

A Proof of Concept for the **Siemens Energy Distributed AI Factory** demonstrating an industrial RAG (Retrieval-Augmented Generation) pipeline for gas turbine maintenance.

> **Live demo:** [angelorscoelho.dev/siemens](https://www.angelorscoelho.dev/siemens)  
> This repository is a Git submodule of [angelorscoelho/angelorscoelho.dev](https://github.com/angelorscoelho/angelorscoelho.dev) and is served as the `/siemens` sub-page of that portfolio.

## Architecture

```
┌───────────────────────────────────────┐          ┌────────────────────────────────────┐
│           Frontend (Vercel)           │  HTTPS   │         Backend (AWS)              │
│                                       │ ────────▶│                                    │
│  Vue.js SPA + Tailwind CSS            │          │  API Gateway (HTTP API)             │
│  • Fleet Status dashboard             │          │       ↓                            │
│  • AI Maintenance Assistant chat      │◀──────── │  Lambda (Python 3.11)              │
│                                       │          │  • RAG mock: manual excerpt context │
└───────────────────────────────────────┘          │  • OpenAI Chat Completions API     │
                                                   └────────────────────────────────────┘
```

## Repository Structure

```
siemens/
├── frontend/                   # Vue.js + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/
│   │   │   └── SiemensPoC.vue  # Main view (fleet status + AI chat)
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css
│   ├── vercel.json             # Vercel deployment config
│   ├── .env.example            # Environment variable template
│   └── package.json
│
└── backend/                    # AWS SAM serverless backend
    ├── template.yaml           # SAM IaC: API Gateway + Lambda + CORS
    ├── samconfig.toml          # SAM deploy defaults
    ├── ask_assistant/
    │   └── app.py              # Lambda handler (RAG mock + OpenAI)
    └── layer/
        └── requirements.txt    # openai SDK (Lambda Layer)
```

## Prerequisites

- [Node.js 18+](https://nodejs.org/) & npm
- [Python 3.11+](https://www.python.org/)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- AWS account with appropriate IAM permissions
- [OpenAI API key](https://platform.openai.com/api-keys)

---

## Step 1 — Run the Frontend Locally

```bash
cd frontend
cp .env.example .env
# Edit .env and set VITE_API_URL after deploying the backend (Step 3)
npm install
npm run dev
```

Open [http://localhost:5173/siemens/](http://localhost:5173/siemens/) to see the app
(the `/siemens/` base path is set in `vite.config.js`).

---

## Step 2 — Deploy the Backend (AWS SAM)

### 2a. Build

```bash
cd backend
sam build
```

### 2b. Deploy (first time — interactive guided mode)

```bash
sam deploy --guided
```

When prompted, provide:

| Parameter | Value |
|-----------|-------|
| Stack Name | `siemens-poc` |
| AWS Region | e.g. `us-east-1` |
| `OpenAIApiKey` | Your OpenAI key (`sk-...`) — **marked NoEcho** |
| `OpenAIModel` | `gpt-4o-mini` (default) or `gpt-4o` |
| `S3BucketName` | `siemens-rag-knowledge-base` (must be globally unique — change suffix if needed) |
| `AllowedOrigin` | `*` for testing, or `https://www.angelorscoelho.dev` for production |
| Confirm changeset | `y` |
| Save config | `y` |

### 2c. Subsequent deploys

```bash
sam deploy
```

### 2d. Get the API URL

After deployment, SAM prints the API URL in **Outputs**:

```
Key   ApiBaseUrl
Value https://<api-id>.execute-api.us-east-1.amazonaws.com

Key   KnowledgeBaseBucketName
Value siemens-rag-knowledge-base
```

### 2e. Populate the RAG knowledge base (one-time)

Before the Lambda can answer questions, run the ingestion script locally to embed the manual chunks and upload them to S3:

```bash
# From the repo root
pip install openai boto3
export OPENAI_API_KEY="sk-..."
python ingest_manuals.py --bucket siemens-rag-knowledge-base
```

Expected output:
```
=== Siemens RAG Ingestion Pipeline ===
Embedding model : text-embedding-3-small
S3 bucket       : siemens-rag-knowledge-base
Chunks to ingest: 3

[1/3] Embedding chunk 'chunk_001' ...
[2/3] Embedding chunk 'chunk_002' ...
[3/3] Embedding chunk 'chunk_003' ...

Uploading 3 chunks (28.4 KB) → s3://siemens-rag-knowledge-base/chunks/embeddings.json
Upload complete.
Knowledge base ready: s3://siemens-rag-knowledge-base/chunks/embeddings.json
```

---

## 5-Minute Deployment & Test

Complete flow from zero to a live real-RAG endpoint:

```bash
# 1. Deploy AWS infrastructure (SAM)
cd backend
sam build
sam deploy --guided
# → Provide: OpenAIApiKey, OpenAIModel=gpt-4o-mini, S3BucketName=siemens-rag-knowledge-base

# 2. Populate the S3 knowledge base (run once from repo root)
cd ..
pip install openai boto3
export OPENAI_API_KEY="sk-..."
python ingest_manuals.py --bucket siemens-rag-knowledge-base

# 3. Smoke-test the endpoint
API_URL="https://<api-id>.execute-api.us-east-1.amazonaws.com"

curl -s -X POST "$API_URL/ask-assistant" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the vibration trip thresholds for the SGT series?"}' \
  | python -m json.tool
```

Expected response shape:
```json
{
  "answer": "According to Section 7, bearing vibration trip threshold is > 5.0 mm/s RMS...",
  "sources": [
    { "id": "chunk_002", "section": "Section 7 & 18: Vibration...", "score": 0.89, "preview": "..." }
  ],
  "model": "gpt-4o-mini",
  "embedding_model": "text-embedding-3-small",
  "top_k": 3
}
```

```bash
# 4. Test a critical alert query
curl -s -X POST "$API_URL/ask-assistant" \
  -H "Content-Type: application/json" \
  -d '{"query": "Turbine is NOK with vibration 6.2 mm/s and exhaust temp 640C. What is the action plan?"}' \
  | python -m json.tool

# 5. Connect the frontend
cd frontend
echo "VITE_API_URL=$API_URL" > .env
npm install && npm run dev
```

---

## Step 3 — Connect Frontend to Backend

```bash
cd frontend
echo "VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com" > .env
npm run build   # verify build still works
```

---

## Step 4 — Integrate with the Main Portfolio (submodule)

This repository is designed to be consumed as a Git submodule by
[angelorscoelho/angelorscoelho.dev](https://github.com/angelorscoelho/angelorscoelho.dev)
and served at `https://www.angelorscoelho.dev/siemens`.

To add it to the main site:

```bash
# In the angelorscoelho.dev repo root:
git submodule add https://github.com/angelorscoelho/siemens.git siemens
git submodule update --init --remote siemens
```

Then, in the main site's build pipeline, build the siemens frontend and copy the output:

```bash
cd siemens/frontend
npm ci
VITE_API_URL=<api-url> npm run build
# dist/ now contains assets prefixed with /siemens/
cp -r dist/* ../../dist/siemens/
```

The main site's `vercel.json` should then rewrite `/siemens/(.*)` to the siemens
`index.html`:

```json
{ "source": "/siemens/(.*)", "destination": "/siemens/index.html" }
```

### Why keep this as a separate repository?

- **Standalone reviewability** — Interviewers can inspect `github.com/angelorscoelho/siemens`
  as a self-contained project with its own README, commit history, and infrastructure.
- **Backend isolation** — The AWS SAM backend (`template.yaml`, Lambda) has no place
  inside a React portfolio repo.
- **Best of both worlds** — The submodule approach means this project is independently
  linkable *and* appears as a live demo on the portfolio.

---

## Step 5 — Deploy Frontend Standalone (optional)

If you want to deploy the siemens frontend by itself (e.g. for isolated testing):

1. Push this repository to GitHub.
2. Import the **`frontend/`** directory in [Vercel](https://vercel.com/new).
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable: `VITE_API_URL` → your API Gateway URL.
5. Deploy.

> **CORS note:** After the Vercel URL is assigned, redeploy the backend with
> `AllowedOrigin` set to your exact domain for production security:
> ```bash
> sam deploy --parameter-overrides AllowedOrigin="https://www.angelorscoelho.dev"
> ```

---

## CI/CD — Automated Portfolio Deployment

When a change is merged to `main` in this repository, the workflow at
`.github/workflows/update-main-site.yml` automatically advances the siemens
submodule pointer in `angelorscoelho/angelorscoelho.dev`. Vercel monitors that
repository and triggers a full rebuild whenever its `main` branch is pushed to,
so the live portfolio at `angelorscoelho.dev/siemens` is updated without any
manual intervention.

```
Push to siemens/main
        │
        ▼
 GitHub Actions (this repo)
 update-main-site.yml
        │  git -C siemens checkout <new-sha>
        │  git add siemens && git commit && git push
        ▼
 angelorscoelho/angelorscoelho.dev main branch updated
        │
        ▼
 Vercel detects push → build → deploy
        │
        ▼
 https://www.angelorscoelho.dev/siemens ✓ live
```

### One-time setup (required secrets)

| Secret | Where to set it | What it is |
|--------|-----------------|------------|
| `MAIN_SITE_PAT` | Siemens repo → Settings → Secrets and variables → Actions | A GitHub **fine-grained token** (or Classic PAT) with `Contents → Read and Write` permission on `angelorscoelho/angelorscoelho.dev` |

Steps to create the token:
1. Go to **GitHub → Settings → Developer settings → Personal access tokens**.
2. Generate a **fine-grained token** scoped to `angelorscoelho/angelorscoelho.dev` with **Contents → Read and Write**.  
   *(Alternatively use a Classic PAT with the `repo` scope.)*
3. Copy the token value.
4. In **this** (siemens) repository: Settings → Secrets and variables → Actions → New repository secret → name it `MAIN_SITE_PAT`.

Once the secret exists the workflow runs automatically on every push to `main`.  
No changes are required in the Vercel dashboard or in `angelorscoelho.dev`.

---

## Enhanced Real RAG Implementation (March 2026)

### What changed and why

The original PoC injected a hardcoded 3,000-word maintenance manual excerpt into every prompt regardless of the user's question. This approach has three hard ceilings: token cost scales with document size (not query relevance), retrieved context is always the same excerpt, and the architecture was dishonest — the diagram claimed vector retrieval that didn't exist.

This upgrade replaces mock retrieval with a real, dependency-light RAG pipeline in three steps:

| Step | Before | After |
|------|--------|-------|
| **Retrieval** | Hardcoded string pasted into every prompt | `text-embedding-3-small` → cosine similarity over pre-embedded S3 chunks |
| **Context injected** | Entire 3,000-word manual (always identical) | Top-3 semantically relevant chunks (~900 words) |
| **LLM** | google/gemini-2.0-flash (via stdlib urllib) | OpenAI gpt-4o-mini (via official SDK) |
| **Response payload** | `{answer, context, model}` | `{answer, sources[], embedding_model, top_k, model}` |
| **Infrastructure** | Lambda only | Lambda + S3 bucket (created by SAM stack) |

### Design decisions

**Why S3 + a single JSON manifest instead of a vector DB?**  
A vector database (Pinecone, OpenSearch, pgvector) adds operational overhead, costs, and IAM complexity that is disproportionate for a knowledge base of < 500 chunks. Downloading one pre-computed JSON file from S3 and running cosine similarity in pure Python adds < 80 ms of latency, costs fractions of a cent per query, and keeps the entire retrieval path auditable in 30 lines of code. When the knowledge base grows beyond ~2,000 chunks, migrating to a proper ANN index becomes worthwhile — and the interface contract (`_retrieve_top_k`) is already isolated for that swap.

**Why `text-embedding-3-small`?**  
At $0.02 per million tokens it is the lowest-cost OpenAI embedding model. The 1536-dim vectors provide retrieval quality that is more than sufficient for technical domain documents. Embeddings are computed once at ingestion time — query-time cost is a single API call per user turn.

**Why cosine similarity in pure Python (no NumPy)?**  
Lambda's execution environment ships with `boto3` and the Python standard library. Adding NumPy to the layer for dot-product arithmetic on vectors of length 1,536 is unnecessary overhead. The pure-Python implementation runs in < 5 ms for 200 chunks.

### Files changed

| File | Change |
|------|--------|
| `backend/ask_assistant/app.py` | Complete rewrite — real RAG pipeline (embed → S3 → cosine → chat) |
| `backend/template.yaml` | Replaced Gemini params with OpenAI + S3; added `KnowledgeBaseBucket` resource + IAM policy |
| `backend/layer/requirements.txt` | Added `openai>=1.30` (boto3 is pre-installed in Lambda runtime) |
| `ingest_manuals.py` | New one-time script — chunks 3 SGT manual sections, embeds, uploads to S3 |
| `README.md` | Updated architecture diagram (Mermaid) and deployment instructions |

---

## API Reference

### `POST /ask-assistant`

**Request:**
```json
{ "query": "What are the vibration thresholds for bearing fault detection?" }
```

**Response:**
```json
{
  "answer": "According to Section 7 of the maintenance manual...",
  "sources": [
    {
      "id": "chunk_002",
      "section": "Section 7 & 18: Vibration Thresholds and Fault Remediation",
      "score": 0.8912,
      "preview": "SIEMENS SGT-SERIES — SECTION 7: VIBRATION THRESHOLDS..."
    }
  ],
  "model": "gpt-4o-mini",
  "embedding_model": "text-embedding-3-small",
  "top_k": 3
}
```

**Error response:**
```json
{ "error": "Human-readable error message" }
```

---

## Tear Down

```bash
cd backend
sam delete --stack-name siemens-poc
```

