"""TalentLens AI — Candidates API Router"""
import os
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.config import settings
from app.models.candidate import Candidate, CandidateMatch
from app.services import gemini_service, matching_engine
from app.services.resume_parser import parse_resume, validate_file

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Upload a resume (PDF or DOCX). AI will parse and analyze it."""
    file_bytes = await file.read()
    
    # Validate
    try:
        validate_file(file_bytes, file.filename, settings.MAX_FILE_SIZE_MB)
    except ValueError as e:
        raise HTTPException(400, str(e))
    
    # Parse text
    try:
        raw_text = parse_resume(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(422, f"Could not parse file: {str(e)}")
    
    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1].lower()
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{file_ext}")
    with open(file_path, "wb") as f:
        f.write(file_bytes)
    
    # AI analysis
    try:
        analysis = await gemini_service.analyze_resume(raw_text)
    except Exception as e:
        logger.error(f"Resume analysis failed: {e}")
        analysis = {
            "name": "Unknown Candidate",
            "skills": [],
            "experience": [],
            "education": [],
            "ai_summary": "Analysis unavailable. Please check your Gemini API key.",
        }
    
    # Fraud detection
    try:
        fraud_result = await gemini_service.detect_resume_fraud(raw_text, analysis)
    except Exception as e:
        logger.warning(f"Fraud detection failed (non-fatal): {e}")
        fraud_result = {"risk_score": 0.0, "flags": []}
    
    candidate = Candidate(
        name=analysis.get("name"),
        email=analysis.get("email"),
        phone=analysis.get("phone"),
        location=analysis.get("location"),
        linkedin_url=analysis.get("linkedin_url"),
        github_url=analysis.get("github_url"),
        file_name=file.filename,
        file_path=file_path,
        file_type=file_ext.lstrip("."),
        raw_text=raw_text,
        skills=analysis.get("skills", []),
        experience=analysis.get("experience", []),
        education=analysis.get("education", []),
        projects=analysis.get("projects", []),
        certifications=analysis.get("certifications", []),
        achievements=analysis.get("achievements", []),
        technologies=analysis.get("technologies", []),
        publications=analysis.get("publications", []),
        open_source=analysis.get("open_source", []),
        leadership_experience=analysis.get("leadership_experience"),
        career_progression=analysis.get("career_progression"),
        total_years_experience=analysis.get("total_years_experience"),
        ai_summary=analysis.get("ai_summary"),
        fraud_risk_score=fraud_result.get("risk_score", 0.0),
        fraud_flags=fraud_result.get("flags", []),
        anonymous_id=f"CAND-{str(uuid.uuid4())[:8].upper()}",
    )
    
    db.add(candidate)
    await db.commit()
    await db.refresh(candidate)
    
    # Embed for semantic search
    try:
        matching_engine.embed_candidate(candidate.id, analysis)
        candidate.embedding_id = candidate.id
        await db.commit()
    except Exception as e:
        logger.warning(f"Candidate embedding failed (non-fatal): {e}")
    
    return _serialize_candidate(candidate)


@router.get("/")
async def list_candidates(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List all candidates."""
    query = select(Candidate).offset(skip).limit(limit).order_by(Candidate.created_at.desc())
    result = await db.execute(query)
    candidates = result.scalars().all()
    return [_serialize_candidate(c) for c in candidates]


@router.get("/stats")
async def get_candidate_stats(db: AsyncSession = Depends(get_db)):
    """Get candidate statistics."""
    total = await db.scalar(select(func.count(Candidate.id)))
    return {"total": total or 0}


@router.get("/{candidate_id}")
async def get_candidate(
    candidate_id: str,
    anonymous: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """Get a specific candidate, optionally anonymized."""
    candidate = await db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(404, "Candidate not found")
    return _serialize_candidate(candidate, anonymous=anonymous)


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_candidate(candidate_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a candidate."""
    candidate = await db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(404, "Candidate not found")
    await db.delete(candidate)
    await db.commit()


def _serialize_candidate(candidate: Candidate, anonymous: bool = False) -> dict:
    return {
        "id": candidate.id,
        "name": candidate.anonymous_id if anonymous else candidate.name,
        "email": None if anonymous else candidate.email,
        "phone": None if anonymous else candidate.phone,
        "location": None if anonymous else candidate.location,
        "linkedin_url": None if anonymous else candidate.linkedin_url,
        "github_url": None if anonymous else candidate.github_url,
        "file_name": candidate.file_name,
        "file_type": candidate.file_type,
        "skills": candidate.skills or [],
        "technologies": candidate.technologies or [],
        "experience": candidate.experience or [],
        "education": candidate.education or [],
        "projects": candidate.projects or [],
        "certifications": candidate.certifications or [],
        "achievements": candidate.achievements or [],
        "publications": candidate.publications or [],
        "open_source": candidate.open_source or [],
        "leadership_experience": candidate.leadership_experience,
        "career_progression": candidate.career_progression,
        "total_years_experience": candidate.total_years_experience,
        "ai_summary": candidate.ai_summary,
        "fraud_risk_score": candidate.fraud_risk_score,
        "fraud_flags": candidate.fraud_flags or [],
        "anonymous_id": candidate.anonymous_id,
        "created_at": candidate.created_at.isoformat() if candidate.created_at else None,
    }
