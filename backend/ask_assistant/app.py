"""
Siemens Energy — Gas Turbine AI Maintenance Assistant
Lambda handler: /ask-assistant  (POST)

Real RAG Pipeline (S3 + Gemini Embeddings + Cosine Similarity)
--------------------------------------------------------------
1. Receive user query via POST body {"query": "..."}
2. Embed the query using Google text-embedding-004 (768-dim vector)
3. Download pre-computed chunk embeddings from S3 (single JSON manifest)
4. Rank chunks by cosine similarity; inject top-K into the system prompt
5. Call gemini-2.0-flash with the grounded context
6. Return {"answer": "...", "sources": [...], "model": "..."} to the client

No external SDK required — both APIs called via stdlib urllib.

S3 knowledge base layout
-------------------------
  s3://{S3_BUCKET_NAME}/chunks/embeddings.json
      -> JSON array of objects:
          { "id": str, "text": str, "embedding": [float, ...], "metadata": {...} }

Run ingest_manuals.py once locally to populate the bucket before first use.

Environment variables (set via SAM template.yaml)
--------------------------------------------------
    GEMINI_API_KEY  -- Google AI Studio / Vertex AI key
    GEMINI_MODEL    -- chat model (default: gemini-2.0-flash)
            Fallback order: gemini-2.0-flash → gemini-2.5-flash → gemini-2.5-pro
    S3_BUCKET_NAME  -- bucket containing chunks/embeddings.json
    RAG_TOP_K       -- number of chunks to retrieve (default: 3)
"""

import json
import math
import os
import time
import logging
import urllib.request
import urllib.error

import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Constants
EMBEDDING_MODEL = "text-embedding-004"       # Google 768-dim embedding model
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
S3_EMBEDDINGS_KEY = "chunks/embeddings.json" # single manifest downloaded per request
DEFAULT_TOP_K = 3                            # context chunks injected into the prompt

# /tmp cache for embeddings (survives across warm Lambda invocations)
_CACHE_PATH = "/tmp/embeddings_cache.json"
_CACHE_TTL_SECONDS = 3600  # 1 hour
MIN_REMAINING_MS = 15_000  # early bailout threshold (ms)
MAX_RAG_TIME_SECONDS = 30  # if RAG takes longer, skip context

SYSTEM_PROMPT = (
    "You are an expert gas turbine maintenance engineer at Siemens Energy. "
    "You are given retrieved excerpts from the official Siemens SGT-series Maintenance Manual "
    "as [CONTEXT] below. Answer the question using ONLY the provided context. "
    "When the question involves a RISK or NOK status alert, produce a structured action plan "
    "with numbered steps and estimated timeframes. "
    "If the context is insufficient, state clearly what additional manual section should be consulted. "
    "Use precise engineering terminology appropriate for a field maintenance technician."
)

FALLBACK_SYSTEM_PROMPT = (
    "You are an expert gas turbine maintenance engineer at Siemens Energy. "
    "Answer the following question using your general engineering knowledge. "
    "Note: the retrieval-augmented context was unavailable for this request, "
    "so state clearly that the answer is based on general knowledge and the user "
    "should verify against the official Siemens SGT-series Maintenance Manual."
)

# S3 client (module-level for Lambda container reuse)
_s3 = boto3.client("s3")


# ── Timing helpers ────────────────────────────────────────────────────────────

def _remaining_ms(context) -> int:
    """Return remaining Lambda execution time in ms, or a large value if unavailable."""
    try:
        return context.get_remaining_time_in_millis()
    except Exception:
        return 300_000  # 5 min fallback for local testing


def _elapsed_since(start: float) -> float:
    """Return seconds elapsed since *start*."""
    return time.time() - start


# ── Vector helpers ────────────────────────────────────────────────────────────

def _dot(a: list, b: list) -> float:
    """Dot product of two equal-length vectors."""
    return sum(x * y for x, y in zip(a, b))


def _norm(v: list) -> float:
    """L2 norm of a vector."""
    return math.sqrt(sum(x * x for x in v))


def _cosine_similarity(a: list, b: list) -> float:
    """Cosine similarity between two vectors. Returns 0.0 on zero-norm input."""
    denom = _norm(a) * _norm(b)
    return _dot(a, b) / denom if denom else 0.0


# ── RAG retrieval ─────────────────────────────────────────────────────────────

def _embed_query(api_key: str, query: str) -> list:
    """
    Embed a user query with Google text-embedding-004.
    Returns a 768-dimensional float vector via the Gemini REST API.
    """
    url = f"{GEMINI_API_BASE}/{EMBEDDING_MODEL}:embedContent?key={api_key}"
    payload = json.dumps({
        "model": f"models/{EMBEDDING_MODEL}",
        "content": {"parts": [{"text": query}]},
    }).encode("utf-8")
    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    return body["embedding"]["values"]


def _load_chunks_from_s3(bucket: str) -> list:
    """
    Download the pre-computed embeddings manifest from S3.
    Uses /tmp cache with a 1-hour TTL to avoid repeated downloads on warm starts.
    """
    # Check /tmp cache first
    try:
        if os.path.exists(_CACHE_PATH):
            age = time.time() - os.path.getmtime(_CACHE_PATH)
            if age < _CACHE_TTL_SECONDS:
                logger.info("Loading embeddings from /tmp cache (age=%.1fs)", age)
                with open(_CACHE_PATH, "r", encoding="utf-8") as f:
                    chunks = json.load(f)
                logger.info("Loaded %d chunks from cache.", len(chunks))
                return chunks
            logger.info("Cache expired (age=%.1fs), re-downloading.", age)
    except Exception as exc:
        logger.warning("Cache read failed: %s — falling back to S3.", exc)

    logger.info("Downloading embeddings manifest from s3://%s/%s", bucket, S3_EMBEDDINGS_KEY)
    obj = _s3.get_object(Bucket=bucket, Key=S3_EMBEDDINGS_KEY)
    raw = obj["Body"].read().decode("utf-8")
    chunks = json.loads(raw)
    logger.info("Loaded %d chunks from S3.", len(chunks))

    # Write to /tmp cache
    try:
        with open(_CACHE_PATH, "w", encoding="utf-8") as f:
            f.write(raw)
        logger.info("Embeddings cached to %s", _CACHE_PATH)
    except Exception as exc:
        logger.warning("Failed to write cache: %s", exc)

    return chunks


def _retrieve_top_k(query_embedding: list, chunks: list, top_k: int) -> list:
    """
    Score every chunk by cosine similarity to the query embedding,
    return the top_k chunks sorted by descending score.
    Pure Python -- no NumPy, no additional dependencies.
    """
    scored = [
        {**chunk, "_score": _cosine_similarity(query_embedding, chunk["embedding"])}
        for chunk in chunks
    ]
    scored.sort(key=lambda c: c["_score"], reverse=True)
    return scored[:top_k]


# ── Gemini chat ───────────────────────────────────────────────────────────────

def _call_gemini_chat(api_key: str, model: str, context_text: str, query: str,
                      *, system_prompt: str = SYSTEM_PROMPT) -> str:
    """
    Call the Gemini generateContent REST endpoint with retrieved context.
    Uses stdlib urllib -- zero external dependencies.
    """
    url = f"{GEMINI_API_BASE}/{model}:generateContent?key={api_key}"
    if context_text:
        user_message = (
            f"[CONTEXT -- retrieved from Siemens SGT Maintenance Manual]\n"
            f"{context_text}\n\n"
            f"[QUESTION]\n{query}"
        )
    else:
        user_message = f"[QUESTION]\n{query}"
    payload = json.dumps({
        "contents": [{"role": "user", "parts": [{"text": user_message}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 1200,
            "candidateCount": 1,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HARASSMENT",         "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HATE_SPEECH",        "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",  "threshold": "BLOCK_ONLY_HIGH"},
        ],
    }).encode("utf-8")
    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    candidates = body.get("candidates", [])
    if not candidates:
        raise ValueError(f"Gemini returned no candidates. Response: {body}")
    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        raise ValueError("Gemini candidate has no text parts.")
    return parts[0].get("text", "").strip()


# ── CORS helpers ──────────────────────────────────────────────────────────────

def _build_cors_headers(event: dict) -> dict:
    """Return CORS headers. Echoes the request Origin if present."""
    origin = (event.get("headers") or {}).get("origin", "*")
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


def _error(status: int, message: str, headers: dict) -> dict:
    logger.warning("Returning error %d: %s", status, message)
    return {
        "statusCode": status,
        "headers": {**headers, "Content-Type": "application/json"},
        "body": json.dumps({"error": message}),
    }


# ── Lambda entry point ────────────────────────────────────────────────────────

def lambda_handler(event: dict, context) -> dict:  # noqa: ANN001
    handler_start = time.time()
    cors_headers = _build_cors_headers(event)

    # Handle CORS preflight
    if event.get("requestContext", {}).get("http", {}).get("method", "").upper() == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    # Parse request body
    try:
        body = json.loads(event.get("body") or "{}")
        query = body.get("query", "").strip()
        if not query:
            return _error(400, "Missing 'query' field in request body.", cors_headers)
    except json.JSONDecodeError as exc:
        return _error(400, f"Invalid JSON body: {exc}", cors_headers)

    logger.info("Received query (first 120 chars): %s", query[:120])

    # Read environment configuration
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable is not set.")
        return _error(500, "Server configuration error: Gemini API key not set.", cors_headers)

    # Fallback tactic: try 2.5-flash, then 2.0-flash, then 2.5-pro
    chat_model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    bucket = os.environ.get("S3_BUCKET_NAME", "")
    if not bucket:
        logger.error("S3_BUCKET_NAME environment variable is not set.")
        return _error(500, "Server configuration error: S3 bucket name not set.", cors_headers)

    top_k = int(os.environ.get("RAG_TOP_K", DEFAULT_TOP_K))
    timings = {}

    # ── Step 1: Embed the user query ──────────────────────────────────────
    if _remaining_ms(context) < MIN_REMAINING_MS:
        logger.warning("EARLY BAILOUT before embed — only %d ms left", _remaining_ms(context))
        return _error(504, "Insufficient time remaining for processing.", cors_headers)

    try:
        t0 = time.time()
        logger.info("[step=embed] start model=%s remaining_ms=%d", EMBEDDING_MODEL, _remaining_ms(context))
        query_embedding = _embed_query(api_key, query)
        timings["embed_s"] = round(_elapsed_since(t0), 2)
        logger.info("[step=embed] done in %.2fs", timings["embed_s"])
    except urllib.error.HTTPError as exc:
        logger.exception("Gemini embedding HTTP error %d", exc.code)
        return _error(502, f"Embedding service error (HTTP {exc.code}).", cors_headers)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Gemini embedding error: %s", exc)
        return _error(502, f"Embedding service error: {exc}", cors_headers)

    # ── Step 2: Download chunk embeddings from S3 ─────────────────────────
    rag_skipped = False
    top_chunks = []
    context_text = ""

    if _remaining_ms(context) < MIN_REMAINING_MS:
        logger.warning("EARLY BAILOUT before S3 — only %d ms left, skipping RAG", _remaining_ms(context))
        rag_skipped = True
    else:
        try:
            t0 = time.time()
            logger.info("[step=s3_load] start remaining_ms=%d", _remaining_ms(context))
            chunks = _load_chunks_from_s3(bucket)
            timings["s3_load_s"] = round(_elapsed_since(t0), 2)
            logger.info("[step=s3_load] done in %.2fs (%d chunks)", timings["s3_load_s"], len(chunks))
        except Exception as exc:  # noqa: BLE001
            logger.exception("S3 retrieval error: %s — falling back to no-RAG", exc)
            rag_skipped = True

    # ── Step 3: Cosine similarity -> top-K retrieval ──────────────────────
    if not rag_skipped:
        t0 = time.time()
        top_chunks = _retrieve_top_k(query_embedding, chunks, top_k)
        timings["similarity_s"] = round(_elapsed_since(t0), 2)
        logger.info(
            "[step=similarity] done in %.2fs — top-%d scores: %s",
            timings["similarity_s"], top_k,
            [round(c["_score"], 4) for c in top_chunks],
        )

        context_text = "\n\n---\n\n".join(
            f"[Source: {c.get('metadata', {}).get('section', c['id'])}]\n{c['text']}"
            for c in top_chunks
        )

    # ── Fallback check: if total RAG time > 30 s, skip context ────────────
    total_rag_time = _elapsed_since(handler_start)
    if total_rag_time > MAX_RAG_TIME_SECONDS and not rag_skipped:
        logger.warning("RAG pipeline took %.1fs — skipping context for Gemini call", total_rag_time)
        rag_skipped = True
        context_text = ""
        top_chunks = []

    # ── Step 4: Call Gemini chat ──────────────────────────────────────────
    if _remaining_ms(context) < MIN_REMAINING_MS:
        logger.warning("EARLY BAILOUT before Gemini — only %d ms left", _remaining_ms(context))
        return _error(504, "Insufficient time remaining for LLM call.", cors_headers)

    system_prompt = FALLBACK_SYSTEM_PROMPT if rag_skipped else SYSTEM_PROMPT

    try:
        t0 = time.time()
        logger.info("[step=gemini] start model=%s rag_skipped=%s remaining_ms=%d",
                     chat_model, rag_skipped, _remaining_ms(context))
        answer = _call_gemini_chat(api_key, chat_model, context_text, query,
                                   system_prompt=system_prompt)
        timings["gemini_s"] = round(_elapsed_since(t0), 2)
        logger.info("[step=gemini] done in %.2fs", timings["gemini_s"])
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        logger.exception("Gemini chat HTTP error %d: %s", exc.code, error_body)
        if exc.code in (401, 403):
            return _error(500, "Gemini authentication failed. Check your API key.", cors_headers)
        if exc.code == 429:
            return _error(429, "Gemini rate limit exceeded. Please retry after a moment.", cors_headers)
        return _error(502, f"Gemini API error {exc.code}. Please try again.", cors_headers)
    except (urllib.error.URLError, ValueError) as exc:
        logger.exception("Gemini chat error: %s", exc)
        return _error(502, f"LLM service error: {exc}", cors_headers)

    # ── Step 5: Return result ─────────────────────────────────────────────
    timings["total_s"] = round(_elapsed_since(handler_start), 2)
    logger.info("[step=done] total=%.2fs timings=%s", timings["total_s"], json.dumps(timings))

    sources = [
        {
            "id": c["id"],
            "section": c.get("metadata", {}).get("section", ""),
            "score": round(c["_score"], 4),
            "preview": c["text"][:200] + ("\u2026" if len(c["text"]) > 200 else ""),
        }
        for c in top_chunks
    ]
    payload = {
        "answer": answer,
        "sources": sources,
        "model": chat_model,
        "embedding_model": EMBEDDING_MODEL,
        "top_k": top_k,
        "diagnostics": {
            "timings": timings,
            "rag_skipped": rag_skipped,
            "chunk_count": len(top_chunks),
        },
    }
    return {
        "statusCode": 200,
        "headers": {**cors_headers, "Content-Type": "application/json"},
        "body": json.dumps(payload),
    }
