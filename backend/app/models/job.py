"""TalentLens AI — Job Description Model"""
from sqlalchemy import Column, String, Text, DateTime, JSON, Enum as SAEnum
from sqlalchemy.dialects.sqlite import TEXT
from datetime import datetime, timezone
import uuid
import enum

from app.core.database import Base


class JobStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    DRAFT = "draft"


class Job(Base):
    __tablename__ = "jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    employment_type = Column(String(50), nullable=True)
    seniority = Column(String(50), nullable=True)
    
    # Raw content
    description_raw = Column(Text, nullable=False)
    
    # AI-parsed structured data (JSON)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    experience_requirements = Column(Text, nullable=True)
    education_requirements = Column(Text, nullable=True)
    soft_skills = Column(JSON, default=list)
    leadership_expectations = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    domain = Column(String(100), nullable=True)
    hiring_priorities = Column(JSON, default=list)
    
    # AI summary
    ai_summary = Column(Text, nullable=True)
    
    # Embedding stored in ChromaDB — ID reference
    embedding_id = Column(String(36), nullable=True)
    
    status = Column(SAEnum(JobStatus), default=JobStatus.ACTIVE)
    candidate_count = Column(String(10), default="0")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
