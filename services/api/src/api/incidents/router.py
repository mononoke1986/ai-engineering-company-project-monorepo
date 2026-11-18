from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import Response

from api.core.audit import audit
from api.core.deps import get_current_user
from api.incidents.analysis import AnalysisResult, CSVAnalysisError, analyze_csv


router = APIRouter(prefix="/api/incidents", tags=["incidents"])
latest_result: AnalysisResult | None = None


@router.post("/analyze")
async def analyze_incidents(
    request: Request,
    file: UploadFile | None = File(None),
    current: dict = Depends(get_current_user),
) -> dict:
    global latest_result

    if file is None or not file.filename:
        audit("incidents.analyze", "rejected", request, current["id"], "sin fichero")
        raise HTTPException(status_code=400, detail="Debes seleccionar un fichero CSV.")
    if not file.filename.lower().endswith(".csv"):
        audit("incidents.analyze", "rejected", request, current["id"], "extension no valida")
        raise HTTPException(status_code=400, detail="El fichero debe tener extensión .csv.")

    content = await file.read()
    try:
        result = analyze_csv(content)
    except CSVAnalysisError as error:
        audit("incidents.analyze", "rejected", request, current["id"], "CSV no valido")
        raise HTTPException(status_code=400, detail=str(error)) from error
    finally:
        await file.close()

    latest_result = result
    audit("incidents.analyze", "success", request, current["id"])
    return result.to_dict()


@router.get("/results/export")
def export_results(
    request: Request,
    current: dict = Depends(get_current_user),
) -> Response:
    if latest_result is None:
        audit("incidents.export", "not_found", request, current["id"])
        raise HTTPException(
            status_code=404,
            detail="Todavía no hay resultados. Analiza un CSV primero.",
        )

    audit("incidents.export", "success", request, current["id"])
    return Response(
        content=latest_result.to_csv(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="resultados_healthcore.csv"'},
    )
