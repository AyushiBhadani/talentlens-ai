"""
TalentLens AI — FastAPI Backend
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import jobs, candidates, matching, assistant, analytics, reports, auth

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    logger.info("🚀 TalentLens AI starting up...")
    await init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("👋 TalentLens AI shutting down...")


app = FastAPI(
    title="TalentLens AI API",
    description="Beyond Keywords. Beyond Resumes. Hiring Intelligence.",
    version="1.0.0",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(jobs.router, prefix="/api/v1/jobs", tags=["Jobs"])
app.include_router(candidates.router, prefix="/api/v1/candidates", tags=["Candidates"])
app.include_router(matching.router, prefix="/api/v1/matching", tags=["Matching"])
app.include_router(assistant.router, prefix="/api/v1/assistant", tags=["LENS Assistant"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "TalentLens AI", "version": "1.0.0"}
