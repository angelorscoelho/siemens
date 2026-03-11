"""
Siemens Energy — Gas Turbine AI Maintenance Assistant
Lambda handler: /ask-assistant  (POST)

RAG Mock Pipeline
-----------------
1. Receive user query via POST body {"query": "..."}
2. "Retrieve" context from a hardcoded Gas Turbine Maintenance Manual excerpt
   (this simulates a vector-DB retrieval step in a real RAG pipeline)
3. Construct a grounded prompt and call the OpenAI Chat Completions API
4. Return {"answer": "...", "context": "..."} to the client
"""

import json
import os
import logging

import openai

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ── Mock Knowledge Base ────────────────────────────────────────────────────────
# In a production RAG system this would be retrieved dynamically from a vector
# store (e.g. Pinecone, pgvector, OpenSearch) based on semantic similarity to
# the user's query.  For this PoC we use a single static excerpt that covers
# the most common gas turbine maintenance topics.

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


def _build_cors_headers(event: dict) -> dict:
    """Return CORS headers.  Echoes the request Origin if present."""
    origin = (event.get("headers") or {}).get("origin", "*")
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


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

    # ── Call OpenAI ──────────────────────────────────────────────────────────
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        logger.error("OPENAI_API_KEY environment variable is not set.")
        return _error(500, "Server configuration error: OpenAI API key not set.", cors_headers)

    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    client = openai.OpenAI(api_key=api_key)

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": (
                        f"MAINTENANCE MANUAL EXCERPT:\n{MAINTENANCE_MANUAL_EXCERPT}\n\n"
                        f"QUESTION: {query}"
                    ),
                },
            ],
            temperature=0.2,
            max_tokens=600,
        )
        answer = response.choices[0].message.content.strip()
        logger.info("OpenAI response generated successfully.")
    except openai.AuthenticationError:
        logger.exception("OpenAI authentication failed.")
        return _error(500, "OpenAI authentication failed. Check your API key.", cors_headers)
    except openai.RateLimitError:
        logger.exception("OpenAI rate limit exceeded.")
        return _error(429, "OpenAI rate limit exceeded. Please retry after a moment.", cors_headers)
    except openai.OpenAIError as exc:
        logger.exception("OpenAI API error: %s", exc)
        return _error(502, f"OpenAI API error: {exc}", cors_headers)

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
