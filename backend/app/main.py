from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.db.database import init_db
from backend.app.api.v1 import (
    auth,
    contacts,
    templates,
    campaigns,
    analytics,
    unsubscribe,
    settings,
    landing_pages,
)

app = FastAPI(
    title="Simple Email API",
    description="Backend Marketing CRM API service built with FastAPI, SQLModel & Pydantic.",
    version="1.0.0",
)

# Enable CORS for Next.js / React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def health_check() -> dict:
    return {
        "status": "online",
        "service": "Simple Email CRM Engine",
        "version": "1.0.0",
    }


# Include API Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(contacts.router, prefix="/api/v1")
app.include_router(templates.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(unsubscribe.router, prefix="/api/v1")
app.include_router(settings.router, prefix="/api/v1")
app.include_router(landing_pages.router, prefix="/api/v1")

