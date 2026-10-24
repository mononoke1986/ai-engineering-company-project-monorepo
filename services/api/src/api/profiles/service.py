from uuid import uuid4
from tinydb import Query
from api.database import db

profiles_table = db.table("profiles")
Q = Query()


def create_profile(user_id: str, name=None, phone=None, address=None) -> dict:
    profile = {
        "id": str(uuid4()),
        "user_id": user_id,
        "name": name,
        "phone": phone,
        "address": address,
    }
    profiles_table.insert(profile)
    return profile


def get_profile_by_user_id(user_id: str):
    return profiles_table.get(Q.user_id == user_id)


def update_profile(user_id: str, changes: dict):
    profiles_table.update(changes, Q.user_id == user_id)
    return get_profile_by_user_id(user_id)


def delete_profile_by_user_id(user_id: str):
    profiles_table.remove(Q.user_id == user_id)
