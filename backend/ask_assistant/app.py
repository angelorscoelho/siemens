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
  - Seal rub from differential thermal expansion
  - Coupling misalignment
Corrective actions:
  1. Reduce load to < 70% rated capacity.
  2. Monitor trend for 15 minutes; if declining, continue at reduced load.
  3. If stable or increasing above 4.0 mm/s, initiate planned shutdown.
  4. Inspect bearings 1–4 and perform rotor balancing.
  5. Check lube oil supply pressure and temperature at each bearing.
  6. Perform vibration spectrum analysis to identify frequency signature (imbalance vs. misalignment).

=== SECTION 9: EXHAUST TEMPERATURE ===
Rated exhaust temperature range: 520°C – 580°C (model-dependent).
Warning threshold: > 600°C sustained for > 5 minutes.
Emergency shutdown threshold: > 650°C.
Common causes of elevated exhaust temperature:
  - Fuel system malfunction (excessive fuel flow)
  - Turbine blade oxidation / thermal barrier coating degradation
  - Compressor fouling (reduces airflow, increases flame temperature)
  - Thermocouple calibration drift (verify with redundant sensor)
  - Combustion liner damage allowing hot gas bypass
  - Inlet guide vane position error
Corrective actions:
  1. Verify thermocouple reading against adjacent sensors.
  2. Check fuel control valve position and fuel flow meter.
  3. Schedule compressor offline water wash if fouling index > 0.95.
  4. Reduce load by 10–15% and monitor temperature trend for 20 minutes.
  5. If temperature does not decrease, initiate controlled shutdown.

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

=== SECTION 18: COMMON FAULT PATTERNS & REMEDIATION ===
FAULT: Sudden vibration spike (> 2 mm/s increase within 30 minutes)
  Likely cause: Foreign object damage, blade liberation, or bearing failure.
  Immediate action: Reduce load to 50%, notify operations. If > 6 mm/s, trip immediately.
  Follow-up: Borescope inspection of compressor and turbine stages within 24 hours.

FAULT: Gradual vibration increase (< 0.5 mm/s per day)
  Likely cause: Progressive bearing wear, rotor deposit build-up, or coupling degradation.
  Action: Schedule vibration analysis. Increase monitoring frequency to hourly readings.
  Planned corrective: Bearing inspection and rotor dynamic balance at next outage.

FAULT: Exhaust temperature spread > 30°C between thermocouples
  Likely cause: Combustion liner damage, fuel nozzle blockage, or hot streak.
  Immediate action: Reduce load to 70%. Identify worst sector from thermocouple pattern.
  Follow-up: Combustion borescope inspection at first opportunity.

FAULT: High exhaust temperature with normal vibration
  Likely cause: Compressor fouling, fuel valve malfunction, or blade coating loss.
  Action: Perform online compressor wash. Verify fuel flow meter accuracy.

FAULT: High vibration with high exhaust temperature (dual exceedance)
  Likely cause: Hot-section distress, advanced blade damage, or rotor thermal distortion.
  CRITICAL ACTION: Initiate controlled shutdown immediately.
  Emergency response: Do not trip; execute controlled coast-down to protect bearings.
  Post-shutdown: Full borescope inspection + NDT of all hot-section components.

FAULT: Rapid load loss with alarm
  Likely cause: Fuel supply interruption, inlet pressure drop, or control system fault.
  Action: Check fuel header pressure. Review control system logs. Restart only after root cause identified.

=== SECTION 22: RAG ACTION PLAN TEMPLATES ===

ACTION PLAN TEMPLATE — NOK (Critical) STATUS:
This template applies when turbine parameters exceed critical thresholds.
Required inputs: user_technical_manual (unit-specific procedures), past_maintenance_history_notes (recent work history).
Step 1 [IMMEDIATE — 0–15 min]: Reduce load to 50% rated capacity. Notify shift supervisor and OEM hotline.
Step 2 [IMMEDIATE — 15–30 min]: Cross-check critical reading against redundant sensors. If confirmed, initiate controlled shutdown.
Step 3 [SHORT-TERM — 0–24 h]: Review past_maintenance_history_notes for recent maintenance that may have introduced the fault (e.g., balance quality, bearing settings, fuel nozzle replacement).
Step 4 [SHORT-TERM — 24–48 h]: Perform visual and borescope inspection per user_technical_manual Section 7 (vibration) or Section 9 (temperature).
Step 5 [MEDIUM-TERM — 2–7 days]: Complete root cause analysis. Apply corrective maintenance. Update past_maintenance_history_notes with findings and corrective actions.
Step 6 [RETURN-TO-SERVICE]: Verify repair quality through graduated load test per user_technical_manual startup and commissioning section.

ACTION PLAN TEMPLATE — RISK (Warning) STATUS:
This template applies when parameters are in the warning zone but below critical thresholds.
Required inputs: user_technical_manual, past_maintenance_history_notes.
Step 1 [MONITOR — Immediate]: Increase monitoring frequency (every 15 min readings). Set additional alarm at 80% of critical threshold.
Step 2 [REVIEW — Within 4 h]: Review past_maintenance_history_notes for parameter trends over last 30 days. Identify if condition is improving, stable, or degrading.
Step 3 [INVESTIGATE — Within 24 h]: Perform non-invasive diagnostics (vibration spectrum, fuel flow check, thermocouple verification) per user_technical_manual.
Step 4 [PLAN — Within 48 h]: Schedule planned maintenance outage if trend is degrading. Prepare materials and personnel per user_technical_manual.
Step 5 [CORRECTIVE — At planned outage]: Perform targeted inspection of suspected component. Update past_maintenance_history_notes.

=== SECTION 25: PAST MAINTENANCE HISTORY INTEGRATION ===
When reviewing past_maintenance_history_notes, check for:
  - Recent bearing replacements or adjustments (correlate with vibration changes)
  - Compressor wash history (correlate with efficiency and exhaust temperature trends)
  - Fuel nozzle replacements (correlate with combustion temperature spread)
  - Blade repairs or coatings (correlate with exhaust temperature and efficiency)
  - Seal replacements (correlate with shaft speed and efficiency)
  - Any near-miss events or previous alarms of the same parameter
  - Hours since last major overhaul vs. recommended interval

Key diagnostic questions from history:
  Q: Has this parameter been in alarm before?
  Q: Was maintenance performed in the last 7 days? (Post-maintenance adjustments may be needed)
  Q: Is the rate of change accelerating or stable?
  Q: Does the alarm correlate with an operational event (load change, trip, restart)?
"""

PAST_MAINTENANCE_HISTORY_NOTES = """
FLEET MAINTENANCE HISTORY — SUMMARY NOTES (Last 90 Days)
Generated: Auto-updated by CMMS | Use with: user_technical_manual SE-GT-MM-4200

Common recent findings across fleet:
  - 3 units: Compressor blade tip erosion found during inspections; accelerated by dusty inlet conditions.
  - 2 units: Bearing #3 oil supply restrictor partially blocked; cleared during planned maintenance.
  - 4 units: Fuel nozzle coking on units operating on natural gas with high aromatic content; nozzles cleaned.
  - 1 unit: Exhaust thermocouple #7 replaced due to calibration drift of +18°C.
  - 2 units: Inlet filter differential pressure elevated; filters replaced ahead of schedule.

Trending observations:
  - Fleet-wide exhaust temperature creeping +5°C above baseline over last 60 days; attributed to seasonal ambient temperature increase.
  - Bearing vibration on units with > 20,000 EOH showing gradual upward trend; proactive bearing inspection scheduled.

Spare parts availability:
  - Combustion liners (Type A/B): 8 sets in regional warehouse (Houston).
  - Bearing assemblies (journal type): 12 sets available.
  - Fuel nozzle assemblies: 24 sets (all models).

OEM service bulletins active:
  - SB-SGT-2024-07: Inspect transition piece cooling holes at next combustion inspection on units > 8,000 EOH.
  - SB-SGT-2025-03: Lubrication system filter bypass valve check on SGT-series with > 15,000 EOH.
"""

# Gemini REST API base URL
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"

# Keywords that indicate an alert/action-plan query requiring maintenance history context
ALERT_KEYWORDS = (
    'nok', 'risk', 'critical', 'emergency', 'alarm', 'alert', 'action plan',
    'vibration', 'temperature', 'exhaust', 'bearing', 'shutdown', 'diagnostic',
)

SYSTEM_PROMPT = (
    "You are an expert gas turbine and steam turbine maintenance engineer at Siemens Energy. "
    "You have access to the Siemens Energy maintenance manual (user_technical_manual) and "
    "recent fleet maintenance history notes (past_maintenance_history_notes), both of which "
    "are provided in the context below. "
    "When the question involves a RISK or NOK status alert, always produce a structured action plan "
    "that explicitly references both the user_technical_manual procedures and the past_maintenance_history_notes. "
    "Answer using ONLY the information in the provided context. If additional information is needed, "
    "state clearly what should be checked in the user_technical_manual or CMMS. "
    "Be concise, precise, and use engineering terminology appropriate for a field maintenance technician. "
    "Format action plans as numbered steps with estimated timeframes."
)


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
    # Detect if this is an alert/action-plan query to include maintenance history
    is_alert_query = any(kw in query.lower() for kw in ALERT_KEYWORDS)

    if is_alert_query:
        full_prompt = (
            f"[user_technical_manual]\n{MAINTENANCE_MANUAL_EXCERPT}\n\n"
            f"[past_maintenance_history_notes]\n{PAST_MAINTENANCE_HISTORY_NOTES}\n\n"
            f"QUESTION (requires action plan using both user_technical_manual and "
            f"past_maintenance_history_notes): {query}"
        )
    else:
        full_prompt = (
            f"[user_technical_manual]\n{MAINTENANCE_MANUAL_EXCERPT}\n\n"
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
    combined_context = MAINTENANCE_MANUAL_EXCERPT.strip()
    if is_alert_query:
        combined_context += "\n\n" + PAST_MAINTENANCE_HISTORY_NOTES.strip()
    payload = {
        "answer": answer,
        "context": combined_context,
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
