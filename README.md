# Siemens Energy — Gas Turbine AI Maintenance Assistant (PoC)

A Proof of Concept for the **Siemens Energy Distributed AI Factory** demonstrating an industrial RAG (Retrieval-Augmented Generation) pipeline for gas turbine maintenance.

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

Open [http://localhost:5173](http://localhost:5173) to see the app.

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
| `AllowedOrigin` | `*` for testing, or `https://your-app.vercel.app` for production |
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

## Step 4 — Deploy Frontend to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable: `VITE_API_URL` → your API Gateway URL.
5. Deploy.

> **CORS note:** After the Vercel URL is assigned, redeploy the backend with
> `AllowedOrigin` set to your exact Vercel URL for production security:
> ```bash
> sam deploy --parameter-overrides AllowedOrigin="https://your-app.vercel.app"
> ```

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

