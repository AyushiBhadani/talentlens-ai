"""TalentLens AI — LENS AI Assistant API"""
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.models.job import Job
from app.models.candidate import Candidate
from app.services import gemini_service

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []


@router.post("/chat")
async def chat_with_lens(body: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Send a message to LENS AI Assistant."""
    if not body.message.strip():
        raise HTTPException(400, "Message cannot be empty")
    
    # Build application context
    total_jobs = await db.scalar(select(func.count(Job.id))) or 0
    total_candidates = await db.scalar(select(func.count(Candidate.id))) or 0
    
    recent_jobs_result = await db.execute(
        select(Job.title).order_by(Job.created_at.desc()).limit(5)
    )
    recent_job_titles = [r[0] for r in recent_jobs_result.fetchall()]
    
    recent_candidates_result = await db.execute(
        select(Candidate.name, Candidate.ai_summary).order_by(Candidate.created_at.desc()).limit(5)
    )
    top_candidate_names = [r[0] for r in recent_candidates_result.fetchall() if r[0]]
    
    context = {
        "total_jobs": total_jobs,
        "total_candidates": total_candidates,
        "recent_job_titles": recent_job_titles,
        "top_candidate_names": top_candidate_names,
    }
    
    history = [{"role": m.role, "content": m.content} for m in body.history]
    
    try:
        response = await gemini_service.chat_with_lens(
            message=body.message,
            conversation_history=history,
            context=context,
        )
        return {"response": response, "role": "assistant"}
    except Exception as e:
        logger.error(f"LENS chat error: {e}")
        raise HTTPException(503, f"LENS is temporarily unavailable: {str(e)}")


@router.get("/suggestions")
async def get_suggestions(db: AsyncSession = Depends(get_db)):
    """Get context-aware suggested prompts for LENS."""
    total_jobs = await db.scalar(select(func.count(Job.id))) or 0
    total_candidates = await db.scalar(select(func.count(Candidate.id))) or 0
    
    suggestions = [
        "What are the top candidates for my latest job?",
        "Generate interview questions for a software engineer role",
        "Write a professional interview invitation email",
        "Write a respectful rejection email",
        "Summarize the skill gaps across all candidates",
        "Which candidates have leadership experience?",
        "Who has startup or entrepreneurship experience?",
        "Compare the top two candidates",
        "What technical skills are most common among my candidates?",
        "Generate a hiring report summary",
    ]
    
    if total_candidates == 0:
        suggestions = [
            "How does TalentLens AI work?",
            "What makes semantic matching better than ATS?",
            "How should I write a good job description?",
            "What file formats are supported for resumes?",
            "What is bias reduction mode?",
        ]
    
    return {"suggestions": suggestions[:6]}
