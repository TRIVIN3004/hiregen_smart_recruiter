from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import fitz  # PyMuPDF
import pdfplumber
import io
import logging

from app.services.gemini import GeminiService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai", tags=["AI Features"])

class QuestionRequest(BaseModel):
    skills: List[str]
    job_title: str

class TranscriptItem(BaseModel):
    question: str
    answer: str

class EvaluationRequest(BaseModel):
    transcript: List[TranscriptItem]

def extract_text_from_pdf(file_bytes: bytes, filename: str) -> str:
    """
    Extracts text from PDF bytes using fitz (PyMuPDF) and falls back to pdfplumber.
    """
    text = ""
    
    if not filename.lower().endswith('.pdf'):
        # If it's a simple text/doc mockup file uploaded, decode directly
        try:
            return file_bytes.decode('utf-8', errors='ignore')
        except Exception:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF.")

    # 1. Try PyMuPDF (fitz)
    try:
        logger.info("Attempting PyMuPDF extraction")
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text()
        doc.close()
        
        if text.strip():
            return text
    except Exception as e:
        logger.warning(f"PyMuPDF extraction failed: {e}. Trying pdfplumber...")

    # 2. Fallback to pdfplumber
    try:
        logger.info("Attempting pdfplumber extraction")
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            extracted_pages = []
            for page in pdf.pages:
                extracted_pages.append(page.extract_text() or "")
            text = "\n".join(extracted_pages)
            
        if text.strip():
            return text
    except Exception as e:
        logger.error(f"pdfplumber extraction failed: {e}")

    # 3. Raise error if text extraction is empty
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from the PDF. The file may be empty or image-only.")
        
    return text

@router.post("/parse-match")
async def parse_and_match(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    try:
        contents = await file.read()
        logger.info(f"Received file: {file.filename}, size: {len(contents)} bytes")
        
        # Extract text
        raw_text = extract_text_from_pdf(contents, file.filename)
        logger.info(f"Successfully extracted {len(raw_text)} characters")

        # Parse Resume
        parsed_resume = GeminiService.parse_resume(raw_text)

        # Match Resume to Job
        match_result = GeminiService.match_job(parsed_resume, job_description)

        return {
            "success": True,
            "parsed_resume": parsed_resume,
            "ats_score": match_result.get("ats_score", 70),
            "match_percentage": match_result.get("match_percentage", 65),
            "skills_matched": match_result.get("skills_matched", []),
            "skills_missing": match_result.get("skills_missing", []),
            "reasoning": match_result.get("reasoning", "")
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error parsing/matching: {e}")
        raise HTTPException(status_code=500, detail=f"AI service failure: {str(e)}")

@router.post("/interview/questions")
async def generate_questions(request: QuestionRequest):
    try:
        questions = GeminiService.generate_interview_questions(request.skills, request.job_title)
        return {
            "success": True,
            "questions": questions
        }
    except Exception as e:
        logger.error(f"Error generating questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interview/evaluate")
async def evaluate_interview(request: EvaluationRequest):
    try:
        # Convert Pydantic items to dicts
        transcript_dicts = [{"question": item.question, "answer": item.answer} for item in request.transcript]
        evaluation = GeminiService.evaluate_interview(transcript_dicts)
        return {
            "success": True,
            **evaluation
        }
    except Exception as e:
        logger.error(f"Error evaluating interview: {e}")
        raise HTTPException(status_code=500, detail=str(e))
