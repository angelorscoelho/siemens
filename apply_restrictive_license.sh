#!/usr/bin/env bash
# apply_restrictive_license.sh
# Usage:
#   ./apply_restrictive_license.sh [--name "Name"] [--email "email"] [--url "https://site"] [--year 2026] [--set-git] [--prepend] 
# Example:
#   ./apply_restrictive_license.sh --name "Ângelo Coelho" --email "angelorscoelho@gmail.com" --url "https://angelorscoelho.dev" --set-git --prepend

set -euo pipefail

NAME="Ângelo Coelho"
EMAIL="angelorscoelho@gmail.com"
URL="https://angelorscoelho.dev"
YEAR="$(date +%Y)"
SET_GIT=0
PREPEND_HEADERS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) NAME="$2"; shift 2;;
    --email) EMAIL="$2"; shift 2;;
    --url) URL="$2"; shift 2;;
    --year) YEAR="$2"; shift 2;;
    --set-git) SET_GIT=1; shift;;
    --prepend) PREPEND_HEADERS=1; shift;;
    --help) sed -n '1,200p' "$0"; exit 0;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

PROPRIETARY_MARKER="PROPRIETARY — NON-COMMERCIAL USE ONLY"

# 1) README shield (idempotent prepend)
README_FILE="README.md"
README_BLOCK="$(cat <<EOF
Copyright $YEAR $NAME — PROPRIETARY / NON-COMMERCIAL USE ONLY

> **PROPRIETARY / NON-COMMERCIAL USE ONLY**
>
> This repository is source-available strictly for review. Recruiters and tech leads may read the code to evaluate skills and architecture. Companies and for-profit entities are prohibited from using, copying, or integrating this code for commercial gain.
> If your company wishes to commercialize or incorporate this work, you must hire or license it from $NAME — contact: $URL

EOF
)"

if [[ -f "$README_FILE" ]]; then
  if ! grep -q "$PROPRIETARY_MARKER" "$README_FILE"; then
    printf '%s\n%s' "$README_BLOCK" "$(cat "$README_FILE")" > "$README_FILE.tmp" && mv "$README_FILE.tmp" "$README_FILE"
    echo "Prepended README shield to $README_FILE"
  else
    echo "README already contains proprietary marker; skipping README update."
  fi
else
  printf '%s\n' "$README_BLOCK" > "$README_FILE"
  echo "Created $README_FILE with proprietary shield."
fi

# 2) LICENSE (overwrite with PolyForm Noncommercial License 1.0.0)
cat > LICENSE <<EOF
Required Notice:
Copyright $YEAR $NAME — $URL

PolyForm Noncommercial License 1.0.0

1. Definitions
- "Licensor" means the copyright owner.
- "You" means an individual or legal entity receiving this License.
- "Software" means the source code and accompanying files to which this License is attached.
- "Commercial Use" means any use of the Software, by an individual or entity, that is intended for or results in commercial advantage, monetary compensation, or any activity by a for-profit entity, including but not limited to: sale, sublicensing, distribution for a fee, incorporation into paid products, use in operations that provide commercial services, or internal use within a for-profit organization for purposes of generating revenue, reducing costs, or supporting commercial operations.
- "Noncommercial Use" means use that is not Commercial Use.

2. Grant of Rights
Subject to the terms and conditions of this License, Licensor grants You a non-exclusive, worldwide, non-transferable, non-sublicensable license to copy, modify, display, and create derivative works of the Software solely for Noncommercial Use.

3. Restrictions
- You may not use, copy, distribute, or create derivative works of the Software for Commercial Use.
- You may not incorporate the Software into any product, service, internal system, or offering that is used by, sold to, or operated by a for-profit entity.
- Any use by a for-profit entity is expressly prohibited unless a separate commercial license is obtained from Licensor.

4. Commercial Licensing & Contact
Companies or entities that wish to use the Software for Commercial Use must obtain a commercial license from the Licensor. Contact Licensor at $URL to negotiate commercial terms or hiring arrangements. Any commercial use without a valid commercial license is a material breach of this License and constitutes infringement.

5. Required Attribution & Notices
- The Required Notice at the top of this LICENSE file must be preserved in any permitted noncommercial distribution or copy of the Software.
- All copies or substantial portions of the Software used under this License must include the Required Notice and a reference to this License.

6. Termination
This License and the rights granted hereunder will terminate immediately if You violate any provision of this License. Upon termination, You must cease all use and distribution of the Software and destroy all copies in your possession or control.

7. Warranty Disclaimer
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. LICENSOR IS NOT LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM YOUR USE OF THE SOFTWARE.

8. Limitation of Liability
IN NO EVENT WILL LICENSOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO THIS LICENSE OR THE USE OF THE SOFTWARE.

9. Governing Law
This License will be governed by and construed in accordance with the laws of the jurisdiction chosen by Licensor, without regard to conflict-of-law principles.

10. Miscellaneous
If any provision of this License is held to be unenforceable, the remainder will continue in full force and effect.

By using or distributing the Software you agree to the terms of this PolyForm Noncommercial License 1.0.0 and acknowledge the Required Notice above.
EOF

echo "Wrote LICENSE (PolyForm Noncommercial License 1.0.0)."

# 3) Create SOURCE_HEADER.txt
cat > SOURCE_HEADER.txt <<EOF
# Python (.py)
# Copyright $YEAR $NAME. All rights reserved.
# PROPRIETARY — NON-COMMERCIAL USE ONLY.
# Licensed under PolyForm Noncommercial License 1.0.0.
# See LICENSE and $URL for licensing.

-- C-style (.js, .java, .c, .cpp)
-- Copyright $YEAR $NAME. All rights reserved.
-- PROPRIETARY — NON-COMMERCIAL USE ONLY.
-- Licensed under PolyForm Noncommercial License 1.0.0.
-- See LICENSE and $URL for licensing.

/* Block comment alternative
Copyright $YEAR $NAME. All rights reserved.
PROPRIETARY — NON-COMMERCIAL USE ONLY.
Licensed under PolyForm Noncommercial License 1.0.0.
See LICENSE and $URL for licensing.
*/
EOF

echo "Created SOURCE_HEADER.txt"

# 4) Optional: set git config
if [[ $SET_GIT -eq 1 ]]; then
  git config --global user.name "$NAME"
  git config --global user.email "$EMAIL"
  echo "Set global git user.name and user.email."
fi

# 5) Optional: prepend headers to source files (idempotent)
if [[ $PREPEND_HEADERS -eq 1 ]]; then
  echo "Prepending headers to source files (skipping files already containing marker)..."
  find . -type f \( -name "*.py" -o -name "*.js" -o -name "*.java" -o -name "*.c" -o -name "*.cpp" \) -print0 |
  while IFS= read -r -d '' file; do
    # skip binary-like or files in .git
    if [[ "$file" == ./.git/* ]]; then continue; fi
    if grep -q "$PROPRIETARY_MARKER" "$file"; then
      echo "skip: $file"
      continue
    fi
    case "${file##*.}" in
      py)
        header="# Copyright $YEAR $NAME. All rights reserved.
# PROPRIETARY — NON-COMMERCIAL USE ONLY.
# Licensed under PolyForm Noncommercial License 1.0.0.
# See LICENSE and $URL for licensing.
#"
        ;;
      js|java|c|cpp)
        header="// Copyright $YEAR $NAME. All rights reserved.
// PROPRIETARY — NON-COMMERCIAL USE ONLY.
// Licensed under PolyForm Noncommercial License 1.0.0.
// See LICENSE and $URL for licensing.
//"
        ;;
      *)
        continue
        ;;
    esac
    # place header above existing shebang if present
    if head -n1 "$file" | grep -q '^#!'; then
      { head -n1 "$file"; printf '\n%s\n' "$header"; tail -n +2 "$file"; } > "$file.tmp"
    else
      printf '%s\n\n' "$header" | cat - "$file" > "$file.tmp"
    fi
    mv "$file.tmp" "$file"
    echo "patched: $file"
  done
  echo "Header prepend complete."
fi

echo "Done."
