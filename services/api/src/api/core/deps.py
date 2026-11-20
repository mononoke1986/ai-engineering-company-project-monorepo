from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from api.core.audit import audit
from api.core.config import SECRET_KEY, ALGORITHM
from api.users.service import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def get_current_user(request: Request, token: str | None = Depends(oauth2_scheme)) -> dict:
    error = HTTPException(
        status_code=401,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        audit("auth.access", "denied", request, detail="sin token")
        raise error
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
    except JWTError:
        audit("auth.access", "denied", request, detail="token no válido")
        raise error
    if not user_id:
        audit("auth.access", "denied", request, detail="token sin sujeto")
        raise error
    user = get_user_by_id(user_id)
    if not user or not user["is_active"]:
        audit("auth.access", "denied", request, user_id, "usuario inexistente o inactivo")
        raise error
    return user


def ensure_self_or_admin(current: dict, user_id: str):
    if current["id"] != user_id and current["role"] != "admin":
        raise HTTPException(status_code=403, detail="No tienes permiso")