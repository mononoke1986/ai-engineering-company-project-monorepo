from datetime import datetime, timezone
from uuid import uuid4
from tinydb import Query
from api.database import db
from api.core.security import hash_password

users_table = db.table("users")
Q = Query()


def create_user(email: str, password: str, role: str = "user") -> dict:
    user = {
        "id": str(uuid4()),
        "email": email.lower(),
        "hashed_password": hash_password(password),  # nunca el texto plano
        "is_active": True,
        "role": role,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    users_table.insert(user)
    return user


def get_user_by_id(user_id: str):
    return users_table.get(Q.id == user_id)


def get_user_by_email(email: str):
    return users_table.get(Q.email == email.lower())


def list_users() -> list:
    return users_table.all()


def update_user(user_id: str, changes: dict):
    if "password" in changes:
        changes["hashed_password"] = hash_password(changes.pop("password"))
    if "email" in changes:
        changes["email"] = changes["email"].lower()
    users_table.update(changes, Q.id == user_id)
    return get_user_by_id(user_id)


def delete_user(user_id: str):
    users_table.remove(Q.id == user_id)
