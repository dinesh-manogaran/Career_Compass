# backend/main.py
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from io import BytesIO
from pypdf import PdfReader
from docx import Document

import models, schemas, auth
from database import Base, engine, get_db
from match_logic import compute_match
from gemini_client import client, GEMINI_MODEL

# ✅ CREATE DATABASE TABLES
Base.metadata.create_all(bind=engine)

# ✅ CREATE APP FIRST
app = FastAPI()

# ✅ ✅ ✅ ADD CORS IMMEDIATELY AFTER APP CREATION (CRITICAL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # ✅ allow everything (dev mode)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- ROOT ----------------

@app.get("/")
def root():
    return {"message": "Career Compass API running ✅"}

# ---------------- AUTH ----------------

@app.post("/auth/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    return auth.create_user(db, user_in)

@app.post("/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, user_in.email, user_in.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = auth.create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

# ---------------- FILE TEXT EXTRACTION ----------------

async def extract_text_from_upload(upload: UploadFile) -> str:
    filename = (upload.filename or "").lower()
    raw_bytes = await upload.read()

    if filename.endswith(".pdf"):
        reader = PdfReader(BytesIO(raw_bytes))
        return "\n".join([page.extract_text() or "" for page in reader.pages])

    if filename.endswith(".docx"):
        doc = Document(BytesIO(raw_bytes))
        return "\n".join([p.text for p in doc.paragraphs])

    return raw_bytes.decode("utf-8", errors="ignore")

# ---------------- MATCH ANALYSIS ----------------

@app.post("/analyze_match_upload")
async def analyze_match_upload(
    jd_file: UploadFile = File(...),
    resume_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user),
):
    jd_text = await extract_text_from_upload(jd_file)
    resume_text = await extract_text_from_upload(resume_file)

    score, rating, matched, missing, gaps, tip = compute_match(jd_text, resume_text)

    return {
        "score": score,
        "rating": rating,
        "matched_skills": matched,
        "missing_skills": missing,
        "gaps": gaps,
        "tip": tip,
    }

# ---------------- GEMINI CAREER Q&A ----------------

@app.post("/career_query")
def career_query(req: schemas.CareerQueryRequest):
    prompt = f"""
You are a helpful career guidance assistant for students in India.
Question: {req.question}
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    return {"answer": response.text}
