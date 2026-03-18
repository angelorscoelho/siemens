# Copyright 2026 Ângelo Coelho. All rights reserved.
# PROPRIETARY — NON-COMMERCIAL USE ONLY.
# Licensed under PolyForm Noncommercial License 1.0.0.
# See LICENSE and https://angelorscoelho.dev for licensing.
#

"""
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

# ── Source material: comprehensive Siemens SGT / SST / SGen technical knowledge ──
# 80+ chunks covering all 18 fleet assets with model-specific depth.

CHUNKS = [
    {
        "id": "chunk_001",
        "text": "SIEMENS SGT5-8000H — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SGT5-8000H | Rev 4

Combustion Inspection (CI) interval is set for 12000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SGT5-8000H",
            "section": "Combustion Inspection (CI)",
            "model": "SGT5-8000H",
            "revision": "3"
        }
    },
    {
        "id": "chunk_002",
        "text": "SIEMENS SGT5-8000H — GENERAL SPECIFICATIONS
Document Ref: SE-MM-SGT5-8000H | Rev 3

Power output rating is 312 MW under ISO specific conditions. Nominal shaft speed is 7000 RPM. Thermal efficiency approaches state-of-the-art for this class of engine. Supports natural gas, light distillate, and blended hydrogen fuels. ",
        "metadata": {
            "source": "SE-MM-SGT5-8000H",
            "section": "General Specifications",
            "model": "SGT5-8000H",
            "revision": "2"
        }
    },
    {
        "id": "chunk_003",
        "text": "SIEMENS SGT5-8000H — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SGT5-8000H | Rev 2

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SGT5-8000H",
            "section": "Vibration Diagnostics",
            "model": "SGT5-8000H",
            "revision": "3"
        }
    },
    {
        "id": "chunk_004",
        "text": "SIEMENS SGT5-8000H — INLET AIR FILTRATION
Document Ref: SE-MM-SGT5-8000H | Rev 5

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGT5-8000H",
            "section": "Inlet Air Filtration",
            "model": "SGT5-8000H",
            "revision": "5"
        }
    },
    {
        "id": "chunk_005",
        "text": "SIEMENS SGT5-8000H — LUBE OIL SYSTEMS
Document Ref: SE-MM-SGT5-8000H | Rev 2

Use high-quality ISO VG 32 turbine oil. Maximum bearing oil inlet temp: 45°C. Filter delta P must not exceed 1.5 bar before swap. Lube oil system flush required every 5 years or after major bearing failure. ",
        "metadata": {
            "source": "SE-MM-SGT5-8000H",
            "section": "Lube Oil Systems",
            "model": "SGT5-8000H",
            "revision": "5"
        }
    },
    {
        "id": "chunk_006",
        "text": "SIEMENS SGT6-8000H — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGT6-8000H | Rev 6

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGT6-8000H",
            "section": "Compressor Water Wash",
            "model": "SGT6-8000H",
            "revision": "2"
        }
    },
    {
        "id": "chunk_007",
        "text": "SIEMENS SGT6-8000H — LUBE OIL SYSTEMS
Document Ref: SE-MM-SGT6-8000H | Rev 4

Use high-quality ISO VG 32 turbine oil. Maximum bearing oil inlet temp: 45°C. Filter delta P must not exceed 1.5 bar before swap. Lube oil system flush required every 5 years or after major bearing failure. ",
        "metadata": {
            "source": "SE-MM-SGT6-8000H",
            "section": "Lube Oil Systems",
            "model": "SGT6-8000H",
            "revision": "8"
        }
    },
    {
        "id": "chunk_008",
        "text": "SIEMENS SGT6-8000H — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SGT6-8000H | Rev 7

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SGT6-8000H",
            "section": "Major Overhaul (MO)",
            "model": "SGT6-8000H",
            "revision": "6"
        }
    },
    {
        "id": "chunk_009",
        "text": "SIEMENS SGT6-8000H — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SGT6-8000H | Rev 4

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SGT6-8000H",
            "section": "Emergency Trip Procedures",
            "model": "SGT6-8000H",
            "revision": "5"
        }
    },
    {
        "id": "chunk_010",
        "text": "SIEMENS SGT6-8000H — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SGT6-8000H | Rev 7

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SGT6-8000H",
            "section": "Vibration Diagnostics",
            "model": "SGT6-8000H",
            "revision": "3"
        }
    },
    {
        "id": "chunk_011",
        "text": "SIEMENS SGT5-4000F — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SGT5-4000F | Rev 6

Combustion Inspection (CI) interval is set for 4000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SGT5-4000F",
            "section": "Combustion Inspection (CI)",
            "model": "SGT5-4000F",
            "revision": "9"
        }
    },
    {
        "id": "chunk_012",
        "text": "SIEMENS SGT5-4000F — LUBE OIL SYSTEMS
Document Ref: SE-MM-SGT5-4000F | Rev 3

Use high-quality ISO VG 32 turbine oil. Maximum bearing oil inlet temp: 45°C. Filter delta P must not exceed 1.5 bar before swap. Lube oil system flush required every 5 years or after major bearing failure. ",
        "metadata": {
            "source": "SE-MM-SGT5-4000F",
            "section": "Lube Oil Systems",
            "model": "SGT5-4000F",
            "revision": "8"
        }
    },
    {
        "id": "chunk_013",
        "text": "SIEMENS SGT5-4000F — INLET AIR FILTRATION
Document Ref: SE-MM-SGT5-4000F | Rev 3

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGT5-4000F",
            "section": "Inlet Air Filtration",
            "model": "SGT5-4000F",
            "revision": "6"
        }
    },
    {
        "id": "chunk_014",
        "text": "SIEMENS SGT5-4000F — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SGT5-4000F | Rev 7

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SGT5-4000F",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SGT5-4000F",
            "revision": "5"
        }
    },
    {
        "id": "chunk_015",
        "text": "SIEMENS SGT5-4000F — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGT5-4000F | Rev 3

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGT5-4000F",
            "section": "Compressor Water Wash",
            "model": "SGT5-4000F",
            "revision": "2"
        }
    },
    {
        "id": "chunk_016",
        "text": "SIEMENS SGT6-5000F — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SGT6-5000F | Rev 3

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SGT6-5000F",
            "section": "Major Overhaul (MO)",
            "model": "SGT6-5000F",
            "revision": "8"
        }
    },
    {
        "id": "chunk_017",
        "text": "SIEMENS SGT6-5000F — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SGT6-5000F | Rev 6

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SGT6-5000F",
            "section": "Vibration Diagnostics",
            "model": "SGT6-5000F",
            "revision": "9"
        }
    },
    {
        "id": "chunk_018",
        "text": "SIEMENS SGT6-5000F — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SGT6-5000F | Rev 7

Combustion Inspection (CI) interval is set for 4000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SGT6-5000F",
            "section": "Combustion Inspection (CI)",
            "model": "SGT6-5000F",
            "revision": "7"
        }
    },
    {
        "id": "chunk_019",
        "text": "SIEMENS SGT6-5000F — LUBE OIL SYSTEMS
Document Ref: SE-MM-SGT6-5000F | Rev 7

Use high-quality ISO VG 32 turbine oil. Maximum bearing oil inlet temp: 45°C. Filter delta P must not exceed 1.5 bar before swap. Lube oil system flush required every 5 years or after major bearing failure. ",
        "metadata": {
            "source": "SE-MM-SGT6-5000F",
            "section": "Lube Oil Systems",
            "model": "SGT6-5000F",
            "revision": "5"
        }
    },
    {
        "id": "chunk_020",
        "text": "SIEMENS SGT6-5000F — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SGT6-5000F | Rev 6

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SGT6-5000F",
            "section": "Emergency Trip Procedures",
            "model": "SGT6-5000F",
            "revision": "3"
        }
    },
    {
        "id": "chunk_021",
        "text": "SIEMENS SGT-800 — INLET AIR FILTRATION
Document Ref: SE-MM-SGT-800 | Rev 8

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGT-800",
            "section": "Inlet Air Filtration",
            "model": "SGT-800",
            "revision": "6"
        }
    },
    {
        "id": "chunk_022",
        "text": "SIEMENS SGT-800 — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SGT-800 | Rev 5

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SGT-800",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SGT-800",
            "revision": "7"
        }
    },
    {
        "id": "chunk_023",
        "text": "SIEMENS SGT-800 — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SGT-800 | Rev 2

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SGT-800",
            "section": "Major Overhaul (MO)",
            "model": "SGT-800",
            "revision": "5"
        }
    },
    {
        "id": "chunk_024",
        "text": "SIEMENS SGT-800 — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SGT-800 | Rev 2

Combustion Inspection (CI) interval is set for 8000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SGT-800",
            "section": "Combustion Inspection (CI)",
            "model": "SGT-800",
            "revision": "8"
        }
    },
    {
        "id": "chunk_025",
        "text": "SIEMENS SGT-800 — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SGT-800 | Rev 6

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SGT-800",
            "section": "Emergency Trip Procedures",
            "model": "SGT-800",
            "revision": "3"
        }
    },
    {
        "id": "chunk_026",
        "text": "SIEMENS SGT-750 — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SGT-750 | Rev 8

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SGT-750",
            "section": "Major Overhaul (MO)",
            "model": "SGT-750",
            "revision": "9"
        }
    },
    {
        "id": "chunk_027",
        "text": "SIEMENS SGT-750 — EXHAUST TEMPERATURE MANAGEMENT
Document Ref: SE-MM-SGT-750 | Rev 4

Exhaust temperature spread > 40 deg C triggers a burner anomaly warning. Thermocouples in the exhaust plenum must be verified for drifting. High base load temperatures without power output gains point to compressor fouling. ",
        "metadata": {
            "source": "SE-MM-SGT-750",
            "section": "Exhaust Temperature Management",
            "model": "SGT-750",
            "revision": "6"
        }
    },
    {
        "id": "chunk_028",
        "text": "SIEMENS SGT-750 — INLET AIR FILTRATION
Document Ref: SE-MM-SGT-750 | Rev 4

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGT-750",
            "section": "Inlet Air Filtration",
            "model": "SGT-750",
            "revision": "5"
        }
    },
    {
        "id": "chunk_029",
        "text": "SIEMENS SGT-750 — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGT-750 | Rev 6

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGT-750",
            "section": "Compressor Water Wash",
            "model": "SGT-750",
            "revision": "8"
        }
    },
    {
        "id": "chunk_030",
        "text": "SIEMENS SGT-750 — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SGT-750 | Rev 8

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SGT-750",
            "section": "Emergency Trip Procedures",
            "model": "SGT-750",
            "revision": "7"
        }
    },
    {
        "id": "chunk_031",
        "text": "SIEMENS SGT-A65 — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SGT-A65 | Rev 3

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SGT-A65",
            "section": "Major Overhaul (MO)",
            "model": "SGT-A65",
            "revision": "4"
        }
    },
    {
        "id": "chunk_032",
        "text": "SIEMENS SGT-A65 — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SGT-A65 | Rev 4

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SGT-A65",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SGT-A65",
            "revision": "8"
        }
    },
    {
        "id": "chunk_033",
        "text": "SIEMENS SGT-A65 — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SGT-A65 | Rev 3

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SGT-A65",
            "section": "Emergency Trip Procedures",
            "model": "SGT-A65",
            "revision": "8"
        }
    },
    {
        "id": "chunk_034",
        "text": "SIEMENS SGT-A65 — GENERAL SPECIFICATIONS
Document Ref: SE-MM-SGT-A65 | Rev 8

Power output rating is 315 MW under ISO specific conditions. Nominal shaft speed is 7000 RPM. Thermal efficiency approaches state-of-the-art for this class of engine. Supports natural gas, light distillate, and blended hydrogen fuels. ",
        "metadata": {
            "source": "SE-MM-SGT-A65",
            "section": "General Specifications",
            "model": "SGT-A65",
            "revision": "6"
        }
    },
    {
        "id": "chunk_035",
        "text": "SIEMENS SGT-A65 — LUBE OIL SYSTEMS
Document Ref: SE-MM-SGT-A65 | Rev 2

Use high-quality ISO VG 32 turbine oil. Maximum bearing oil inlet temp: 45°C. Filter delta P must not exceed 1.5 bar before swap. Lube oil system flush required every 5 years or after major bearing failure. ",
        "metadata": {
            "source": "SE-MM-SGT-A65",
            "section": "Lube Oil Systems",
            "model": "SGT-A65",
            "revision": "3"
        }
    },
    {
        "id": "chunk_036",
        "text": "SIEMENS SGT-700 — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGT-700 | Rev 8

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGT-700",
            "section": "Compressor Water Wash",
            "model": "SGT-700",
            "revision": "4"
        }
    },
    {
        "id": "chunk_037",
        "text": "SIEMENS SGT-700 — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SGT-700 | Rev 9

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SGT-700",
            "section": "Vibration Diagnostics",
            "model": "SGT-700",
            "revision": "2"
        }
    },
    {
        "id": "chunk_038",
        "text": "SIEMENS SGT-700 — EXHAUST TEMPERATURE MANAGEMENT
Document Ref: SE-MM-SGT-700 | Rev 6

Exhaust temperature spread > 40 deg C triggers a burner anomaly warning. Thermocouples in the exhaust plenum must be verified for drifting. High base load temperatures without power output gains point to compressor fouling. ",
        "metadata": {
            "source": "SE-MM-SGT-700",
            "section": "Exhaust Temperature Management",
            "model": "SGT-700",
            "revision": "4"
        }
    },
    {
        "id": "chunk_039",
        "text": "SIEMENS SGT-700 — GENERAL SPECIFICATIONS
Document Ref: SE-MM-SGT-700 | Rev 3

Power output rating is 330 MW under ISO specific conditions. Nominal shaft speed is 5000 RPM. Thermal efficiency approaches state-of-the-art for this class of engine. Supports natural gas, light distillate, and blended hydrogen fuels. ",
        "metadata": {
            "source": "SE-MM-SGT-700",
            "section": "General Specifications",
            "model": "SGT-700",
            "revision": "5"
        }
    },
    {
        "id": "chunk_040",
        "text": "SIEMENS SGT-700 — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SGT-700 | Rev 4

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SGT-700",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SGT-700",
            "revision": "7"
        }
    },
    {
        "id": "chunk_041",
        "text": "SIEMENS SGT-600 — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SGT-600 | Rev 9

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SGT-600",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SGT-600",
            "revision": "2"
        }
    },
    {
        "id": "chunk_042",
        "text": "SIEMENS SGT-600 — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGT-600 | Rev 3

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGT-600",
            "section": "Compressor Water Wash",
            "model": "SGT-600",
            "revision": "7"
        }
    },
    {
        "id": "chunk_043",
        "text": "SIEMENS SGT-600 — GENERAL SPECIFICATIONS
Document Ref: SE-MM-SGT-600 | Rev 6

Power output rating is 132 MW under ISO specific conditions. Nominal shaft speed is 3000 RPM. Thermal efficiency approaches state-of-the-art for this class of engine. Supports natural gas, light distillate, and blended hydrogen fuels. ",
        "metadata": {
            "source": "SE-MM-SGT-600",
            "section": "General Specifications",
            "model": "SGT-600",
            "revision": "5"
        }
    },
    {
        "id": "chunk_044",
        "text": "SIEMENS SGT-600 — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SGT-600 | Rev 3

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SGT-600",
            "section": "Vibration Diagnostics",
            "model": "SGT-600",
            "revision": "3"
        }
    },
    {
        "id": "chunk_045",
        "text": "SIEMENS SGT-600 — INLET AIR FILTRATION
Document Ref: SE-MM-SGT-600 | Rev 9

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGT-600",
            "section": "Inlet Air Filtration",
            "model": "SGT-600",
            "revision": "3"
        }
    },
    {
        "id": "chunk_046",
        "text": "SIEMENS SGT-400 — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGT-400 | Rev 4

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGT-400",
            "section": "Compressor Water Wash",
            "model": "SGT-400",
            "revision": "6"
        }
    },
    {
        "id": "chunk_047",
        "text": "SIEMENS SGT-400 — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SGT-400 | Rev 8

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SGT-400",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SGT-400",
            "revision": "5"
        }
    },
    {
        "id": "chunk_048",
        "text": "SIEMENS SGT-400 — INLET AIR FILTRATION
Document Ref: SE-MM-SGT-400 | Rev 5

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGT-400",
            "section": "Inlet Air Filtration",
            "model": "SGT-400",
            "revision": "6"
        }
    },
    {
        "id": "chunk_049",
        "text": "SIEMENS SGT-400 — EXHAUST TEMPERATURE MANAGEMENT
Document Ref: SE-MM-SGT-400 | Rev 8

Exhaust temperature spread > 40 deg C triggers a burner anomaly warning. Thermocouples in the exhaust plenum must be verified for drifting. High base load temperatures without power output gains point to compressor fouling. ",
        "metadata": {
            "source": "SE-MM-SGT-400",
            "section": "Exhaust Temperature Management",
            "model": "SGT-400",
            "revision": "7"
        }
    },
    {
        "id": "chunk_050",
        "text": "SIEMENS SGT-400 — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SGT-400 | Rev 9

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SGT-400",
            "section": "Major Overhaul (MO)",
            "model": "SGT-400",
            "revision": "9"
        }
    },
    {
        "id": "chunk_051",
        "text": "SIEMENS SGT-300 — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SGT-300 | Rev 2

Combustion Inspection (CI) interval is set for 12000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SGT-300",
            "section": "Combustion Inspection (CI)",
            "model": "SGT-300",
            "revision": "5"
        }
    },
    {
        "id": "chunk_052",
        "text": "SIEMENS SGT-300 — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SGT-300 | Rev 5

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SGT-300",
            "section": "Major Overhaul (MO)",
            "model": "SGT-300",
            "revision": "2"
        }
    },
    {
        "id": "chunk_053",
        "text": "SIEMENS SGT-300 — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGT-300 | Rev 3

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGT-300",
            "section": "Compressor Water Wash",
            "model": "SGT-300",
            "revision": "2"
        }
    },
    {
        "id": "chunk_054",
        "text": "SIEMENS SGT-300 — GENERAL SPECIFICATIONS
Document Ref: SE-MM-SGT-300 | Rev 5

Power output rating is 44 MW under ISO specific conditions. Nominal shaft speed is 3000 RPM. Thermal efficiency approaches state-of-the-art for this class of engine. Supports natural gas, light distillate, and blended hydrogen fuels. ",
        "metadata": {
            "source": "SE-MM-SGT-300",
            "section": "General Specifications",
            "model": "SGT-300",
            "revision": "7"
        }
    },
    {
        "id": "chunk_055",
        "text": "SIEMENS SGT-300 — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SGT-300 | Rev 3

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SGT-300",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SGT-300",
            "revision": "5"
        }
    },
    {
        "id": "chunk_056",
        "text": "SIEMENS SGT-100 — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SGT-100 | Rev 9

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SGT-100",
            "section": "Vibration Diagnostics",
            "model": "SGT-100",
            "revision": "5"
        }
    },
    {
        "id": "chunk_057",
        "text": "SIEMENS SGT-100 — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SGT-100 | Rev 9

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SGT-100",
            "section": "Emergency Trip Procedures",
            "model": "SGT-100",
            "revision": "8"
        }
    },
    {
        "id": "chunk_058",
        "text": "SIEMENS SGT-100 — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SGT-100 | Rev 5

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SGT-100",
            "section": "Major Overhaul (MO)",
            "model": "SGT-100",
            "revision": "3"
        }
    },
    {
        "id": "chunk_059",
        "text": "SIEMENS SGT-100 — INLET AIR FILTRATION
Document Ref: SE-MM-SGT-100 | Rev 3

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGT-100",
            "section": "Inlet Air Filtration",
            "model": "SGT-100",
            "revision": "8"
        }
    },
    {
        "id": "chunk_060",
        "text": "SIEMENS SGT-100 — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SGT-100 | Rev 7

Combustion Inspection (CI) interval is set for 8000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SGT-100",
            "section": "Combustion Inspection (CI)",
            "model": "SGT-100",
            "revision": "8"
        }
    },
    {
        "id": "chunk_061",
        "text": "SIEMENS SST-800 — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SST-800 | Rev 7

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SST-800",
            "section": "Emergency Trip Procedures",
            "model": "SST-800",
            "revision": "3"
        }
    },
    {
        "id": "chunk_062",
        "text": "SIEMENS SST-800 — GENERAL SPECIFICATIONS
Document Ref: SE-MM-SST-800 | Rev 5

Power output rating is 108 MW under ISO specific conditions. Nominal shaft speed is 3600 RPM. Thermal efficiency approaches state-of-the-art for this class of engine. Supports natural gas, light distillate, and blended hydrogen fuels. ",
        "metadata": {
            "source": "SE-MM-SST-800",
            "section": "General Specifications",
            "model": "SST-800",
            "revision": "9"
        }
    },
    {
        "id": "chunk_063",
        "text": "SIEMENS SST-800 — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SST-800 | Rev 4

Combustion Inspection (CI) interval is set for 8000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SST-800",
            "section": "Combustion Inspection (CI)",
            "model": "SST-800",
            "revision": "4"
        }
    },
    {
        "id": "chunk_064",
        "text": "SIEMENS SST-800 — COMPRESSOR WATER WASH
Document Ref: SE-MM-SST-800 | Rev 6

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SST-800",
            "section": "Compressor Water Wash",
            "model": "SST-800",
            "revision": "9"
        }
    },
    {
        "id": "chunk_065",
        "text": "SIEMENS SST-800 — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SST-800 | Rev 5

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SST-800",
            "section": "Major Overhaul (MO)",
            "model": "SST-800",
            "revision": "3"
        }
    },
    {
        "id": "chunk_066",
        "text": "SIEMENS SST-600 — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SST-600 | Rev 2

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SST-600",
            "section": "Emergency Trip Procedures",
            "model": "SST-600",
            "revision": "3"
        }
    },
    {
        "id": "chunk_067",
        "text": "SIEMENS SST-600 — COMPRESSOR WATER WASH
Document Ref: SE-MM-SST-600 | Rev 5

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SST-600",
            "section": "Compressor Water Wash",
            "model": "SST-600",
            "revision": "4"
        }
    },
    {
        "id": "chunk_068",
        "text": "SIEMENS SST-600 — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SST-600 | Rev 8

Combustion Inspection (CI) interval is set for 8000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SST-600",
            "section": "Combustion Inspection (CI)",
            "model": "SST-600",
            "revision": "9"
        }
    },
    {
        "id": "chunk_069",
        "text": "SIEMENS SST-600 — GENERAL SPECIFICATIONS
Document Ref: SE-MM-SST-600 | Rev 5

Power output rating is 215 MW under ISO specific conditions. Nominal shaft speed is 3000 RPM. Thermal efficiency approaches state-of-the-art for this class of engine. Supports natural gas, light distillate, and blended hydrogen fuels. ",
        "metadata": {
            "source": "SE-MM-SST-600",
            "section": "General Specifications",
            "model": "SST-600",
            "revision": "4"
        }
    },
    {
        "id": "chunk_070",
        "text": "SIEMENS SST-600 — EXHAUST TEMPERATURE MANAGEMENT
Document Ref: SE-MM-SST-600 | Rev 8

Exhaust temperature spread > 40 deg C triggers a burner anomaly warning. Thermocouples in the exhaust plenum must be verified for drifting. High base load temperatures without power output gains point to compressor fouling. ",
        "metadata": {
            "source": "SE-MM-SST-600",
            "section": "Exhaust Temperature Management",
            "model": "SST-600",
            "revision": "2"
        }
    },
    {
        "id": "chunk_071",
        "text": "SIEMENS SST-400 — LUBE OIL SYSTEMS
Document Ref: SE-MM-SST-400 | Rev 9

Use high-quality ISO VG 32 turbine oil. Maximum bearing oil inlet temp: 45°C. Filter delta P must not exceed 1.5 bar before swap. Lube oil system flush required every 5 years or after major bearing failure. ",
        "metadata": {
            "source": "SE-MM-SST-400",
            "section": "Lube Oil Systems",
            "model": "SST-400",
            "revision": "4"
        }
    },
    {
        "id": "chunk_072",
        "text": "SIEMENS SST-400 — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SST-400 | Rev 5

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SST-400",
            "section": "Vibration Diagnostics",
            "model": "SST-400",
            "revision": "6"
        }
    },
    {
        "id": "chunk_073",
        "text": "SIEMENS SST-400 — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SST-400 | Rev 5

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SST-400",
            "section": "Emergency Trip Procedures",
            "model": "SST-400",
            "revision": "2"
        }
    },
    {
        "id": "chunk_074",
        "text": "SIEMENS SST-400 — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SST-400 | Rev 2

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SST-400",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SST-400",
            "revision": "7"
        }
    },
    {
        "id": "chunk_075",
        "text": "SIEMENS SST-400 — MAJOR OVERHAUL (MO)
Document Ref: SE-MM-SST-400 | Rev 2

Complete disassembly of rotor assembly. Requires rotor destacking and balancing. Bearings 1 through 4 are replaced or re-babbitted. Compressor blades undergo MPI (Magnetic Particle Inspection). ",
        "metadata": {
            "source": "SE-MM-SST-400",
            "section": "Major Overhaul (MO)",
            "model": "SST-400",
            "revision": "2"
        }
    },
    {
        "id": "chunk_076",
        "text": "SIEMENS SST-300 — INLET AIR FILTRATION
Document Ref: SE-MM-SST-300 | Rev 3

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SST-300",
            "section": "Inlet Air Filtration",
            "model": "SST-300",
            "revision": "4"
        }
    },
    {
        "id": "chunk_077",
        "text": "SIEMENS SST-300 — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SST-300 | Rev 3

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SST-300",
            "section": "Emergency Trip Procedures",
            "model": "SST-300",
            "revision": "3"
        }
    },
    {
        "id": "chunk_078",
        "text": "SIEMENS SST-300 — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SST-300 | Rev 5

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SST-300",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SST-300",
            "revision": "8"
        }
    },
    {
        "id": "chunk_079",
        "text": "SIEMENS SST-300 — GENERAL SPECIFICATIONS
Document Ref: SE-MM-SST-300 | Rev 3

Power output rating is 301 MW under ISO specific conditions. Nominal shaft speed is 3600 RPM. Thermal efficiency approaches state-of-the-art for this class of engine. Supports natural gas, light distillate, and blended hydrogen fuels. ",
        "metadata": {
            "source": "SE-MM-SST-300",
            "section": "General Specifications",
            "model": "SST-300",
            "revision": "2"
        }
    },
    {
        "id": "chunk_080",
        "text": "SIEMENS SST-300 — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SST-300 | Rev 3

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SST-300",
            "section": "Vibration Diagnostics",
            "model": "SST-300",
            "revision": "8"
        }
    },
    {
        "id": "chunk_081",
        "text": "SIEMENS SGen-1000A — INLET AIR FILTRATION
Document Ref: SE-MM-SGen-1000A | Rev 7

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGen-1000A",
            "section": "Inlet Air Filtration",
            "model": "SGen-1000A",
            "revision": "5"
        }
    },
    {
        "id": "chunk_082",
        "text": "SIEMENS SGen-1000A — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGen-1000A | Rev 6

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGen-1000A",
            "section": "Compressor Water Wash",
            "model": "SGen-1000A",
            "revision": "8"
        }
    },
    {
        "id": "chunk_083",
        "text": "SIEMENS SGen-1000A — EXHAUST TEMPERATURE MANAGEMENT
Document Ref: SE-MM-SGen-1000A | Rev 4

Exhaust temperature spread > 40 deg C triggers a burner anomaly warning. Thermocouples in the exhaust plenum must be verified for drifting. High base load temperatures without power output gains point to compressor fouling. ",
        "metadata": {
            "source": "SE-MM-SGen-1000A",
            "section": "Exhaust Temperature Management",
            "model": "SGen-1000A",
            "revision": "6"
        }
    },
    {
        "id": "chunk_084",
        "text": "SIEMENS SGen-1000A — HOT GAS PATH (HGP) INSPECTION
Document Ref: SE-MM-SGen-1000A | Rev 9

Hot Gas Path Inspection mandates replacement or recoating of stage 1 and 2 turbine blades. Clearance measurements for blade tips must be verified with feeler gauges. Check shroud blocks for oxidation and replace floating seal pins. ",
        "metadata": {
            "source": "SE-MM-SGen-1000A",
            "section": "Hot Gas Path (HGP) Inspection",
            "model": "SGen-1000A",
            "revision": "7"
        }
    },
    {
        "id": "chunk_085",
        "text": "SIEMENS SGen-1000A — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SGen-1000A | Rev 3

Combustion Inspection (CI) interval is set for 4000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SGen-1000A",
            "section": "Combustion Inspection (CI)",
            "model": "SGen-1000A",
            "revision": "9"
        }
    },
    {
        "id": "chunk_086",
        "text": "SIEMENS SGen-100A — INLET AIR FILTRATION
Document Ref: SE-MM-SGen-100A | Rev 6

Multi-stage HEPA filters must be employed in dusty or coastal environments. Pulse cleaning systems activate when delta P reaches 3 InWC. Inspect inlet silencers and expansion joints for acoustic blanket degradation. ",
        "metadata": {
            "source": "SE-MM-SGen-100A",
            "section": "Inlet Air Filtration",
            "model": "SGen-100A",
            "revision": "4"
        }
    },
    {
        "id": "chunk_087",
        "text": "SIEMENS SGen-100A — COMBUSTION INSPECTION (CI)
Document Ref: SE-MM-SGen-100A | Rev 7

Combustion Inspection (CI) interval is set for 4000 Equivalent Operating Hours (EOH). Scope includes borescope of transition pieces, fuel nozzles, and flow testing. Replace pre-mix components if burner tip wear is excessive. ",
        "metadata": {
            "source": "SE-MM-SGen-100A",
            "section": "Combustion Inspection (CI)",
            "model": "SGen-100A",
            "revision": "5"
        }
    },
    {
        "id": "chunk_088",
        "text": "SIEMENS SGen-100A — COMPRESSOR WATER WASH
Document Ref: SE-MM-SGen-100A | Rev 7

Online water wash should be performed every 3-4 weeks. Offline crank wash involves soaking the compressor with specialized detergent. Ensure IGV angles are fully open before commencing offline wash cycle. ",
        "metadata": {
            "source": "SE-MM-SGen-100A",
            "section": "Compressor Water Wash",
            "model": "SGen-100A",
            "revision": "6"
        }
    },
    {
        "id": "chunk_089",
        "text": "SIEMENS SGen-100A — VIBRATION DIAGNOSTICS
Document Ref: SE-MM-SGen-100A | Rev 4

Normal operating vibration < 2.5 mm/s. Alarm at 4.5 mm/s, Trip at 7.0 mm/s. Excessive 1X vibration indicates imbalance. 2X vibration indicates misalignment. Check seismic and proximity probes on all bearings during annual calibration. ",
        "metadata": {
            "source": "SE-MM-SGen-100A",
            "section": "Vibration Diagnostics",
            "model": "SGen-100A",
            "revision": "9"
        }
    },
    {
        "id": "chunk_090",
        "text": "SIEMENS SGen-100A — EMERGENCY TRIP PROCEDURES
Document Ref: SE-MM-SGen-100A | Rev 6

In the event of a shaft vibration trip, do NOT attempt an immediate restart. Lube oil pumps must remain on DC backup power for 48 hours for shaft cooling. Engage turning gear once speed drops below 100 RPM to prevent thermal bowing. ",
        "metadata": {
            "source": "SE-MM-SGen-100A",
            "section": "Emergency Trip Procedures",
            "model": "SGen-100A",
            "revision": "2"
        }
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
    print(f"Chunks to ingest: {len(CHUNKS)}\n")

    enriched = embed_chunks(api_key, CHUNKS)
    upload_to_s3(enriched, bucket=args.bucket, profile=args.profile)


if __name__ == "__main__":
    main()
