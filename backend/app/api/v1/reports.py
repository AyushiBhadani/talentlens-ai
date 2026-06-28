"""TalentLens AI — Reports API"""
import logging
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.job import Job
from app.models.candidate import Candidate, CandidateMatch

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/candidate/{candidate_id}/pdf")
async def generate_candidate_report(
    candidate_id: str,
    job_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Generate a PDF report for a candidate."""
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib import colors
    
    candidate = await db.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(404, "Candidate not found")
    
    match = None
    job = None
    if job_id:
        job = await db.get(Job, job_id)
        match_result = await db.execute(
            select(CandidateMatch).where(
                CandidateMatch.candidate_id == candidate_id,
                CandidateMatch.job_id == job_id,
            )
        )
        match = match_result.scalar_one_or_none()
    
    # Build PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        "Title", parent=styles["Heading1"],
        textColor=HexColor("#6366f1"), fontSize=20, spaceAfter=12
    )
    story.append(Paragraph("TalentLens AI — Candidate Report", title_style))
    story.append(Spacer(1, 12))
    
    # Candidate name
    story.append(Paragraph(f"<b>{candidate.name or 'Unknown Candidate'}</b>", styles["Heading2"]))
    if candidate.email:
        story.append(Paragraph(f"Email: {candidate.email}", styles["Normal"]))
    if candidate.location:
        story.append(Paragraph(f"Location: {candidate.location}", styles["Normal"]))
    story.append(Spacer(1, 12))
    
    # AI Summary
    story.append(Paragraph("<b>AI Summary</b>", styles["Heading3"]))
    story.append(Paragraph(candidate.ai_summary or "No summary available.", styles["Normal"]))
    story.append(Spacer(1, 12))
    
    # Skills
    if candidate.skills:
        story.append(Paragraph("<b>Skills</b>", styles["Heading3"]))
        story.append(Paragraph(", ".join(candidate.skills[:20]), styles["Normal"]))
        story.append(Spacer(1, 8))
    
    # Experience
    if candidate.experience:
        story.append(Paragraph("<b>Experience</b>", styles["Heading3"]))
        for exp in candidate.experience[:5]:
            story.append(Paragraph(
                f"<b>{exp.get('title', 'N/A')}</b> at {exp.get('company', 'N/A')} ({exp.get('duration', 'N/A')})",
                styles["Normal"]
            ))
            if exp.get("description"):
                story.append(Paragraph(exp["description"][:200], styles["Normal"]))
            story.append(Spacer(1, 4))
    
    # Match details if available
    if match and job:
        story.append(Spacer(1, 12))
        story.append(Paragraph(f"<b>Match Analysis for: {job.title}</b>", styles["Heading2"]))
        
        # Score table
        score_data = [
            ["Dimension", "Score"],
            ["Overall Match", f"{match.overall_score:.0%}"],
            ["Technical Skills", f"{match.technical_score:.0%}"],
            ["Experience", f"{match.experience_score:.0%}"],
            ["Leadership", f"{match.leadership_score:.0%}"],
            ["Education", f"{match.education_score:.0%}"],
            ["Growth Potential", f"{match.growth_potential_score:.0%}"],
        ]
        
        table = Table(score_data, colWidths=[250, 100])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#6366f1")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f8f9ff"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ]))
        story.append(table)
        story.append(Spacer(1, 12))
        
        if match.overall_explanation:
            story.append(Paragraph("<b>AI Analysis</b>", styles["Heading3"]))
            story.append(Paragraph(match.overall_explanation, styles["Normal"]))
        
        if match.strengths:
            story.append(Spacer(1, 8))
            story.append(Paragraph("<b>Strengths</b>", styles["Heading3"]))
            for s in match.strengths:
                story.append(Paragraph(f"• {s}", styles["Normal"]))
        
        if match.missing_skills:
            story.append(Spacer(1, 8))
            story.append(Paragraph("<b>Skill Gaps</b>", styles["Heading3"]))
            for s in match.missing_skills:
                story.append(Paragraph(f"• {s}", styles["Normal"]))
        
        if match.interview_questions:
            story.append(Spacer(1, 8))
            story.append(Paragraph("<b>Recommended Interview Questions</b>", styles["Heading3"]))
            for i, q in enumerate(match.interview_questions[:5], 1):
                story.append(Paragraph(f"{i}. {q}", styles["Normal"]))
        
        if match.recommendation:
            story.append(Spacer(1, 12))
            story.append(Paragraph("<b>Hiring Recommendation</b>", styles["Heading3"]))
            story.append(Paragraph(match.recommendation, styles["Normal"]))
    
    doc.build(story)
    buffer.seek(0)
    
    filename = f"talentlens_{(candidate.name or 'candidate').replace(' ', '_')}_report.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
