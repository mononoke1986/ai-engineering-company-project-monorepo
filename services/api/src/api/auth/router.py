from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from api.core.audit import audit
from api.core.security import verify_password, create_access_token
from api.core.deps import get_current_user
from api.users.service import get_user_by_email
from api.profiles.service import get_profile_by_user_id

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(request: Request, form: OAuth2PasswordRequestForm = Depends()):
    # El formulario estándar llama "username" al campo; ahí va el email.
    user = get_user_by_email(form.username)
    if not user or not verify_password(form.password, user["hashed_password"]):
        # No se registra el email intentado ni la contraseña.
        audit("auth.login", "failure", request)
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    audit("auth.login", "success", request, user["id"])
    return {"access_token": create_access_token(user["id"]), "token_type": "bearer"}


@router.get("/me")
def me(current: dict = Depends(get_current_user)):
    profile = get_profile_by_user_id(current["id"])
    return {"email": current["email"], "role": current["role"], "profile": profile}