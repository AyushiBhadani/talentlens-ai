"""TalentLens AI — Matching API Router"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.job import Job
from app.models.candidate import Candidate, CandidateMatch
from app.services import gemini_service, matching_engine

logger = logging.getLogger(__name__)
router = APIRouter()


class CompareRequest(BaseModel):
    candidate_a_id: str
    candidate_b_id: str
    job_id: Optional[str] = None


@router.post("/jobs/{job_id}/rank")
async def rank_candidates_for_job(
    job_id: str,
    anonymous: bool = False,
    db: AsyncSession = Depends(get_db),
):
    """
    Semantically rank all candidates for a job.
    Returns ranked list with scores and AI explanations.
    """
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    
    job_data = {
        "title": job.title,
        "required_skills": job.required_skills or [],
        "preferred_skills": job.preferred_skills or [],
        "responsibilities": job.responsibilities or [],
        "experience_requirements": job.experience_requirements or "",
        "education_requirements": job.education_requirements or "",
        "soft_skills": job.soft_skills or [],
        "leadership_expectations": job.leadership_expectations or "",
        "hiring_priorities": job.hiring_priorities or [],
        "industry": job.industry or "",
        "domain": job.domain or "",
        "ai_summary": job.ai_summary or "",
    }
    
    # Get all candidates
    result = await db.execute(select(Candidate))
    all_candidates = result.scalars().all()
    
    if not all_candidates:
        return {"job_id": job_id, "ranked_candidates": [], "total": 0}
    
    # Check for existing matches
    existing_matches = {}
    matches_result = await db.execute(
        select(CandidateMatch).where(CandidateMatch.job_id == job_id)
    )
    for m in matches_result.scalars().all():
        existing_matches[m.candidate_id] = m
    
    ranked = []
    
    for candidate in all_candidates:
        candidate_data = {
            "name": candidate.name,
            "skills": candidate.skills or [],
            "technologies": candidate.technologies or [],
            "experience": candidate.experience or [],
            "education": candidate.education or [],
            "projects": candidate.projects or [],
            "certifications": candidate.certifications or [],
            "achievements": candidate.achievements or [],
            "leadership_experience": candidate.leadership_experience or "",
            "career_progression": candidate.career_progression or "",
            "total_years_experience": candidate.total_years_experience or 0,
            "ai_summary": candidate.ai_summary or "",
        }
        
        # Compute semantic scores
        scores = matching_engine.compute_semantic_scores(job_data, candidate_data)
        
        # Check if we already have an explanation for this match
        if candidate.id in existing_matches:
            match = existing_matches[candidate.id]
            explanation = {
                "overall_explanation": match.overall_explanation,
                "strengths": match.strengths or [],
                "weaknesses": match.weaknesses or [],
                "missing_skills": match.missing_skills or [],
                "transferable_skills": match.transferable_skills or [],
                "recommendation": match.recommendation,
                "interview_questions": match.interview_questions or [],
                "skill_gaps": match.skill_gaps or [],
            }
        else:
            # Generate AI explanation
            try:
                explanation = await gemini_service.generate_match_explanation(
                    candidate_data, job_data, scores
                )
            except Exception as e:
                logger.warning(f"Explanation generation failed: {e}")
                explanation = {
                    "overall_explanation": "AI explanation unavailable.",
                    "strengths": [],
                    "weaknesses": [],
                    "missing_skills": [],
                    "transferable_skills": [],
                    "recommendation": "Review manually",
                    "interview_questions": [],
                    "skill_gaps": [],
                }
            
            # Save match to database
            match = CandidateMatch(
                candidate_id=candidate.id,
                job_id=job_id,
                overall_score=scores["overall_score"],
                technical_score=scores["technical_score"],
                experience_score=scores["experience_score"],
                leadership_score=scores["leadership_score"],
                education_score=scores["education_score"],
                soft_skills_score=scores["soft_skills_score"],
                growth_potential_score=scores["growth_potential_score"],
                confidence_score=scores["confidence_score"],
                overall_explanation=explanation.get("overall_explanation"),
                strengths=explanation.get("strengths", []),
                weaknesses=explanation.get("weaknesses", []),
                missing_skills=explanation.get("missing_skills", []),
                transferable_skills=explanation.get("transferable_skills", []),
                recommendation=explanation.get("recommendation"),
                interview_questions=explanation.get("interview_questions", []),
                skill_gaps=explanation.get("skill_gaps", []),
            )
            db.add(match)
        
        ranked.append({
            "candidate": {
                "id": candidate.id,
                "name": candidate.anonymous_id if anonymous else candidate.name,
                "anonymous_id": candidate.anonymous_id,
                "email": None if anonymous else candidate.email,
                "location": None if anonymous else candidate.location,
                "skills": candidate.skills or [],
                "technologies": candidate.technologies or [],
                "total_years_experience": candidate.total_years_experience,
                "ai_summary": candidate.ai_summary,
                "fraud_risk_score": candidate.fraud_risk_score,
                "career_progression": candidate.career_progression,
            },
            "scores": scores,
            "explanation": explanation,
        })
    
    await db.commit()
    
    # Sort by overall score descending
    ranked.sort(key=lambda x: x["scores"]["overall_score"], reverse=True)
    
    # Add rank labels
    for i, item in enumerate(ranked):
        item["rank"] = i + 1
        if i == 0:
            item["rank_label"] = "🥇 Top Candidate"
        elif i == 1:
            item["rank_label"] = "🥈 Strong Candidate"
        elif i == 2:
            item["rank_label"] = "🥉 Good Candidate"
        elif item["scores"]["overall_score"] > 0.6:
            item["rank_label"] = "✅ Qualified"
        elif item["scores"]["overall_score"] > 0.4:
            item["rank_label"] = "⚠️ Partial Match"
        else:
            item["rank_label"] = "❌ Low Match"
    
    return {
        "job_id": job_id,
        "job_title": job.title,
        "ranked_candidates": ranked,
        "total": len(ranked),
    }


@router.post("/compare")
async def compare_candidates(
    body: CompareRequest,
    db: AsyncSession = Depends(get_db),
):
    """AI-powered comparison of two candidates."""
    candidate_a = await db.get(Candidate, body.candidate_a_id)
    candidate_b = await db.get(Candidate, body.candidate_b_id)
    
    if not candidate_a:
        raise HTTPException(404, f"Candidate {body.candidate_a_id} not found")
    if not candidate_b:
        raise HTTPException(404, f"Candidate {body.candidate_b_id} not found")
    
    job = await db.get(Job, body.job_id) if body.job_id else None
    
    candidate_a_data = _candidate_to_dict(candidate_a)
    candidate_b_data = _candidate_to_dict(candidate_b)
    job_data = _job_to_dict(job) if job else {"title": "General Comparison", "required_skills": [], "hiring_priorities": []}
    
    # Compute scores for both
    scores_a = matching_engine.compute_semantic_scores(job_data, candidate_a_data)
    scores_b = matching_engine.compute_semantic_scores(job_data, candidate_b_data)
    
    # AI comparison
    try:
        comparison = await gemini_service.generate_comparison(
            candidate_a_data, candidate_b_data, job_data
        )
    except Exception as e:
        logger.error(f"Comparison generation failed: {e}")
        comparison = {"summary": "Comparison unavailable.", "winner": "Tie"}
    
    return {
        "candidate_a": {**candidate_a_data, "scores": scores_a},
        "candidate_b": {**candidate_b_data, "scores": scores_b},
        "comparison": comparison,
        "job": job_data if job else None,
    }


def _candidate_to_dict(c: Candidate) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "skills": c.skills or [],
        "technologies": c.technologies or [],
        "experience": c.experience or [],
        "education": c.education or [],
        "projects": c.projects or [],
        "certifications": c.certifications or [],
        "achievements": c.achievements or [],
        "leadership_experience": c.leadership_experience or "",
        "career_progression": c.career_progression or "",
        "total_years_experience": c.total_years_experience or 0,
        "ai_summary": c.ai_summary or "",
    }


def _job_to_dict(j: Job) -> dict:
    return {
        "title": j.title,
        "required_skills": j.required_skills or [],
        "preferred_skills": j.preferred_skills or [],
        "hiring_priorities": j.hiring_priorities or [],
        "experience_requirements": j.experience_requirements or "",
        "ai_summary": j.ai_summary or "",
    }
