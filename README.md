# Siemens Energy — Gas Turbine AI Maintenance Assistant (PoC)

A **production-grade proof of concept** for the **Siemens Energy Distributed AI Factory**, demonstrating a real-world industrial RAG (Retrieval-Augmented Generation) pipeline for intelligent gas turbine maintenance.

> **Live demo:** [angelorscoelho.dev/siemens](https://www.angelorscoelho.dev/siemens)  
> **Repository role:** Git submodule of [angelorscoelho/angelorscoelho.dev](https://github.com/angelorscoelho/angelorscoelho.dev), served at `/siemens` on the main portfolio site.

---

## System Status & Deployment

| Component | Status |
|-----------|--------|
| **AWS Stack** | ✅ `siemens-poc` deployed to `us-east-1` via SAM (Infrastructure as Code) |
| **API Endpoint** | ✅ Live HTTP API Gateway with CORS support |
| **Knowledge Base** | ✅ S3-backed RAG pipeline with pre-computed embeddings |
| **AI Models** | ✅ Google Gemini 2.5 Pro (chat) + text-embedding-004 (768-dim vectors) |
| **Frontend** | ✅ Vue 3 + Vite on Vercel — responsive SPA with real-time architecture view |
| **Live Demo** | ✅ [angelorscoelho.dev/siemens](https://www.angelorscoelho.dev/siemens) |

---

## 🎯 Why This PoC Matters

This project demonstrates **senior-level engineering decisions** for production systems:

### Real RAG, Not Mock
- **Semantic retrieval** using genuine cosine similarity over pre-embedded document chunks
- **Lightweight infrastructure**: S3 + pure Python, no vector database required for < 500 chunks
- **Cost-conscious**: ~$0.001–0.01 per query (Gemini API + S3 storage minimal)
- **Source attribution**: Every answer includes retrieved chunk metadata and similarity scores

### Minimal Dependencies
- **Zero external SDKs**: Gemini and Google Embeddings APIs called via stdlib `urllib`
- **Lambda-native**: `boto3` is pre-installed; embedding layer intentionally empty
- **Fast cold-starts**: Slim deployment package; warm invocations cached in `/tmp` for 1 hour

### Infrastructure as Code
- **Single SAM template** (`template.yaml`) declares API Gateway, Lambda, S3, IAM, and CORS
- **One-command deploy**: `sam deploy --guided` with parameter prompts
- **Production-ready**: Error handling, timing diagnostics, graceful degradation, CORS security

### Honest Architecture
- **Diagram matches reality**: Fleet status + chat UI reflects actual deployed pipeline
- **Transparency throughout**: Requests show model names, retrieval scores, token counts
- **Error clarity**: When retrieval fails, system explicitly states it's using fallback knowledge

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                                       │
│                          Vue 3 SPA + Tailwind                                   │
│        • Fleet Dashboard (equipment status + health metrics)                    │
│        • AI Assistant Chat (cost-aware retrieval queries)                       │
│        • Live Architecture Diagram Modal                                        │
└────────────────────────┬────────────────────────────────────────────────────────┘
                         │ HTTPS POST /ask-assistant
                         │ {"query": "..."}
                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (AWS Lambda)                                       │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │ Lambda Handler (Python 3.11)                                            │    │
│  │                                                                         │    │
│  │  1. Query Embedding                                                     │    │
│  │     └─▶ Google text-embedding-004 (REST) → 768-dim vector              │     │
│  │                                                                         │    │
│  │  2. Retrieval (Real RAG)                                                │    │
│  │     └─▶ Download embeddings.json from S3 (with /tmp caching)           │     │
│  │     └─▶ Cosine similarity scoring (pure Python)                        │     │
│  │     └─▶ Return top-3 semantically relevant chunks                      │     │
│  │                                                                         │     │
│  │  3. Grounding                                                           │     │
│  │     └─▶ Inject retrieved context into system prompt                     │    │
│  │                                                                         │     │
│  │  4. Generation                                                          │     │
│  │     └─▶ Google Gemini 2.5 Pro (REST) → answer with citations            │    │
│  │                                                                         │     │
│  └─────────────────────────────────────────────────────────────────────────┘     │
│                         ├─ Source Attribution ◀──────────┐                      │
│                         ├─ Retrieval Scores              │                       │
│                         ├─ Model Metadata                │                       │
│                         ├─ Timing Diagnostics            │                       │
│                         └─▶ JSON Response                 │                     │
│                                                          │                       │
│  ┌──────────────────────────────────────────────────────┘                        │
│  │                                                                          │    │
│  └─▶ S3 Bucket (Knowledge Base)                                            │    │
│      └─ chunks/embeddings.json                                              │    │
│         [{"id": "chunk_001", "text": "...", "embedding": [...], ...}, ...]  │    │
│                                                                             │    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Core Design Decisions

**Why S3 + JSON instead of a vector database?**
- For < 500 semantic chunks, downloading a pre-embedded JSON file is faster than a round-trip to a distributed DB
- Cost: fractions of a cent per query (S3 API call + bandwidth)
- Operational simplicity: no additional infrastructure to manage or scale
- Auditability: retrieve-and-rerank logic visible in ~30 lines of pure Python
- Future-proof: When knowledge base exceeds 2,000 chunks, swapping to OpenSearch/pgvector requires only changing `_retrieve_top_k()`

**Why Gemini REST, not SDK?**
- Standard library `urllib` has no external dependencies
- Lambda cold-start unaffected; deployment package remains < 5 MB
- Direct control over request structure and error handling
- No version conflicts or implicit dependency chain

**Why cosine similarity in pure Python, not NumPy?**
- 768-dimensional vector math is trivial in vanilla Python
- Eliminates a compile-time dependency that complicates Lambda layers
- Sufficient latency for < 200 chunks (< 5 ms on Lambda)
- Code is more readable and doesn't require data science knowledge to audit

## Repository Structure

```
siemens/
├── frontend/                           # Vue 3 SPA — responsive web UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── SiemensPoC.vue         # Main view: fleet dashboard + assistant chat
│   │   │   └── EquipmentCard.vue      # Reusable equipment status card component
│   │   ├── App.vue                     # Root component & global layout
│   │   ├── main.js                     # Vue app bootstrap
│   │   ├── fleetStore.js               # Reactive fleet state (equipment, metrics)
│   │   ├── style.css                   # Global utility styles
│   │   └── assets/                     # Images, icons
│   ├── api/
│   │   └── ask-assistant.ts            # API client for /ask-assistant endpoint
│   ├── public/                          # Static assets served by Vite
│   ├── scripts/
│   │   ├── check-manual-urls.mjs       # Validate documentation links
│   │   └── fetch-images.mjs            # Preload asset images
│   ├── vite.config.js                  # Vite build config (base: /siemens/)
│   ├── tailwind.config.js              # Tailwind CSS customization
│   ├── postcss.config.js               # CSS processing
│   ├── vercel.json                     # Vercel deployment config
│   ├── package.json                    # Dependencies: Vue, Vite, Tailwind, Chart.js
│   ├── .env.example                    # Environment template (VITE_API_URL)
│   └── README.md                       # Frontend-specific setup notes
│
├── backend/                            # AWS SAM serverless backend
│   ├── template.yaml                   # Infrastructure as Code: API Gateway, Lambda, S3, IAM
│   ├── samconfig.toml                  # SAM deployment defaults & parameters
│   ├── ask_assistant/
│   │   └── app.py                      # Lambda handler: Real RAG + Gemini chat
│   │       • Query embedding via text-embedding-004
│   │       • S3 cosine similarity retrieval (top-K chunks)
│   │       • Gemini 2.5 Pro chat generation
│   │       • Request/response timing diagnostics
│   │       • Graceful fallback if retrieval fails
│   └── layer/
│       └── requirements.txt            # (Intentionally empty; boto3 is built-in)
│
├── ingest_manuals.py                   # One-time knowledge base ingestion
│   • Parses Siemens SGT manual excerpts into focused chunks
│   • Embeds each chunk with text-embedding-004 (768-dim vectors)
│   • Uploads embeddings.json to S3 for Lambda retrieval at query time
│   • Run once: python ingest_manuals.py --bucket siemens-rag-knowledge-base
│
├── README.md                           # This file
├── LICENSE                             # Project license
└── .gitignore                          # Ignore node_modules, .venv, builds, etc.
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `template.yaml` | Canonical declaration of all AWS resources (API, Lambda, S3, IAM). Single source of truth. |
| `samconfig.toml` | Cached SAM deployment parameters (stack name, region, S3 staging bucket). |
| `vite.config.js` | Frontend build: base path `/siemens/`, Vue plugin, port 5173 for dev. |
| `tailwind.config.js` | Dark theme customization (gray-950 background, teal-700 accent). |
| `package.json` | Node dependencies & scripts (dev, build, prebuild). |
| `/env.example` | Template for `VITE_API_URL` after backend deployment. |

## Prerequisites & Setup

### Before You Begin

Ensure you have the following installed and configured:

| Requirement | Version | Why |
|-------------|---------|-----|
| **Node.js** | 18+ | Frontend build & Vite dev server |
| **npm** | 9+ | Package management for frontend |
| **Python** | 3.11+ | Lambda runtime & local ingestion script |
| **AWS SAM CLI** | Latest | Deploy & test Lambda locally |
| **AWS CLI** | v2 | Credential management & debugging |
| **Git** | Latest | Source control & submodule support |

### Required Services & Credentials

| Service | Purpose | How to Set Up |
|---------|---------|--------|
| **Google Gemini API Key** | Chat model (gemini-2.5-pro) & embeddings (text-embedding-004) | Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey), create API key, export as `GEMINI_API_KEY` |
| **AWS Account** | Lambda, API Gateway, S3, CloudFormation | IAM user with `AdministratorAccess` (or scoped policies for SAM deploy) |
| **AWS Credentials File** | Local auth for SAM deploy | Run `aws configure` and provide access key + secret key + default region |
| **GitHub (Optional)** | For CI/CD integration | Required only if deploying via `.github/workflows/update-main-site.yml` |

### Quick Credential Setup

```bash
# Set Gemini API key
export GEMINI_API_KEY="AIza_<your_key_here>"

# Configure AWS credentials (creates ~/.aws/credentials)
aws configure
# Provide: Access Key ID, Secret Access Key, default region (e.g. us-east-1), output format (json)

# Verify AWS credentials
aws sts get-caller-identity
```

---

## 🚀 Getting Started (5-Minute Quickstart)

### Option A: Deploy Everything Locally + AWS

This path gets you a live API endpoint within 5 minutes.

#### Step 1: Deploy AWS Backend

```bash
cd backend

# Build SAM project
sam build

# Deploy (guided mode — first time only)
sam deploy --guided
```

**When prompted, provide:**

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Stack Name** | `siemens-poc` | Identifies your CloudFormation stack |
| **AWS Region** | `us-east-1` | (or your preferred region) |
| **GeminiApiKey** | `AIza_...` | Your actual API key — marked `NoEcho` in UI |
| **GeminiModel** | `gemini-2.5-flash` | Default; `gemini-2.0-flash` is fallback; `gemini-2.5-pro` is highest quality but slower |
| **S3BucketName** | `siemens-rag-knowledge-base` | Must be globally unique; append suffix if collision |
| **AllowedOrigin** | `*` | For testing; set to your Vercel URL in production |
| **Confirm changeset?** | `y` | Review and apply CloudFormation changes |
| **Save to samconfig.toml?** | `y` | Cache your parameters for future deploys |

**After deployment**, SAM prints:
```
Key   ApiBaseUrl
Value https://<api-id>.execute-api.us-east-1.amazonaws.com
```

Save that URL — you'll need it for the frontend.

#### Step 2: Populate S3 Knowledge Base (One-Time)

Back in the repo root, run the ingestion script to embed manual chunks and upload to S3:

```bash
cd ..

# Install S3 client library
pip install boto3

# Set your API key
export GEMINI_API_KEY="AIza_..."

# Embed and upload chunks
python ingest_manuals.py --bucket siemens-rag-knowledge-base
```

**Expected output:**
```
=== Siemens RAG Ingestion Pipeline ===
Embedding model : text-embedding-004 (768-dim, Google)
S3 bucket       : siemens-rag-knowledge-base
Chunks to ingest: 3

[1/3] Embedding chunk 'chunk_001' ...
[2/3] Embedding chunk 'chunk_002' ...
[3/3] Embedding chunk 'chunk_003' ...

Uploading 3 chunks (28.4 KB) → s3://siemens-rag-knowledge-base/chunks/embeddings.json
Upload complete.
Knowledge base ready: s3://siemens-rag-knowledge-base/chunks/embeddings.json
```

#### Step 3: Test the API with curl

```bash
# Replace with your actual API URL from Step 1
API_URL="https://<api-id>.execute-api.us-east-1.amazonaws.com"

# Test a straightforward question
curl -s -X POST "$API_URL/ask-assistant" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the vibration trip thresholds for the SGT series?"}' \
  | python -m json.tool
```

**Response shape:**
```json
{
  "answer": "According to Section 7, bearing vibration trip threshold is > 5.0 mm/s RMS...",
  "sources": [
    {
      "id": "chunk_002",
      "section": "Section 7 & 18: Vibration Thresholds and Fault Remediation",
      "score": 0.8912,
      "preview": "SIEMENS SGT-SERIES — SECTION 7: VIBRATION THRESHOLDS..."
    }
  ],
  "model": "gemini-2.0-flash",  // default
  // Fallback order: gemini-2.0-flash → gemini-2.5-flash → gemini-2.5-pro
  "embedding_model": "text-embedding-004",
  "top_k": 3,
  "diagnostics": {
    "timings": {
      "embed_s": 0.34,
      "s3_load_s": 0.15,
      "similarity_s": 0.02,
      "gemini_s": 1.28,
      "total_s": 1.79
    },
    "rag_skipped": false,
    "chunk_count": 3
  }
}
```

#### Step 4: Configure & Deploy Frontend

```bash
cd frontend

# Create environment file
echo "VITE_API_URL=$API_URL" > .env

# Install dependencies
npm install

# Dry-run build to verify setup
npm run build

# Or run dev server locally
npm run dev
# Open http://localhost:5173/siemens/
```

---

### Option B: Deploy Frontend to Vercel (Optional)

If you want the frontend accessible beyond localhost:

1. **Push this repo to GitHub** (if not already)
2. **Import to Vercel:**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Select this repository
   - Set **Root Directory** to `frontend`
   - Add env var: `VITE_API_URL` → your API URL from Step 1
   - Click Deploy

3. **Update CORS** in your backend (production security):
   ```bash
   cd backend
   sam deploy --parameter-overrides AllowedOrigin="https://your-vercel-app.vercel.app"
   ```

---

## Subsequent Deployments

### Backend (Resume from Saved Config)

```bash
cd backend
sam build
sam deploy
# Uses parameters cached in samconfig.toml — no guided prompts
```

### Frontend (Rebuild for Vercel)

If you made changes to frontend code:

```bash
cd frontend
npm run build
git add dist/
git commit -m "Update frontend build"
git push   # Vercel auto-deploys
```

---

---

## 📊 Monitoring & Diagnostics

Every request to `/ask-assistant` returns detailed timing and retrieval information:

```json
{
  "diagnostics": {
    "timings": {
      "embed_s": 0.34,         // Query embedding latency
      "s3_load_s": 0.15,       // S3 download + cache, or 0 if /tmp hit
      "similarity_s": 0.02,    // Cosine similarity scoring (pure Python)
      "gemini_s": 1.28,        // LLM generation
      "total_s": 1.79          // End-to-end
    },
    "rag_skipped": false,      // True if retrieval failed; fallback to general knowledge
    "chunk_count": 3           // Number of chunks injected into context
  }
}
```

**What to monitor:**
- **`embed_s` > 1.0s**: May indicate Gemini API throttling. Add backoff/retry logic if persistent.
- **`s3_load_s` > 0.5s**: First request after Lambda cold-start. Subsequent warm invocations should cache to `/tmp` (TTL: 1 hour).
- **`total_s` > 5.0s**: May exceed client timeout. Consider increasing Lambda memory (✓ template.yaml: 768 MB default) or reducing top-K.
- **`rag_skipped: true`**: Knowledge base unavailable. Check S3 bucket permissions and `ingest_manuals.py` run.

---

## 🏗️ Production Considerations

| Aspect | Current Status | Path to Production |
|--------|--------|--------|
| **Secrets** | API key in env var | → AWS Secrets Manager + KMS encryption |
| **Rate limiting** | None | → API Gateway throttling + Lambda reserved concurrency |
| **Monitoring** | CloudWatch Logs | → CloudWatch Metrics dashboard + SNS alerts |
| **CORS** | `AllowedOrigin: *` | → Restrict to Vercel domain on first deploy |
| **Knowledge base** | 3 sample chunks | → Ingest full manual PDFs; migrate to OpenSearch if > 2K chunks |
| **Latency SLA** | < 2s p95 | → Profile under load; consider provisioned concurrency if critical |
| **Cost** | ~$0.001–0.01/query | → Monitor billing; cold-starts drive reserved concurrency ROI |

---

## 🔗 Integration with Main Portfolio

This repository is designed as a **Git submodule** of [angelorscoelho/angelorscoelho.dev](https://github.com/angelorscoelho/angelorscoelho.dev), served live at `https://www.angelorscoelho.dev/siemens`.

### Setup Submodule

```bash
# In the main portfolio repo:
git submodule add https://github.com/angelorscoelho/siemens.git siemens
git submodule update --init --remote siemens
```

### Build & Deploy

In the main site's CI/CD pipeline:

```bash
cd siemens/frontend
npm ci
VITE_API_URL=https://api-url-here npm run build
# Output: dist/ (prefixed with /siemens/)
cp -r dist/* ../../public/siemens/
```

The main site's `vercel.json` should rewrite subroutes:

```json
{ "source": "/siemens/(.*)", "destination": "/siemens/index.html" }
```

### Why Separate Repo?

- **Standalone portfolio piece**: Reviewers can inspect a complete, independent project with its own README and infrastructure
- **Backend isolation**: AWS SAM templates don't belong in a frontend-heavy portfolio repo  
- **CI/CD autonomy**: Changes to siemens don't trigger full portfolio rebuilds; submodule pointer advances independently

---

## 🤖 Automated Deployment (CI/CD)

Push to `main` in this repo → `.github/workflows/update-main-site.yml` → Advance submodule pointer in `angelorscoelho.dev` → Vercel rebuilds portfolio → Live update at `angelorscoelho.dev/siemens`.

**One-time setup:**

1. In this (siemens) repo: **Settings → Secrets and variables → Actions**
2. Create secret `MAIN_SITE_PAT`:
   - Go to GitHub → **Personal access tokens** → **Tokens (classic)**
   - Generate token with `repo` scope (or fine-grained with `Contents: Read & Write` on `angelorscoelho/angelorscoelho.dev`)
   - Copy token value → paste into siemens repo secret
3. Push to `main` and workflow runs automatically

---

## 📡 API Documentation

### `POST /ask-assistant`

**Purpose:** Query the gas turbine maintenance assistant with real RAG retrieval.

**Request:**
```bash
curl -X POST "https://<api-id>.execute-api.us-east-1.amazonaws.com/ask-assistant" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the vibration thresholds for bearing fault detection?"}'
```

**Response (200 OK):**
```json
{
  "answer": "According to Section 7 of the maintenance manual, bearing vibration thresholds are: Normal operation < 2.5 mm/s, Warning 2.5–5.0 mm/s, Trip > 5.0 mm/s RMS...",
  "sources": [
    {
      "id": "chunk_002",
      "section": "Section 7 & 18: Vibration Thresholds and Fault Remediation",
      "score": 0.8912,
      "preview": "SIEMENS SGT-SERIES — SECTION 7: VIBRATION THRESHOLDS Bearing Vibration Alert Levels..."
    }
  ],
  "model": "gemini-2.0-flash",  // default
  // Fallback order: gemini-2.0-flash → gemini-2.5-flash → gemini-2.5-pro
  "embedding_model": "text-embedding-004",
  "top_k": 3,
  "diagnostics": {
    "timings": {...},
    "rag_skipped": false,
    "chunk_count": 3
  }
}
```

**Error Response (4xx / 5xx):**
```json
{ "error": "Human-readable error message (e.g., 'Missing query field', 'Gemini API rate limit exceeded')" }
```

**CORS Headers:**
- `Access-Control-Allow-Origin`: Echoes request origin (or configured allowlist)
- `Access-Control-Allow-Methods`: POST, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type, Authorization

---

## 🧹 Cleanup & Teardown

To delete all AWS resources:

```bash
cd backend
sam delete --stack-name siemens-poc
```

**What gets destroyed:**
- CloudFormation stack
- API Gateway HTTP API
- Lambda function
- S3 bucket (⚠️ with `embeddings.json`)
- IAM roles & policies

---

## 📚 Knowledge Base Management

### Adding New Manual Chunks

Edit `ingest_manuals.py` and add to the `CHUNKS` list:

```python
CHUNKS = [
    {
        "id": "chunk_004",
        "text": "Your turbine manual excerpt here...",
        "metadata": {
            "source": "SE-GT-MM-4200",
            "section": "Section X: Your Topic",
            "revision": "7",
        },
    },
    # ... more chunks
]
```

Then re-ingestion:

```bash
python ingest_manuals.py --bucket siemens-rag-knowledge-base
```

### Scaling Beyond 500 Chunks

When your knowledge base exceeds ~2,000 chunks, S3 JSON download becomes bottleneck:

**Path to production-scale RAG:**
1. Replace S3 + Python cosine similarity with **OpenSearch** or **pgvector**
2. Change `_retrieve_top_k()` to query the vector index instead
3. Lambda invokes index directly (same contract, different backend)
4. No changes needed to frontend or API contract

---

## 🏆 Technical Depth & Implementation Details

### Real RAG Pipeline (Not Mock)

The system implements a complete semantic search + grounding workflow:

**Query Flow:**
```
User Query
    ↓
Embed (text-embedding-004 REST)
    ↓
Download S3 manifest (cached 1 hour in /tmp)
    ↓
Score all chunks (cosine similarity, pure Python)
    ↓
Rank by relevance score (descending)
    ↓
Inject top-K chunks into system prompt
    ↓
Generate answer (Gemini REST)
    ↓
Return answer + sources + timing data
```

**Key metrics:**
- Query embedding: ~0.3–0.4s (Google REST)
- Cosine similarity: ~0.02s for 200 chunks (pure Python, no NumPy)
- LLM generation: ~1.0–2.0s (Gemini 2.5 Pro)
- **Total p95:** ~2.5s (cold-start); ~1.7s (warm, with /tmp cache)

### Lambda Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **768 MB memory** | Balances cold-start latency (~1s) with cost ($0.0000083/s) |
| **90s timeout** | Covers slow Gemini calls + full RAG pipeline with margin |
| **No layer dependencies** | `boto3` is built-in; Gemini + embeddings via stdlib `urllib` |
| **/tmp caching (3600s)** | Warm invocations skip S3 roundtrip; manifests < 1 MB |
| **Graceful fallback** | If S3/RAG fails, still generates answer using fallback prompt |

### The Ingestion Pipeline

`ingest_manuals.py` is a one-time, operator-run script that:

1. **Chunks** the source material
   - Input: 3 sample Siemens SGT manual sections (hard-coded in CHUNKS list)
   - Output: Focused ~300–600 token excerpts, each a single topic
   
2. **Embeds** each chunk
   - Model: Google `text-embedding-004` (768-dim vectors)
   - Cost: ~$0.000008/query, amortized over chunk lifetime (no re-embedding)
   - REST API via stdlib `urllib`

3. **Uploads to S3**
   - Format: `chunks/embeddings.json` — single flat JSON array
   - Size: 28.4 KB (3 chunks); scales linearly with corpus
   - Access: Lambda reads at query time (IAM role allows `s3:GetObject`)

**Example embeddings.json structure:**
```json
[
  {
    "id": "chunk_001",
    "text": "SIEMENS SGT-SERIES — SECTION 4: INSPECTION INTERVALS...",
    "embedding": [0.023, -0.041, 0.156, ..., -0.089],  // 768 floats
    "metadata": {
      "source": "SE-GT-MM-4200",
      "section": "Section 4: Inspection Intervals",
      "revision": "7"
    }
  },
  // ... more chunks
]
```

### Error Handling & Resilience

**RAG Failure Modes:**
| Failure | Handler | Impact |
|---------|---------|--------|
| S3 unreachable | Log warning, skip RAG, use fallback prompt | LLM answers without retrieval (general knowledge) |
| S3 timeout (> 5s) | Early bailout before Gemini call | Asks user to retry |
| Gemini rate limit (429) | Return explicit 429 to client | Client-side backoff |
| Gemini auth failure (401) | Return 500 + error message | Operator checks API key |
| Lambda timeout (> 90s) | CloudWatch timeout error | Investigate Gemini latency |

**Graceful Degradation Example:**
```python
# If RAG fails for any reason:
if rag_skipped:
    system_prompt = FALLBACK_SYSTEM_PROMPT  # Uses general knowledge
else:
    system_prompt = SYSTEM_PROMPT           # Context-grounded answers
```

Client always receives an answer — no silent failures. Diagnostics flag whether context was used.

### Deployment Automation

SAM template (`template.yaml`) declares:
- **API Gateway**: HTTP API (lower cost than REST API) with CORS configuration
- **Lambda**: Function with IAM role, S3 read permissions, cloudwatch logs
- **S3 bucket**: Private (blocks all public access), Lambda-readable only
- **Parameters**: GeminiApiKey (NoEcho), GeminiModel (AllowedValues list), S3BucketName, AllowedOrigin

**One-command deploy** encodes all infrastructure — no manual AWS Console steps.

---

## 🧪 Local Development & Testing

### Running the Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and set VITE_API_URL to your deployed API endpoint

# Start dev server (http://localhost:5173/siemens/)
npm run dev
```

### Testing the Lambda Locally (SAM)

```bash
cd backend

# Build the project
sam build

# Start local emulator
sam local start-api

# In another terminal, test the Lambda
curl -X POST "http://localhost:3000/ask-assistant" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the vibration thresholds?"}'
```

### Running the Ingestion Script Locally

```bash
# From repo root
pip install boto3

# Embed chunks and upload to S3
export GEMINI_API_KEY="AIza_..."
python ingest_manuals.py --bucket siemens-rag-knowledge-base --profile default
```

### Pre-Deployment Checklist

- [ ] Frontend builds without errors: `npm run build`
- [ ] Backend builds without errors: `sam build`
- [ ] AWS credentials configured: `aws sts get-caller-identity`
- [ ] Google Gemini API key is valid (test with a simple curl)
- [ ] S3 bucket name is globally unique
- [ ] No leftover `.env` files with secrets (use `.gitignore`)
- [ ] Knowledge base ingested: `python ingest_manuals.py ...`

---

## 🔧 Troubleshooting

### "Missing 'query' field in request body"
**Cause:** Request JSON is malformed or empty.
**Fix:** Ensure your request body is valid JSON with a `"query"` key.

### "Gemini API rate limit exceeded" (429)
**Cause:** Too many embedding or chat requests in short time.
**Fix:** Implement exponential backoff in your client. Contact Google for quota increase if persistent.

### "S3 bucket does not exist" (404)
**Cause:** Ingestion was never run, bucket was deleted, or wrong bucket name.
**Fix:** Run `python ingest_manuals.py --bucket siemens-rag-knowledge-base` from repo root.

### "CORS error: Access-Control-Allow-Origin"
**Cause:** Frontend origin not whitelisted in SAM parameters.
**Fix:** Redeploy backend with correct `AllowedOrigin`:
```bash
sam deploy --parameter-overrides AllowedOrigin="https://your-frontend-url.com"
```

### "Lambda timeout (Task timed out after 90 seconds)"
**Cause:** Gemini API is slow or network latency is high.
**Fix:** Increase Lambda timeout in `template.yaml` (Timeout: 120) and redeploy.

### "Cold-start latency is too high (> 3s)"
**Cause:** First invocation after deploy requires initialization.
**Fix:** Either accept cold-start penalty or configure Lambda Reserved Concurrency (`sam deploy --parameter-overrides ReservedConcurrentExecutions=1`).

### "Frontend can't reach backend API"
**Cause:** `VITE_API_URL` is incorrect or missing.
**Fix:** 
```bash
cd frontend
echo "VITE_API_URL=https://<your-api-id>.execute-api.us-east-1.amazonaws.com" > .env
npm run dev
```

---

## 📖 Further Reading

- **AWS SAM Documentation**: [docs.aws.amazon.com/serverless-application-model](https://docs.aws.amazon.com/serverless-application-model/)
- **Vue 3 Guide**: [vuejs.org](https://vuejs.org/)
- **Google Gemini API**: [ai.google.dev](https://ai.google.dev/)
- **Retrieval-Augmented Generation (RAG)**: [arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author & Contact

**Angelo Coelho**
- Portfolio: [angelorscoelho.dev](https://www.angelorscoelho.dev)
- GitHub: [github.com/angelorscoelho](https://github.com/angelorscoelho)
- LinkedIn: [linkedin.com/in/angelorscoelho](https://linkedin.com/in/angelorscoelho)

---

## 🎓 Project Context

This is a **proof of concept** demonstrating industrial AI/ML pipeline architecture for the Siemens Energy Distributed AI Factory. It showcases:

- Real retrieval-augmented generation (not mock), cost-effectively implemented
- Production-grade decisions in infrastructure, dependency management, and error handling
- Honest, auditable architecture with no hidden complexity
- Scalable foundation ready for full-scale maintenance intelligence system

**Not production-ready** — the 3 sample knowledge base chunks are illustrative. For production, ingest the full maintenance manuals and monitor Gemini API costs.

---

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome. Feel free to open an issue or contact the author directly.

---

*Last updated: March 13, 2026*

