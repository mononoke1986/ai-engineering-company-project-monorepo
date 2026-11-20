import json
from datetime import datetime, timezone
from pathlib import Path

from fastapi import Request

# Registro de auditoría en services/api/audit.log (un evento JSON por línea).
# No guarda contraseñas, tokens ni el contenido de los CSV.
AUDIT_LOG_PATH = Path(__file__).resolve().parents[3] / "audit.log"


def audit(
    action: str,
    outcome: str,
    request: Request | None = None,
    user_id: str | None = None,
    detail: str | None = None,
) -> None:
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action": action,
        "outcome": outcome,
        "user_id": user_id,
        "client_ip": request.client.host if request and request.client else None,
        "path": request.url.path if request else None,
    }
    if detail:
        entry["detail"] = detail
    with AUDIT_LOG_PATH.open("a", encoding="utf-8") as log:
        log.write(json.dumps(entry, ensure_ascii=False) + "\n")
