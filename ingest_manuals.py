"""
ingest_manuals.py — One-time RAG knowledge-base ingestion script
================================================================
Run this locally (once, or whenever the source material changes) to:
  1. Split Siemens SGT maintenance manual excerpts into focused text chunks.
  2. Embed each chunk with Google text-embedding-004 (768-dim vectors).
  3. Upload the full manifest as a single JSON file to S3.

Usage
-----
  pip install boto3
  export GEMINI_API_KEY="AIza..."
  python ingest_manuals.py --bucket siemens-rag-knowledge-base [--profile my-aws-profile]

No additional pip installs needed — Gemini REST calls use stdlib urllib.

The Lambda function (ask_assistant/app.py) then downloads this one file at
query time and performs cosine similarity in pure Python — zero additional
infrastructure required.

NOTE: This script uses Google text-embedding-004 (768-dim vectors). If upgrading from
a previous embedding model with different dimensions, you must re-run this script;
old manifests with incompatible vector dimensions will cause retrieval errors.

Output
------
  s3://<bucket>/chunks/embeddings.json
    [
      {
        "id": "chunk_001",
        "text": "...",
        "embedding": [0.023, -0.041, ...],   # 768-dim float list
        "metadata": {
          "source": "SE-GT-MM-4200",
          "section": "Section 4: Inspection Intervals",
          "revision": "7"
        }
      },
      ...
    ]
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error

import boto3

# Embedding config
EMBEDDING_MODEL = "text-embedding-004"   # Google 768-dim embedding model
GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
S3_KEY = "chunks/embeddings.json"

# ── Source material: 3 focused Siemens SGT maintenance manual excerpts ────────
# In production, replace/extend with chunks parsed from actual PDF manuals.
# Each chunk should be a single cohesive topic (300–600 tokens) for best retrieval.

CHUNKS = [
    {
        "id": "chunk_001",
        "text": (
            "SIEMENS SGT-SERIES — SECTION 4: INSPECTION INTERVALS\n"
            "Document Ref: SE-GT-MM-4200 | Rev 7\n\n"
            "Combustion Inspection: Every 4,000 Equivalent Operating Hours (EOH) or 450 starts, "
            "whichever comes first. Scope: fuel nozzle cleaning, cross-fire tube inspection, "
            "liner replacement if wear exceeds 20% of nominal thickness.\n\n"
            "Hot Gas Path (HGP) Inspection: Every 8,000 EOH or 900 starts. Components inspected: "
            "combustion liners, transition pieces, first-stage nozzles and blades, turbine shrouds. "
            "Dimensional checks and coating assessments are mandatory at HGP intervals.\n\n"
            "Major Overhaul: Every 24,000 EOH or 2,400 starts. Full disassembly, dimensional "
            "inspection, and replacement of life-limited parts per OEM life-analysis data.\n\n"
            "OEM Service Bulletins in effect:\n"
            "  SB-SGT-2024-07: Inspect transition piece cooling holes at next combustion "
            "inspection on units exceeding 8,000 EOH.\n"
            "  SB-SGT-2025-03: Lubrication system filter bypass valve check on SGT-series "
            "units with more than 15,000 EOH."
        ),
        "metadata": {
            "source": "SE-GT-MM-4200",
            "section": "Section 4: Inspection Intervals",
            "revision": "7",
        },
    },
    {
        "id": "chunk_002",
        "text": (
            "SIEMENS SGT-SERIES — SECTIONS 7 & 18: VIBRATION THRESHOLDS AND FAULT REMEDIATION\n"
            "Document Ref: SE-GT-MM-4200 | Rev 7\n\n"
            "Bearing Vibration Alert Levels (peak-to-peak, mm/s RMS):\n"
            "  Normal operation: < 2.5 mm/s\n"
            "  Warning — reduce load: 2.5 – 5.0 mm/s\n"
            "  Trip / Emergency shutdown: > 5.0 mm/s\n\n"
            "Common causes of high vibration: rotor imbalance (typically after blade replacement), "
            "bearing wear or lubrication failure, thermal bow at startup (transient — resolves "
            "within 10 minutes under normal conditions), foreign object ingestion (FOD), "
            "seal rub from differential thermal expansion, coupling misalignment.\n\n"
            "Corrective actions for vibration alarm:\n"
            "  1. Reduce load to < 70% rated capacity immediately.\n"
            "  2. Monitor trend for 15 minutes; if declining, continue at reduced load.\n"
            "  3. If stable or rising above 4.0 mm/s, initiate planned shutdown.\n"
            "  4. Inspect bearings 1–4 and perform rotor dynamic balancing.\n"
            "  5. Verify lube oil supply pressure and temperature at each bearing.\n"
            "  6. Perform vibration spectrum analysis (imbalance vs. misalignment signature).\n\n"
            "FAULT — Sudden vibration spike (> 2 mm/s increase within 30 minutes):\n"
            "  Likely cause: FOD, blade liberation, or bearing failure.\n"
            "  Immediate: Reduce load to 50%, notify shift supervisor. If > 6 mm/s, "
            "  trip immediately.\n"
            "  Follow-up: Borescope inspection of compressor and turbine stages within 24 hours.\n\n"
            "FAULT — Gradual vibration increase (< 0.5 mm/s per day):\n"
            "  Likely cause: Progressive bearing wear, rotor deposit build-up, coupling degradation.\n"
            "  Action: Schedule vibration analysis. Increase monitoring to hourly readings.\n"
            "  Corrective: Bearing inspection and rotor balancing at next planned outage."
        ),
        "metadata": {
            "source": "SE-GT-MM-4200",
            "section": "Section 7 & 18: Vibration Thresholds and Fault Remediation",
            "revision": "7",
        },
    },
    {
        "id": "chunk_003",
        "text": (
            "SIEMENS SGT-SERIES — SECTIONS 9, 12 & 15: EXHAUST TEMPERATURE, COMPRESSOR AND LUBE SYSTEM\n"
            "Document Ref: SE-GT-MM-4200 | Rev 7\n\n"
            "EXHAUST TEMPERATURE LIMITS:\n"
            "  Rated range: 520°C – 580°C (model-dependent).\n"
            "  Warning threshold: > 600°C sustained for more than 5 minutes.\n"
            "  Emergency shutdown threshold: > 650°C.\n"
            "  Common causes: fuel system malfunction (excessive fuel flow), turbine blade "
            "  oxidation or thermal barrier coating degradation, compressor fouling (reduces "
            "  airflow, raises flame temperature), thermocouple calibration drift, combustion "
            "  liner damage allowing hot gas bypass, inlet guide vane position error.\n"
            "  Corrective actions:\n"
            "    1. Verify thermocouple reading against adjacent redundant sensors.\n"
            "    2. Check fuel control valve position and fuel flow meter accuracy.\n"
            "    3. Schedule compressor offline water wash if fouling index > 0.95.\n"
            "    4. Reduce load 10–15% and monitor temperature trend for 20 minutes.\n"
            "    5. If temperature does not decrease, initiate controlled shutdown.\n\n"
            "COMPRESSOR MAINTENANCE:\n"
            "  Online water wash: every 500 EOH or when compressor isentropic efficiency "
            "  drops > 1.5%. Offline wash (higher effectiveness): every 2,000 EOH.\n"
            "  Blade inspection for erosion/corrosion: at every combustion inspection.\n"
            "  Inlet filter replacement: per OEM schedule or when ΔP > 25 mbar across filter bank.\n"
            "  Fleet findings (last 90 days): 3 units showed compressor blade tip erosion "
            "  accelerated by dusty inlet conditions; 2 units had inlet filter ΔP elevated.\n\n"
            "LUBRICATION SYSTEM:\n"
            "  Lube oil spec: ISO VG 32 turbine oil, ash-free, anti-oxidant additive.\n"
            "  Oil change interval: 4,000 EOH or annually (whichever comes first).\n"
            "  Oil temperature limits: 45°C minimum at bearing inlet; 90°C maximum at bearing outlet.\n"
            "  Low oil pressure trip: < 1.2 bar (abs) at main header.\n"
            "  Fleet finding: 2 units had bearing #3 oil supply restrictor partially blocked; "
            "  cleared during planned maintenance.\n\n"
            "CRITICAL DUAL-EXCEEDANCE FAULT (high vibration AND high exhaust temperature):\n"
            "  Likely cause: hot-section distress, advanced blade damage, or rotor thermal distortion.\n"
            "  CRITICAL ACTION: Initiate controlled shutdown immediately.\n"
            "  Do NOT trip; execute controlled coast-down to protect bearings.\n"
            "  Post-shutdown: full borescope inspection + NDT of all hot-section components."
        ),
        "metadata": {
            "source": "SE-GT-MM-4200",
            "section": "Section 9 & 12 & 15: Exhaust Temperature, Compressor, Lube System",
            "revision": "7",
        },
    },
]



# Embedding helpers


def _embed_text(api_key: str, text: str) -> list:
    """
    Embed a single text string using Google text-embedding-004 via REST.
    Returns a 768-dimensional float vector. Uses stdlib urllib -- no SDK needed.
    """
    url = f"{GEMINI_API_BASE}/{EMBEDDING_MODEL}:embedContent?key={api_key}"
    payload = json.dumps({
        "model": f"models/{EMBEDDING_MODEL}",
        "content": {"parts": [{"text": text}]},
    }).encode("utf-8")
    req = urllib.request.Request(
        url, data=payload,
        headers={"Content-Type": "application/json"}, method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    return body["embedding"]["values"]   # list[float], length 768


def embed_chunks(api_key: str, chunks: list[dict]) -> list[dict]:
    """
    Embed each chunk's 'text' field using text-embedding-004.
    Sends one request per chunk to keep the rate-limit footprint minimal.
    Returns the same list with an 'embedding' key added to each item.
    """
    enriched = []
    for i, chunk in enumerate(chunks, start=1):
        print(f"[{i}/{len(chunks)}] Embedding chunk '{chunk[chr(39)+chr(105)+chr(100)+chr(39)}' ...")
        embedding = _embed_text(api_key, chunk["text"])
        enriched.append({
            "id": chunk["id"],
            "text": chunk["text"],
            "embedding": embedding,   # list[float], length 768
            "metadata": chunk["metadata"],
        })
        # Polite pause to avoid hitting quota limits
        time.sleep(0.3)

    return enriched

# S3 upload

def upload_to_s3(enriched_chunks: list[dict], bucket: str, profile: str | None) -> None:
    """
    Serialise enriched chunks to JSON and upload to s3://<bucket>/chunks/embeddings.json.
    Uses the given AWS named profile (or the default credential chain if None).
    """
    session = boto3.Session(profile_name=profile) if profile else boto3.Session()
    s3 = session.client("s3")

    payload = json.dumps(enriched_chunks, ensure_ascii=False, separators=(",", ":"))
    size_kb = len(payload.encode("utf-8")) / 1024

    print(f"\nUploading {len(enriched_chunks)} chunks ({size_kb:.1f} KB) → s3://{bucket}/{S3_KEY}")
    s3.put_object(
        Bucket=bucket,
        Key=S3_KEY,
        Body=payload.encode("utf-8"),
        ContentType="application/json",
    )
    print("Upload complete.")
    print(f"\nKnowledge base ready: s3://{bucket}/{S3_KEY}")
    print("You can now deploy and query the Lambda endpoint.")


# Entry point

def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest Siemens maintenance manual chunks into S3 RAG store.")
    parser.add_argument("--bucket", default="siemens-rag-knowledge-base",
                        help="Target S3 bucket name (must already exist or be created by SAM deploy).")
    parser.add_argument("--profile", default=None,
                        help="AWS named profile to use (optional; defaults to environment credentials).")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY", "")
    if not api_key:
        print("ERROR: Set the GEMINI_API_KEY environment variable before running.", file=sys.stderr)
        sys.exit(1)

    print(f"=== Siemens RAG Ingestion Pipeline ===")
    print(f"Embedding model : {EMBEDDING_MODEL} (768-dim, Google)")
    print(f"S3 bucket       : {args.bucket}")
    print(f"Chunks to ingest: {len(CHUNKS)}
")

    enriched = embed_chunks(api_key, CHUNKS)
    upload_to_s3(enriched, bucket=args.bucket, profile=args.profile)
    enriched = embed_chunks(client, CHUNKS)
    upload_to_s3(enriched, bucket=args.bucket, profile=args.profile)


if __name__ == "__main__":
    main()
