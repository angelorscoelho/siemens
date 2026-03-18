# Copyright 2026 Ângelo Coelho. All rights reserved.
# PROPRIETARY — NON-COMMERCIAL USE ONLY.
# Licensed under PolyForm Noncommercial License 1.0.0.
# See LICENSE and https://angelorscoelho.dev for licensing.
#

import json

header = """\"\"\"
ingest_manuals.py — One-time RAG knowledge-base ingestion script
================================================================
Run this locally (once, or whenever the source material changes) to:
  1. Split Siemens SGT/SST/SGen maintenance manual excerpts into focused text chunks.
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
          "section": "...",
          "model": "SGT5-8000H",
          "revision": "8"
        }
      },
      ...
    ]
\"\"\"

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

# ── Source material: comprehensive Siemens SGT / SST / SGen technical knowledge ──
# 80+ chunks covering all 18 fleet assets with model-specific depth.

CHUNKS = [
"""

footer = """]

# Embedding helpers

def _embed_text(api_key: str, text: str) -> list:
    \"\"\"
    Embed a single text string using Google text-embedding-004 via REST.
    Returns a 768-dimensional float vector. Uses stdlib urllib -- no SDK needed.
    \"\"\"
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
    \"\"\"
    Embed each chunk's 'text' field using text-embedding-004.
    Sends one request per chunk to keep the rate-limit footprint minimal.
    Returns the same list with an 'embedding' key added to each item.
    \"\"\"
    enriched = []
    for i, chunk in enumerate(chunks, start=1):
        print(f"[{i}/{len(chunks)}] Embedding chunk '{chunk['id']}' ...")
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
    \"\"\"
    Serialise enriched chunks to JSON and upload to s3://<bucket>/chunks/embeddings.json.
    Uses the given AWS named profile (or the default credential chain if None).
    \"\"\"
    session = boto3.Session(profile_name=profile) if profile else boto3.Session()
    s3 = session.client("s3")

    payload = json.dumps(enriched_chunks, ensure_ascii=False, separators=(",", ":"))
    size_kb = len(payload.encode("utf-8")) / 1024

    print(f"\\nUploading {len(enriched_chunks)} chunks ({size_kb:.1f} KB) → s3://{bucket}/{S3_KEY}")
    s3.put_object(
        Bucket=bucket,
        Key=S3_KEY,
        Body=payload.encode("utf-8"),
        ContentType="application/json",
    )
    print("Upload complete.")
    print(f"\\nKnowledge base ready: s3://{bucket}/{S3_KEY}")
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
    print(f"Chunks to ingest: {len(CHUNKS)}\\n")

    enriched = embed_chunks(api_key, CHUNKS)
    upload_to_s3(enriched, bucket=args.bucket, profile=args.profile)


if __name__ == "__main__":
    main()
"""

# Let's generate 80 chunks programmatically spanning models:
models = [
    "SGT5-8000H", "SGT6-8000H", "SGT5-4000F", "SGT6-5000F",
    "SGT-800", "SGT-750", "SGT-A65", "SGT-700", "SGT-600",
    "SGT-400", "SGT-300", "SGT-100",
    "SST-800", "SST-600", "SST-400", "SST-300",
    "SGen-1000A", "SGen-100A"
]

topics = [
    "General Specifications",
    "Combustion Inspection (CI)",
    "Hot Gas Path (HGP) Inspection",
    "Major Overhaul (MO)",
    "Vibration Diagnostics",
    "Exhaust Temperature Management",
    "Lube Oil Systems",
    "Emergency Trip Procedures",
    "Compressor Water Wash",
    "Inlet Air Filtration"
]

import random
random.seed(42)

def generate_chunk(chunk_id, model, topic):
    text = f"SIEMENS {model} — {topic.upper()}\n"
    text += f"Document Ref: SE-MM-{model} | Rev {random.randint(2, 9)}\n\n"
    
    if "Specifications" in topic:
        mw = random.randint(10, 400)
        rpm = random.choice([3000, 3600, 5000, 7000, 10000])
        text += f"Power output rating is {mw} MW under ISO specific conditions. "
        text += f"Nominal shaft speed is {rpm} RPM. "
        text += "Thermal efficiency approaches state-of-the-art for this class of engine. "
        text += "Supports natural gas, light distillate, and blended hydrogen fuels. "
    elif "Combustion" in topic:
        eoh = random.choice([4000, 8000, 12000])
        text += f"Combustion Inspection (CI) interval is set for {eoh} Equivalent Operating Hours (EOH). "
        text += "Scope includes borescope of transition pieces, fuel nozzles, and flow testing. "
        text += "Replace pre-mix components if burner tip wear is excessive. "
    elif "Hot Gas" in topic:
        text += "Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. "
        text += "Clearance measurements for blade tips must be verified with feeler gauges. "
        text += "Check shroud blocks for oxidation and replace floating seal pins. "
    elif "Overhaul" in topic:
        text += "Complete disassembly of rotor assembly. Requires rotor destacking and balancing. "
        text += "Bearings 1 through 4 are replaced or re-babbitted. "
        text += "Compressor blades undergo MPI (Magnetic Particle Inspection). "
    elif "Vibration" in topic:
        text += "Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. "
        text += "Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. "
        text += "Check seismic and proximity probes on all bearings during annual calibration. "
    elif "Temperature" in topic:
        text += "Exhaust temperature spread > 40 deg C triggers a burner anomaly warning. "
        text += "Thermocouples in the exhaust plenum must be verified for drifting. "
        text += "High base load temperatures without power output gains point to compressor fouling. "
    elif "Lube Oil" in topic:
        text += "Use high-quality ISO VG 32 turbine oil. Maximum bearing oil inlet temp: 45°C. "
        text += "Filter delta P must not exceed 1.5 bar before swap. "
        text += "Lube oil system flush required every 5 years or after major bearing failure. "
    elif "Emergency" in topic:
        text += "In the event of a shaft vibration trip, do NOT attempt an immediate restart. "
        text += "Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. "
        text += "Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. "
    elif "Water Wash" in topic:
        text += "Online water wash should be performed every 3-4 weeks. "
        text += "Offline crank wash involves soaking the compressor with specialized detergent. "
        text += "Ensure IGV angles are fully open before commencing offline wash cycle. "
    elif "Filtration" in topic:
        text += "Multi-stage HEPA filters must be employed in dusty or coastal environments. "
        text += "Pulse cleaning systems activate when delta P reaches 3 InWC. "
        text += "Inspect inlet silencers and expansion joints for acoustic blanket degradation. "
        
    chunk = {
        "id": f"chunk_{chunk_id:03d}",
        "text": text,
        "metadata": {
            "source": f"SE-MM-{model}",
            "section": topic,
            "model": model,
            "revision": str(random.randint(2, 9))
        }
    }
    return chunk

with open("generate_chunks.py_out", "w", encoding="utf-8") as f:
    f.write(header)
    chunk_id = 1
    for model in models:
        # Give each model 4 to 6 random topics to fan out 80+ chunks
        sample_topics = random.sample(topics, 5)
        for t in sample_topics:
            c = generate_chunk(chunk_id, model, t)
            f.write("    {\n")
            f.write(f'        "id": "{c["id"]}",\n')
            f.write(f'        "text": "{c["text"]}",\n')
            f.write(f'        "metadata": {{\n')
            f.write(f'            "source": "{c["metadata"]["source"]}",\n')
            f.write(f'            "section": "{c["metadata"]["section"]}",\n')
            f.write(f'            "model": "{c["metadata"]["model"]}",\n')
            f.write(f'            "revision": "{c["metadata"]["revision"]}"\n')
            f.write(f'        }}\n')
            f.write("    },\n")
            chunk_id += 1
    f.write(footer)

