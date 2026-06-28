"""
TalentLens AI — Matching Engine (Keyword-Based, No torch dependency)
Uses TF-IDF style scoring for robust matching without heavy ML dependencies.
"""
import logging
import math
from typing import Optional
from collections import Counter
import re

logger = logging.getLogger(__name__)


def _tokenize(text: str) -> list[str]:
    """Lowercase and split text into tokens."""
    if not text:
        return []
    return re.findall(r"[a-z0-9#+.]+", text.lower())


def _jaccard_similarity(set_a: set, set_b: set) -> float:
    """Jaccard similarity between two sets."""
    if not set_a or not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0


def _skill_overlap(job_skills: list, cand_skills: list) -> float:
    """Compute skill overlap score with partial matching."""
    if not job_skills or not cand_skills:
        return 0.3

    job_set = {s.lower().strip() for s in job_skills}
    cand_set = {s.lower().strip() for s in cand_skills}

    # Exact matches
    exact = len(job_set & cand_set)

    # Partial matches (substring)
    partial = 0
    for j in job_set:
        if j not in cand_set:
            for c in cand_set:
                if j in c or c in j:
                    partial += 0.5
                    break

    score = (exact + partial) / len(job_set)
    return min(1.0, score)


def _text_similarity(text_a: str, text_b: str) -> float:
    """Token overlap similarity between two texts."""
    tokens_a = set(_tokenize(text_a))
    tokens_b = set(_tokenize(text_b))
    # Remove very common stop words
    stop = {"and", "or", "the", "a", "an", "in", "of", "to", "for", "with", "is", "are", "be", "has", "have"}
    tokens_a -= stop
    tokens_b -= stop
    return _jaccard_similarity(tokens_a, tokens_b)


def embed_text(text: str) -> list[float]:
    """Stub — not used with keyword engine."""
    return []


def embed_job(job_id: str, job_data: dict) -> None:
    """Stub — ChromaDB not required with keyword engine."""
    pass


def embed_candidate(candidate_id: str, candidate_data: dict) -> None:
    """Stub — ChromaDB not required with keyword engine."""
    pass


def compute_semantic_scores(job_data: dict, candidate_data: dict) -> dict:
    """
    Multi-dimensional keyword-based match scores between job and candidate.
    Returns scores for each dimension (0.0 - 1.0).
    """

    # --- Technical skills ---
    job_req_skills = job_data.get("required_skills", [])
    job_pref_skills = job_data.get("preferred_skills", [])
    cand_skills = candidate_data.get("skills", []) + candidate_data.get("technologies", [])

    req_score = _skill_overlap(job_req_skills, cand_skills) if job_req_skills else 0.5
    pref_score = _skill_overlap(job_pref_skills, cand_skills) if job_pref_skills else 0.5
    technical_score = req_score * 0.7 + pref_score * 0.3

    # --- Experience match ---
    job_exp_text = f"{job_data.get('experience_requirements', '')} {' '.join(job_data.get('responsibilities', []))}"
    cand_exp_entries = candidate_data.get("experience", [])
    cand_exp_text = " ".join([
        f"{e.get('title', '')} {e.get('description', '')} {e.get('company', '')}"
        for e in cand_exp_entries
    ])
    experience_score = _text_similarity(job_exp_text, cand_exp_text) if cand_exp_text.strip() else 0.2

    # Boost by years of experience
    cand_years = candidate_data.get("total_years_experience", 0) or 0
    # Extract required years from job text
    years_match = re.search(r"(\d+)\+?\s*(?:years?|yrs?)", job_data.get("experience_requirements", ""), re.I)
    required_years = int(years_match.group(1)) if years_match else 0
    if required_years > 0:
        years_ratio = min(1.0, cand_years / required_years)
        experience_score = experience_score * 0.6 + years_ratio * 0.4
    else:
        experience_score = experience_score * 0.7 + min(1.0, cand_years / 3) * 0.3

    # --- Leadership match ---
    job_leadership = job_data.get("leadership_expectations", "")
    cand_leadership = candidate_data.get("leadership_experience", "")
    if not job_leadership or job_leadership.strip() in ("", "N/A", "none"):
        leadership_score = 0.7  # Not required — neutral
    elif cand_leadership and cand_leadership.strip():
        leadership_score = _text_similarity(job_leadership, cand_leadership)
        leadership_score = max(0.3, leadership_score)
    else:
        leadership_score = 0.2

    # --- Education match ---
    job_edu = job_data.get("education_requirements", "")
    cand_edu = " ".join([
        f"{e.get('degree', '')} {e.get('field', '')} {e.get('institution', '')}"
        for e in candidate_data.get("education", [])
    ])
    if not job_edu or job_edu.strip() in ("", "N/A"):
        education_score = 0.7
    elif cand_edu.strip():
        education_score = _text_similarity(job_edu, cand_edu)
        education_score = max(0.4, education_score)  # floor for having any education
    else:
        education_score = 0.3

    # --- Soft skills match ---
    job_soft = job_data.get("soft_skills", [])
    cand_soft_text = cand_leadership + " " + " ".join([
        e.get("description", "") for e in cand_exp_entries[:3]
    ])
    if job_soft:
        soft_skills_score = _skill_overlap(job_soft, _tokenize(cand_soft_text))
        soft_skills_score = max(0.3, soft_skills_score)
    else:
        soft_skills_score = 0.6

    # --- Growth potential ---
    num_projects = len(candidate_data.get("projects", []))
    num_certs = len(candidate_data.get("certifications", []))
    num_achievements = len(candidate_data.get("achievements", []))
    growth_potential_score = min(
        0.95,
        0.35 + (num_projects * 0.06) + (num_certs * 0.04) + (num_achievements * 0.04)
    )

    # --- Overall weighted score ---
    overall_score = (
        technical_score * 0.40 +
        experience_score * 0.25 +
        leadership_score * 0.15 +
        education_score * 0.10 +
        soft_skills_score * 0.10
    )

    # --- Confidence score ---
    data_completeness = min(1.0, (
        (1 if cand_skills else 0) +
        (1 if cand_exp_text.strip() else 0) +
        (1 if cand_edu.strip() else 0) +
        (1 if job_req_skills else 0) +
        (1 if job_exp_text.strip() else 0)
    ) / 5)
    confidence_score = 0.6 + (data_completeness * 0.4)

    return {
        "technical_score": round(min(1.0, technical_score), 4),
        "experience_score": round(min(1.0, experience_score), 4),
        "leadership_score": round(min(1.0, leadership_score), 4),
        "education_score": round(min(1.0, education_score), 4),
        "soft_skills_score": round(min(1.0, soft_skills_score), 4),
        "growth_potential_score": round(growth_potential_score, 4),
        "overall_score": round(min(1.0, overall_score), 4),
        "confidence_score": round(confidence_score, 4),
    }


def find_similar_candidates(job_id: str, job_data: dict, n_results: int = 20) -> list[str]:
    """Stub — returns empty list (ChromaDB not used)."""
    return []
