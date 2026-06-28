"""TalentLens AI — Candidate Model"""
from sqlalchemy import Column, String, Text, DateTime, JSON, Float, Boolean, ForeignKey
from datetime import datetime, timezone
import uuid

from app.core.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Raw info (shown in normal mode)
    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    
    # Original file
    file_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_type = Column(String(10), nullable=True)  # pdf or docx
    raw_text = Column(Text, nullable=True)
    
    # AI-parsed structured data
    skills = Column(JSON, default=list)
    experience = Column(JSON, default=list)       # list of {company, title, duration, description}
    education = Column(JSON, default=list)         # list of {institution, degree, field, year}
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    technologies = Column(JSON, default=list)
    publications = Column(JSON, default=list)
    open_source = Column(JSON, default=list)
    leadership_experience = Column(Text, nullable=True)
    career_progression = Column(Text, nullable=True)
    total_years_experience = Column(Float, nullable=True)
    
    # AI summary
    ai_summary = Column(Text, nullable=True)
    
    # Fraud detection
    fraud_risk_score = Column(Float, default=0.0)
    fraud_flags = Column(JSON, default=list)
    
    # Embedding reference
    embedding_id = Column(String(36), nullable=True)
    
    # Anonymous mode display name
    anonymous_id = Column(String(20), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class CandidateMatch(Base):
    """Stores match results between a candidate and a job."""
    __tablename__ = "candidate_matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_id = Column(String(36), ForeignKey("candidates.id"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("jobs.id"), nullable=False, index=True)
    
    # Scores (0.0 - 1.0)
    overall_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    leadership_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    soft_skills_score = Column(Float, default=0.0)
    growth_potential_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    
    # AI explanations
    overall_explanation = Column(Text, nullable=True)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    transferable_skills = Column(JSON, default=list)
    recommendation = Column(Text, nullable=True)
    interview_questions = Column(JSON, default=list)
    skill_gaps = Column(JSON, default=list)
    
    rank = Column(String(10), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
