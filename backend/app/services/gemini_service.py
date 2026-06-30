"""
TalentLens AI — Google Gemini AI Service
Handles all LLM operations using Gemini 1.5 Flash
"""
import json
import logging
import re
from typing import Any

import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure Gemini once
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment. AI features will fail!")

def _get_model(is_json: bool = True):
    # Gemini 1.5 Flash is extremely fast and has huge rate limits
    model_name = "gemini-1.5-flash"
    
    if is_json:
        generation_config = genai.types.GenerationConfig(
            temperature=0.1,
            response_mime_type="application/json"
        )
    else:
        generation_config = genai.types.GenerationConfig(
            temperature=0.4,
        )
        
    return genai.GenerativeModel(model_name, generation_config=generation_config)

def _parse_json_response(text: str) -> Any:
    """Extract JSON from LLM response, handling markdown code blocks."""
    # Remove markdown code blocks
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    text = text.strip()
    
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object/array in the response
        match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        raise ValueError(f"Could not parse JSON from response: {text[:200]}")

async def _call_gemini(prompt: str, is_json: bool = True) -> str:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not set in .env")
        
    model = _get_model(is_json)
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        # Try once more without JSON mime type fallback
        fallback_model = _get_model(is_json=False)
        response = await fallback_model.generate_content_async(prompt)
        return response.text


async def analyze_job_description(jd_text: str) -> dict:
    prompt = f"""You are an expert HR analyst and technical recruiter. Analyze this job description deeply and extract structured intelligence.

JOB DESCRIPTION:
{jd_text}

Return ONLY a valid JSON object with this exact structure:
{{
  "title": "extracted job title",
  "company": "company name if mentioned",
  "location": "location if mentioned",
  "employment_type": "Full-time/Part-time/Contract/Remote/Hybrid",
  "seniority": "Junior/Mid/Senior/Lead/Principal/Director/VP",
  "industry": "industry sector",
  "domain": "technical domain (e.g., Backend, ML, Data Engineering, DevOps)",
  "required_skills": ["skill1", "skill2"],
  "preferred_skills": ["skill1", "skill2"],
  "responsibilities": ["responsibility1", "responsibility2"],
  "experience_requirements": "years and type of experience required",
  "education_requirements": "education requirements",
  "soft_skills": ["communication", "leadership"],
  "leadership_expectations": "leadership responsibilities if any",
  "hiring_priorities": ["most important factor", "second most important"],
  "ai_summary": "A concise 2-3 sentence recruiter-friendly summary of what this role needs"
}}

Be comprehensive. Extract implicit skills too (e.g., if they mention microservices, include Docker/Kubernetes as implicit preferences)."""
    response_text = await _call_gemini(prompt)
    return _parse_json_response(response_text)


async def analyze_resume(resume_text: str) -> dict:
    prompt = f"""You are an expert resume analyst and HR professional. Analyze this resume deeply and extract comprehensive structured data.

RESUME:
{resume_text[:15000]}  

Return ONLY a valid JSON object with this exact structure:
{{
  "name": "full name",
  "email": "email if present",
  "phone": "phone if present",
  "location": "location if present",
  "linkedin_url": "linkedin URL if present",
  "github_url": "github URL if present",
  "skills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2"],
  "experience": [
    {{
      "company": "company name",
      "title": "job title",
      "duration": "2020-2023",
      "years": 3.0,
      "description": "key responsibilities and achievements"
    }}
  ],
  "education": [
    {{
      "institution": "university name",
      "degree": "degree type",
      "field": "field of study",
      "year": "graduation year"
    }}
  ],
  "projects": [
    {{
      "name": "project name",
      "description": "what it does",
      "technologies": ["tech1", "tech2"],
      "impact": "measurable impact if any"
    }}
  ],
  "certifications": ["cert1", "cert2"],
  "achievements": ["achievement1", "achievement2"],
  "publications": ["pub1"],
  "open_source": ["contribution1"],
  "leadership_experience": "description of leadership roles and impact",
  "career_progression": "assessment of career trajectory (e.g., steady growth, pivoted from X to Y)",
  "total_years_experience": 5.0,
  "ai_summary": "A concise 2-3 sentence recruiter-friendly summary of this candidate's profile and unique value"
}}

Infer implicit skills from projects and experience. Be comprehensive."""
    response_text = await _call_gemini(prompt)
    return _parse_json_response(response_text)


async def generate_match_explanation(candidate_data: dict, job_data: dict, scores: dict) -> dict:
    prompt = f"""You are a senior technical recruiter reviewing a candidate for a job.

JOB:
Title: {job_data.get('title', 'N/A')}
Required Skills: {', '.join(job_data.get('required_skills', []))}
Experience Required: {job_data.get('experience_requirements', 'N/A')}
Priorities: {', '.join(job_data.get('hiring_priorities', []))}
Summary: {job_data.get('ai_summary', '')}

CANDIDATE:
Summary: {candidate_data.get('ai_summary', '')}
Skills: {', '.join(candidate_data.get('skills', []))}
Technologies: {', '.join(candidate_data.get('technologies', []))}
Experience: {candidate_data.get('total_years_experience', 0)} years
Career: {candidate_data.get('career_progression', 'N/A')}
Leadership: {candidate_data.get('leadership_experience', 'N/A')}

COMPUTED SCORES:
- Technical Match: {scores.get('technical_score', 0):.0%}
- Experience Match: {scores.get('experience_score', 0):.0%}
- Leadership Match: {scores.get('leadership_score', 0):.0%}
- Education Match: {scores.get('education_score', 0):.0%}
- Soft Skills Match: {scores.get('soft_skills_score', 0):.0%}
- Overall Match: {scores.get('overall_score', 0):.0%}

Return ONLY a valid JSON object:
{{
  "overall_explanation": "2-3 sentence explanation of why this candidate scored as they did",
  "strengths": ["specific strength with evidence", "another strength"],
  "weaknesses": ["specific weakness or gap", "another gap"],
  "missing_skills": ["skill they lack that job requires"],
  "transferable_skills": ["skill that applies even if not exact match"],
  "recommendation": "Strong Hire / Hire / Consider / Pass — with brief reasoning",
  "interview_questions": [
    "Personalized question referencing their background",
    "Technical question based on their skills and job needs",
    "Behavioral question based on their experience gaps"
  ],
  "skill_gaps": [
    {{
      "skill": "missing skill",
      "importance": "Critical/Important/Nice-to-have",
      "learning_effort": "days/weeks/months",
      "resource": "recommended learning resource"
    }}
  ],
  "growth_potential": "assessment of candidate's growth trajectory"
}}"""
    response_text = await _call_gemini(prompt)
    return _parse_json_response(response_text)


async def detect_resume_fraud(resume_text: str, parsed_data: dict) -> dict:
    prompt = f"""You are a resume integrity analyst. Analyze this resume for potential issues.

RESUME TEXT (excerpt):
{resume_text[:4000]}

PARSED DATA:
Experience entries: {len(parsed_data.get('experience', []))}
Total claimed years: {parsed_data.get('total_years_experience', 0)}
Skills count: {len(parsed_data.get('skills', []))}

Check for:
1. Impossible or overlapping employment timelines
2. Keyword stuffing (excessive skill lists without evidence)
3. Vague or unsubstantiated claims
4. Inconsistent dates
5. Suspicious patterns

Return ONLY valid JSON:
{{
  "risk_score": 0.15,
  "risk_level": "Low/Medium/High",
  "flags": [
    {{
      "type": "flag type",
      "description": "specific issue found",
      "severity": "Low/Medium/High"
    }}
  ],
  "confidence": 0.85,
  "summary": "brief integrity assessment"
}}

If no issues found, return risk_score: 0.05 and empty flags array."""
    response_text = await _call_gemini(prompt)
    return _parse_json_response(response_text)


async def chat_with_lens(message: str, conversation_history: list, context: dict) -> str:
    context_str = f"""
CURRENT APPLICATION CONTEXT:
- Total Jobs: {context.get('total_jobs', 0)}
- Total Candidates: {context.get('total_candidates', 0)}
- Recent Jobs: {', '.join(context.get('recent_job_titles', []))}
- Top Candidate Names: {', '.join(context.get('top_candidate_names', []))}
"""
    system_prompt = f"""You are LENS, the AI Hiring Copilot for TalentLens AI. You are intelligent, concise, and deeply knowledgeable about recruiting and hiring.

{context_str}

You help recruiters by:
- Answering questions about candidates and jobs in the system
- Generating interview questions
- Comparing candidates
- Writing professional emails (interview invitations, rejections)
- Providing hiring recommendations
- Explaining AI decisions

Be conversational, insightful, and actionable. If asked to do something you cannot do (like access data not in context), explain what information you'd need.
Always format your response in clean markdown when appropriate."""

    # Build prompt from history
    full_prompt = system_prompt + "\n\n--- CHAT HISTORY ---\n"
    for msg in conversation_history[-10:]:
        role = "USER" if msg["role"] == "user" else "LENS AI"
        full_prompt += f"{role}: {msg['content']}\n\n"
    
    full_prompt += f"USER: {message}\nLENS AI:"
    
    try:
        response_text = await _call_gemini(full_prompt, is_json=False)
        return response_text
    except Exception as e:
        logger.error(f"Gemini API chat error: {e}")
        return "I'm having trouble connecting to my AI brain (Gemini). Please check your API key!"


async def generate_comparison(candidate_a: dict, candidate_b: dict, job: dict) -> dict:
    prompt = f"""Compare these two candidates for the job: {job.get('title', 'the role')}

CANDIDATE A ({candidate_a.get('name', 'Candidate A')}):
Skills: {', '.join(candidate_a.get('skills', [])[:15])}
Experience: {candidate_a.get('total_years_experience', 0)} years
Summary: {candidate_a.get('ai_summary', '')}

CANDIDATE B ({candidate_b.get('name', 'Candidate B')}):
Skills: {', '.join(candidate_b.get('skills', [])[:15])}
Experience: {candidate_b.get('total_years_experience', 0)} years
Summary: {candidate_b.get('ai_summary', '')}

JOB REQUIREMENTS:
Required Skills: {', '.join(job.get('required_skills', [])[:10])}
Priorities: {', '.join(job.get('hiring_priorities', []))}

Return ONLY valid JSON:
{{
  "winner": "A or B or Tie",
  "winner_reasoning": "clear explanation of why one is better",
  "candidate_a_advantages": ["advantage 1", "advantage 2"],
  "candidate_b_advantages": ["advantage 1", "advantage 2"],
  "candidate_a_gaps": ["gap 1"],
  "candidate_b_gaps": ["gap 1"],
  "recommendation": "hiring recommendation with reasoning",
  "culture_fit_notes": "assessment based on background",
  "summary": "3-4 sentence comparative summary"
}}"""
    response_text = await _call_gemini(prompt)
    return _parse_json_response(response_text)
