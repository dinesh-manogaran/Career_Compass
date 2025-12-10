# backend/match_logic.py
from typing import List, Tuple

# Simple skill list (you can expand this)
SKILL_KEYWORDS = [
    "python", "java", "c++", "c", "javascript", "typescript",
    "react", "angular", "vue",
    "html", "css",
    "django", "flask", "fastapi", "node", "express",
    "sql", "mysql", "postgresql", "mongodb",
    "aws", "gcp", "azure",
    "docker", "kubernetes",
    "git", "linux",
    "machine learning", "deep learning", "data science",
    "pandas", "numpy", "tensorflow", "pytorch",
    "rest api", "api", "microservices",
    "frontend", "backend", "fullstack",
]


def extract_skills(text: str) -> List[str]:
    text_low = text.lower()
    found = []
    for skill in SKILL_KEYWORDS:
        if skill in text_low:
            found.append(skill)
    # remove duplicates while keeping order
    seen = set()
    unique = []
    for s in found:
        if s not in seen:
            seen.add(s)
            unique.append(s)
    return unique


def compute_match(
    job_description: str, resume_text: str
) -> Tuple[float, str, List[str], List[str], List[str], str]:
    jd_skills = extract_skills(job_description)
    resume_skills = extract_skills(resume_text)

    matched = [s for s in jd_skills if s in resume_skills]
    missing = [s for s in jd_skills if s not in resume_skills]

    # Score: based on ratio of matched JD skills
    if jd_skills:
        score_raw = len(matched) / len(jd_skills) * 10
    else:
        score_raw = 5.0  # neutral if JD has no known skills

    score = round(score_raw, 1)

    if score >= 8:
        rating = "Strong Match"
    elif score >= 5:
        rating = "Moderate Match"
    else:
        rating = "Weak Match"

    # Gap analysis lines
    gaps: List[str] = []
    if missing:
        gaps.append(
            f"This role expects: {', '.join(missing)} — these are not clearly mentioned in your resume."
        )
        gaps.append(
            "If you actually have experience in these, consider adding them explicitly to your resume."
        )
    else:
        gaps.append("Your resume mentions most of the key skills listed in the job description.")

    # One actionable tip
    tip: str
    if missing:
        # pick one missing skill to focus on
        focus = missing[0]
        tip = (
            f"Try to build or highlight one project involving '{focus}'. "
            f"Even a small personal or college project can strengthen your fit for this role."
        )
    elif matched:
        focus = matched[0]
        tip = (
            f"Emphasize your experience with '{focus}' in your resume summary or top bullet points — "
            f"it aligns well with this job's requirements."
        )
    else:
        tip = (
            "Add a short 'Skills' section that clearly lists your technical skills, "
            "so recruiters can quickly see your strengths."
        )

    return score, rating, matched, missing, gaps, tip


def answer_career_question(question: str) -> str:
    q = question.lower()

    if "data science" in q or "data scientist" in q:
        return (
            "For data science roles, focus on: Python, statistics, SQL, data cleaning, "
            "pandas, numpy, machine learning basics (regression, classification), and tools like Jupyter. "
            "Build 2–3 solid projects using real datasets (Kaggle, etc.) and clearly show problem, approach, and results."
        )

    if "frontend" in q:
        return (
            "For frontend developer roles, you should be comfortable with: HTML, CSS, JavaScript, "
            "a modern framework like React, responsive design, basic Git, and REST API integration. "
            "Create 2–3 portfolio projects (personal website, dashboard, small app) and deploy them online "
            "so you can share live links in your resume."
        )

    if "backend" in q:
        return (
            "For backend roles, focus on: one main language (Python/Java/Node), REST APIs, databases (SQL), "
            "authentication, and basic deployment. A project like a simple e-commerce backend or job portal API "
            "is great to show in your resume."
        )

    if "fullstack" in q or "full-stack" in q:
        return (
            "For fullstack roles, combine frontend (HTML/CSS/JS + React) with backend (Python/Node/Java) "
            "and SQL/NoSQL databases. A full CRUD app with authentication and deployment (e.g., Render/Netlify) "
            "is a strong proof of skills."
        )

    if "ready" in q and "job" in q:
        return (
            "To judge readiness, ask: Do you have at least 2–3 solid projects, clear skills in your resume, "
            "and basic Git/GitHub usage? If yes, start applying while continuing to learn and refine your projects."
        )

    # Default generic guidance
    return (
        "Focus on 1–2 main roles (e.g., frontend, backend, data) and build projects directly related to them. "
        "Clearly list your skills and tools, and keep your resume one page, focused, and project-heavy as a student."
    )
