from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr


class Role(str, Enum):
    """Solo estos 3 valores son válidos."""
    admin = "admin"
    manager = "manager"
    user = "user"


class UserCreate(BaseModel):
    """Lo que manda quien se registra. NO tiene 'role': nadie se hace admin solo."""
    email: EmailStr
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[Role] = None


class UserOut(BaseModel):
    """Lo que devolvemos. NO incluye hashed_password."""
    id: str
    email: EmailStr
    is_active: bool
    role: Role
    created_at: str
