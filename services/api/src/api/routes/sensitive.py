from fastapi import APIRouter, Depends
from api.core.deps import get_current_user

# Con "dependencies" el guardia vigila TODAS las rutas de este router
router = APIRouter(
    prefix="/records",
    tags=["records"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/orders")
def list_orders():
    return [{"id": 1, "item": "Laptop", "total": 2500}]


@router.get("/invoices")
def list_invoices():
    return [{"id": 1, "amount": 2500, "status": "pagada"}]


@router.get("/payments")
def list_payments():
    return [{"id": 1, "method": "tarjeta", "last4": "4242"}]


@router.get("/customers")
def list_customers():
    return [{"id": 1, "name": "Cliente Demo", "email": "cliente@demo.com"}]


@router.get("/reports")
def list_reports():
    return [{"id": 1, "title": "Ventas del mes", "confidential": True}]