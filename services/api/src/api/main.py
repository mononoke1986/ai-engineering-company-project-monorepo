from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth.router import router as auth_router
from api.users.router import router as users_router
from api.profiles.router import router as profiles_router
from api.routes.sensitive import router as records_router
from api.incidents.router import router as incidents_router

app = FastAPI(title="API segura de la empresa")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(records_router)
app.include_router(incidents_router)


@app.get("/")
def root():
    return {"status": "ok"}
