#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CSV="$ROOT/scripts/incidents-healthcore.csv"
PYTHON="$ROOT/services/api/.venv/bin/python"

if [[ ! -x "$PYTHON" ]]; then
  PYTHON="python3"
fi

exec "$PYTHON" "$ROOT/scripts/analyze.py" "$CSV" "$@"
