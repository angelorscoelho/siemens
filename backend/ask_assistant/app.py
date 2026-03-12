"""
Siemens Energy — Gas Turbine AI Maintenance Assistant
Lambda handler: /ask-assistant  (POST)

RAG Mock Pipeline
-----------------
1. Receive user query via POST body {"query": "..."}
2. "Retrieve" context from a hardcoded Gas Turbine Maintenance Manual excerpt
   (this simulates a vector-DB retrieval step in a real RAG pipeline)
3. Construct a grounded prompt and call the Google Gemini API
4. Return {"answer": "...", "context": "..."} to the client

Model selection rationale
-------------------------
gemini-2.0-flash is used by default for its exceptional speed and quality
balance. For the highest-quality reasoning on complex technical queries,
gemini-1.5-pro is offered as an alternative. Both support the 1M-token
context window required for large maintenance manual retrieval.
"""

import json
import os
import logging
import urllib.request
import urllib.error

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ── Mock Knowledge Base ────────────────────────────────────────────────────────
MAINTENANCE_MANUAL_EXCERPT = """
SIEMENS ENERGY SGT-SERIES GAS TURBINE — MAINTENANCE MANUAL (EXCERPT)
Document Ref: SE-GT-MM-4200 | Revision 7 | Confidential — PoC Demonstration Only

=== SECTION 4: INSPECTION INTERVALS ===
Hot Gas Path (HGP) Inspection: Every 8,000 Equivalent Operating Hours (EOH) or 900 starts.
  Components inspected: combustion liners, transition pieces, first-stage nozzles and blades,
  turbine shrouds.
Major Overhaul: Every 24,000 EOH or 2,400 starts (whichever comes first).
Combustion Inspection: Every 4,000 EOH or 450 starts.
  Includes: fuel nozzle cleaning, cross-fire tube inspection, liner replacement if wear > 20%.

=== SECTION 7: VIBRATION THRESHOLDS ===
Bearing Vibration Alert Levels (peak-to-peak, mm/s RMS):
  • Normal operation : < 2.5 mm/s
  • Warning (reduce load)  : 2.5 – 5.0 mm/s
  • Trip / Emergency shutdown : > 5.0 mm/s
Common causes of high vibration:
  - Rotor imbalance (often after blade replacement)
  - Bearing wear or lubrication failure
  - Thermal bow (transient at startup — typically resolves within 10 minutes)
  - Foreign object ingestion (FOD)
Corrective actions:
  1. Reduce load to < 70% rated capacity.
  2. Monitor trend for 15 minutes; if declining, continue at reduced load.
  3. If stable or increasing above 4.0 mm/s, initiate planned shutdown.
  4. Inspect bearings 1–4 and perform rotor balancing.

=== SECTION 9: EXHAUST TEMPERATURE ===
Rated exhaust temperature range: 520°C – 580°C (model-dependent).
Warning threshold: > 600°C sustained for > 5 minutes.
Emergency shutdown threshold: > 650°C.
Common causes of elevated exhaust temperature:
  - Fuel system malfunction (excessive fuel flow)
  - Turbine blade oxidation / thermal barrier coating degradation
  - Compressor fouling (reduces airflow, increases flame temperature)
  - Thermocouple calibration drift (verify with redundant sensor)
Corrective actions:
  1. Verify thermocouple reading against adjacent sensors.
  2. Check fuel control valve position and fuel flow meter.
  3. Schedule compressor offline water wash if fouling index > 0.95.

=== SECTION 12: COMPRESSOR MAINTENANCE ===
Online water wash: every 500 EOH or when compressor efficiency drops > 1.5%.
Offline water wash (higher effectiveness): every 2,000 EOH.
Blade inspection for erosion/corrosion: at every combustion inspection.
Inlet filter replacement: per OEM schedule or ΔP > 25 mbar across filter bank.

=== SECTION 15: LUBRICATION SYSTEM ===
Lube oil specification: ISO VG 32 turbine oil, ash-free, anti-oxidant additive.
Oil change interval: 4,000 EOH or annually (whichever comes first).
Oil temperature limits: 45°C minimum at bearing inlet; 90°C maximum at bearing outlet.
Low oil pressure trip: < 1.2 bar (abs) at main header.
"""

SYSTEM_PROMPT = (
    "You are an expert gas turbine maintenance engineer at Siemens Energy. "
    "Answer the user's question using ONLY the information contained in the "
    "provided maintenance manual excerpt. If the answer cannot be found in the "
    "excerpt, say so explicitly — do NOT make up information. "
    "Be concise, precise, and use engineering terminology appropriate for "
    "a field maintenance technician."
)

# Gemini REST API base URL
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def _build_cors_headers(event: dict) -> dict:
    """Return CORS headers. Echoes the request Origin if present."""
    origin = (event.get("headers") or {}).get("origin", "*")
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


def _call_gemini(api_key: str, model: str, prompt: str, max_output_tokens: int = 800) -> str:
    """
    Call the Google Gemini generateContent REST endpoint.
    Uses only stdlib (urllib) to avoid extra Lambda layer dependencies.
    """
    url = f"{GEMINI_API_BASE}/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "systemInstruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": max_output_tokens,
            "candidateCount": 1,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
        ],
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read().decode("utf-8"))

    # Extract generated text
    candidates = body.get("candidates", [])
    if not candidates:
        raise ValueError("Gemini returned no candidates.")

    parts = candidates[0].get("content", {}).get("parts", [])
    if not parts:
        raise ValueError("Gemini candidate has no text parts.")

    return parts[0].get("text", "").strip()


def lambda_handler(event: dict, context) -> dict:  # noqa: ANN001
    cors_headers = _build_cors_headers(event)

    # ── Handle CORS preflight ────────────────────────────────────────────────
    if event.get("requestContext", {}).get("http", {}).get("method", "").upper() == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    # ── Parse request body ───────────────────────────────────────────────────
    try:
        body = json.loads(event.get("body") or "{}")
        query = body.get("query", "").strip()
        if not query:
            return _error(400, "Missing 'query' field in request body.", cors_headers)
    except json.JSONDecodeError as exc:
        return _error(400, f"Invalid JSON body: {exc}", cors_headers)

    logger.info("Received query: %s", query)

    # ── Validate API key ─────────────────────────────────────────────────────
    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        logger.error("GEMINI_API_KEY environment variable is not set.")
        return _error(500, "Server configuration error: Gemini API key not set.", cors_headers)

    # Model: gemini-2.0-flash is the recommended default (fast, capable, cost-effective).
    # Override via GEMINI_MODEL env var — e.g. gemini-1.5-pro for highest quality.
    model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
    logger.info("Using Gemini model: %s", model)

    # ── Build grounded RAG prompt ────────────────────────────────────────────
    full_prompt = (
        f"MAINTENANCE MANUAL EXCERPT:\n{MAINTENANCE_MANUAL_EXCERPT}\n\n"
        f"QUESTION: {query}"
    )

    # ── Call Gemini ──────────────────────────────────────────────────────────
    try:
        answer = _call_gemini(api_key, model, full_prompt)
        logger.info("Gemini response generated successfully.")
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        logger.exception("Gemini HTTP error %d: %s", exc.code, error_body)
        if exc.code == 400:
            return _error(400, "Gemini API bad request. Check query format.", cors_headers)
        if exc.code in (401, 403):
            return _error(500, "Gemini authentication failed. Check your API key.", cors_headers)
        if exc.code == 429:
            return _error(429, "Gemini rate limit exceeded. Please retry after a moment.", cors_headers)
        return _error(502, f"Gemini API error {exc.code}. Please try again.", cors_headers)
    except urllib.error.URLError:
        logger.exception("Network error calling Gemini.")
        return _error(502, "Network error reaching Gemini API. Please try again.", cors_headers)
    except ValueError as exc:
        logger.exception("Unexpected Gemini response format: %s", exc)
        return _error(502, "Unexpected Gemini response format. Please try again.", cors_headers)

    # ── Return result ────────────────────────────────────────────────────────
    payload = {
        "answer": answer,
        "context": MAINTENANCE_MANUAL_EXCERPT.strip(),
        "model": model,
    }
    return {
        "statusCode": 200,
        "headers": {**cors_headers, "Content-Type": "application/json"},
        "body": json.dumps(payload),
    }


def _error(status: int, message: str, headers: dict) -> dict:
    logger.warning("Returning error %d: %s", status, message)
    return {
        "statusCode": status,
        "headers": {**headers, "Content-Type": "application/json"},
        "body": json.dumps({"error": message}),
    }
