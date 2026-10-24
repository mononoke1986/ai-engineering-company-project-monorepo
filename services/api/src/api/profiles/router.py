from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from api.core.deps import get_current_user
from api.profiles import service

router = APIRouter(prefix="/profiles", tags=["profiles"])


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


@router.get("/me")
def my_profile(current: dict = Depends(get_current_user)):
    return service.get_profile_by_user_id(current["id"])


@router.put("/me")
def update_my_profile(data: ProfileUpdate, current: dict = Depends(get_current_user)):
    # Usamos el id del guardia, no uno de la URL: solo puedes tocar TU ficha
    return service.update_profile(current["id"], data.model_dump(exclude_unset=True))