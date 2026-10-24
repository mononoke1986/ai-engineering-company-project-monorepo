from fastapi import FastAPI
from api.auth.router import router as auth_router
from api.users.router import router as users_router
from api.profiles.router import router as profiles_router
from api.routes.sensitive import router as records_router

app = FastAPI(title="API segura de la empresa")

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(records_router)
