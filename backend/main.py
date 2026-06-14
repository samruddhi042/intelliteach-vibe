from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from database import engine, Base
from routes import (
    auth,
    dashboard,
    live_class,
    recordings,
    engagement,
    mastery,
    homework,
    questions,
    projects,
    reports,
)

load_dotenv()

# CORS origins — combine .env value with common local dev ports
_env_origins = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = [o.strip() for o in _env_origins.split(",") if o.strip()]

# Always allow these common local dev URLs
DEFAULT_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

for origin in DEFAULT_ORIGINS:
    if origin not in CORS_ORIGINS:
        CORS_ORIGINS.append(origin)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: (nothing needed for now)


app = FastAPI(
    title="AMEP Backend API",
    description="Adaptive Mastery & Engagement Platform - Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS — single middleware, single source of truth
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(live_class.router)
app.include_router(recordings.router)
app.include_router(engagement.router)
app.include_router(mastery.router)
app.include_router(homework.router)
app.include_router(questions.router)
app.include_router(projects.router)
app.include_router(reports.router)


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "AMEP Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)