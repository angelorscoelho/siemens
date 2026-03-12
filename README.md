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
  "context": "<full maintenance manual excerpt used as RAG context>",
  "model": "gpt-4o-mini"
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

