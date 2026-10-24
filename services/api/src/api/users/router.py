from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from api.core.deps import get_current_user, ensure_self_or_admin
from api.users.schemas import UserCreate, UserUpdate, UserOut
from api.users import service
from api.profiles.service import create_profile, delete_profile_by_user_id

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserOut, status_code=201)  # PÚBLICA: cualquiera puede registrarse
def register(data: UserCreate):
    if service.get_user_by_email(data.email):
        raise HTTPException(status_code=409, detail="Ese email ya está registrado")
    user = service.create_user(data.email, data.password)  # el rol siempre es "user"
    create_profile(user["id"], data.name, data.phone, data.address)
    return user


@router.get("", response_model=List[UserOut])
def list_users(current: dict = Depends(get_current_user)):
    return service.list_users()


@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, current: dict = Depends(get_current_user)):
    ensure_self_or_admin(current, user_id)
    user = service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: str, data: UserUpdate, current: dict = Depends(get_current_user)):
    ensure_self_or_admin(current, user_id)
    if not service.get_user_by_id(user_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    changes = data.model_dump(exclude_unset=True, mode="json")
    if "role" in changes and current["role"] != "admin":
        raise HTTPException(status_code=403, detail="Solo un admin puede cambiar el rol")
    return service.update_user(user_id, changes)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, current: dict = Depends(get_current_user)):
    ensure_self_or_admin(current, user_id)
    if not service.get_user_by_id(user_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    delete_profile_by_user_id(user_id)  # también se borra la ficha personal
    service.delete_user(user_id)
    return Response(status_code=204)