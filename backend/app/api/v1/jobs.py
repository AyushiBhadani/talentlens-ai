"""TalentLens AI — Jobs API Router"""
import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.job import Job, JobStatus
from app.services import gemini_service, matching_engine

logger = logging.getLogger(__name__)
router = APIRouter()


class JobCreate(BaseModel):
    description_raw: str
    title: Optional[str] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[JobStatus] = None


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_job(body: JobCreate, db: AsyncSession = Depends(get_db)):
    """Create a job by pasting/uploading a JD. AI will analyze it."""
    if len(body.description_raw.strip()) < 50:
        raise HTTPException(400, "Job description is too short. Please provide a complete JD.")
    
    try:
        # AI analysis
        analysis = await gemini_service.analyze_job_description(body.description_raw)
    except Exception as e:
        logger.error(f"JD analysis failed: {e}")
        # Fallback: use basic data
        analysis = {
            "title": body.title or "Untitled Role",
            "required_skills": [],
            "preferred_skills": [],
            "responsibilities": [],
            "ai_summary": "Analysis unavailable. Please check your Gemini API key.",
        }
    
    job = Job(
        title=body.title or analysis.get("title", "Untitled Role"),
        company=analysis.get("company"),
        location=analysis.get("location"),
        employment_type=analysis.get("employment_type"),
        seniority=analysis.get("seniority"),
        description_raw=body.description_raw,
        required_skills=analysis.get("required_skills", []),
        preferred_skills=analysis.get("preferred_skills", []),
        responsibilities=analysis.get("responsibilities", []),
        experience_requirements=analysis.get("experience_requirements"),
        education_requirements=analysis.get("education_requirements"),
        soft_skills=analysis.get("soft_skills", []),
        leadership_expectations=analysis.get("leadership_expectations"),
        industry=analysis.get("industry"),
        domain=analysis.get("domain"),
        hiring_priorities=analysis.get("hiring_priorities", []),
        ai_summary=analysis.get("ai_summary"),
        status=JobStatus.ACTIVE,
    )
    
    db.add(job)
    await db.commit()
    await db.refresh(job)
    
    # Embed for semantic search
    try:
        matching_engine.embed_job(job.id, analysis)
        job.embedding_id = job.id
        await db.commit()
    except Exception as e:
        logger.warning(f"Embedding failed (non-fatal): {e}")
    
    return _serialize_job(job)


@router.get("/")
async def list_jobs(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List all jobs with optional filtering."""
    query = select(Job)
    if status:
        query = query.where(Job.status == status)
    query = query.offset(skip).limit(limit).order_by(Job.created_at.desc())
    
    result = await db.execute(query)
    jobs = result.scalars().all()
    return [_serialize_job(j) for j in jobs]


@router.get("/stats")
async def get_job_stats(db: AsyncSession = Depends(get_db)):
    """Get job statistics."""
    total = await db.scalar(select(func.count(Job.id)))
    active = await db.scalar(select(func.count(Job.id)).where(Job.status == JobStatus.ACTIVE))
    return {"total": total or 0, "active": active or 0}


@router.get("/{job_id}")
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific job."""
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return _serialize_job(job)


@router.patch("/{job_id}")
async def update_job(job_id: str, body: JobUpdate, db: AsyncSession = Depends(get_db)):
    """Update a job."""
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    
    if body.title:
        job.title = body.title
    if body.status:
        job.status = body.status
    
    await db.commit()
    await db.refresh(job)
    return _serialize_job(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a job."""
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    await db.delete(job)
    await db.commit()


def _serialize_job(job: Job) -> dict:
    return {
        "id": job.id,
        "title": job.title,
        "company": job.company,
        "location": job.location,
        "employment_type": job.employment_type,
        "seniority": job.seniority,
        "description_raw": job.description_raw,
        "required_skills": job.required_skills or [],
        "preferred_skills": job.preferred_skills or [],
        "responsibilities": job.responsibilities or [],
        "experience_requirements": job.experience_requirements,
        "education_requirements": job.education_requirements,
        "soft_skills": job.soft_skills or [],
        "leadership_expectations": job.leadership_expectations,
        "industry": job.industry,
        "domain": job.domain,
        "hiring_priorities": job.hiring_priorities or [],
        "ai_summary": job.ai_summary,
        "status": job.status,
        "candidate_count": job.candidate_count,
        "created_at": job.created_at.isoformat() if job.created_at else None,
        "updated_at": job.updated_at.isoformat() if job.updated_at else None,
    }
