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

# CORS origins from environment
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")


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

# Configure CORS
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

