"""TalentLens AI — Analytics API"""
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.job import Job, JobStatus
from app.models.candidate import Candidate, CandidateMatch

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/overview")
async def get_overview(db: AsyncSession = Depends(get_db)):
    """Get dashboard overview statistics."""
    total_jobs = await db.scalar(select(func.count(Job.id))) or 0
    active_jobs = await db.scalar(
        select(func.count(Job.id)).where(Job.status == JobStatus.ACTIVE)
    ) or 0
    total_candidates = await db.scalar(select(func.count(Candidate.id))) or 0
    total_matches = await db.scalar(select(func.count(CandidateMatch.id))) or 0
    
    # Average match score
    avg_score_result = await db.scalar(func.avg(CandidateMatch.overall_score))
    avg_match_score = round((avg_score_result or 0) * 100, 1)
    
    # High quality matches (>70%)
    high_quality = await db.scalar(
        select(func.count(CandidateMatch.id)).where(CandidateMatch.overall_score > 0.7)
    ) or 0
    
    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "total_candidates": total_candidates,
        "total_matches": total_matches,
        "avg_match_score": avg_match_score,
        "high_quality_matches": high_quality,
    }


@router.get("/skills")
async def get_skill_distribution(db: AsyncSession = Depends(get_db)):
    """Get skill frequency distribution across all candidates."""
    result = await db.execute(select(Candidate.skills))
    
    skill_counts = {}
    for row in result.fetchall():
        skills = row[0] or []
        for skill in skills[:20]:  # Limit to first 20 skills per candidate
            if skill and len(skill) < 50:  # Filter noise
                key = skill.strip().lower()
                skill_counts[key] = skill_counts.get(key, 0) + 1
    
    # Return top 20 skills
    sorted_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:20]
    
    return {
        "skills": [{"skill": s[0], "count": s[1]} for s in sorted_skills]
    }


@router.get("/experience")
async def get_experience_distribution(db: AsyncSession = Depends(get_db)):
    """Get experience distribution across all candidates."""
    result = await db.execute(select(Candidate.total_years_experience))
    
    buckets = {
        "0-2 years": 0,
        "3-5 years": 0,
        "6-8 years": 0,
        "9-12 years": 0,
        "12+ years": 0,
    }
    
    for row in result.fetchall():
        years = row[0]
        if years is None:
            continue
        if years <= 2:
            buckets["0-2 years"] += 1
        elif years <= 5:
            buckets["3-5 years"] += 1
        elif years <= 8:
            buckets["6-8 years"] += 1
        elif years <= 12:
            buckets["9-12 years"] += 1
        else:
            buckets["12+ years"] += 1
    
    return {
        "distribution": [{"range": k, "count": v} for k, v in buckets.items()]
    }


@router.get("/pipeline")
async def get_hiring_pipeline(db: AsyncSession = Depends(get_db)):
    """Get hiring pipeline stats by match score tiers."""
    matches = await db.execute(select(CandidateMatch.overall_score))
    
    pipeline = {
        "top_candidates": 0,   # > 80%
        "strong_matches": 0,   # 60-80%
        "consider": 0,         # 40-60%
        "low_match": 0,        # < 40%
    }
    
    for row in matches.fetchall():
        score = row[0]
        if score > 0.8:
            pipeline["top_candidates"] += 1
        elif score > 0.6:
            pipeline["strong_matches"] += 1
        elif score > 0.4:
            pipeline["consider"] += 1
        else:
            pipeline["low_match"] += 1
    
    return {"pipeline": pipeline}


@router.get("/recent-activity")
async def get_recent_activity(db: AsyncSession = Depends(get_db)):
    """Get recent activity for the dashboard."""
    recent_candidates = await db.execute(
        select(Candidate.id, Candidate.name, Candidate.created_at)
        .order_by(Candidate.created_at.desc())
        .limit(5)
    )
    recent_jobs = await db.execute(
        select(Job.id, Job.title, Job.created_at)
        .order_by(Job.created_at.desc())
        .limit(5)
    )
    
    activities = []
    for row in recent_candidates.fetchall():
        activities.append({
            "type": "candidate_added",
            "title": f"New resume: {row[1] or 'Unknown Candidate'}",
            "id": row[0],
            "timestamp": row[2].isoformat() if row[2] else None,
        })
    for row in recent_jobs.fetchall():
        activities.append({
            "type": "job_created",
            "title": f"New job: {row[1]}",
            "id": row[0],
            "timestamp": row[2].isoformat() if row[2] else None,
        })
    
    activities.sort(key=lambda x: x["timestamp"] or "", reverse=True)
    return {"activities": activities[:8]}
