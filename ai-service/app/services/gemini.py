import os
import json
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Backend already has GROQ_API_KEY in its .env. We'll read it from the environment if available,
# or the user might pass it in. If not found, use a mock fallback.
# For Docker setups, the env might not propagate automatically, but the user said they attached it.
GROQ_API_KEY = os.getenv("GROQ_API_KEY", os.getenv("GEMINI_API_KEY", ""))

use_fallback = False
if not GROQ_API_KEY or GROQ_API_KEY == "your_gemini_api_key_here":
    logger.warning("GROQ_API_KEY is not configured. AI functions will run in FALLBACK MOCK MODE.")
    use_fallback = True
    groq_client = None
else:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        logger.error(f"Error configuring Groq client: {e}. Falling back to Mock Mode.")
        use_fallback = True
        groq_client = None

class GeminiService:
    @staticmethod
    def _call_llm(prompt: str, model_name: str = "llama-3.3-70b-versatile") -> str:
        if use_fallback or not groq_client:
            raise ValueError("Fallback mode active")
        try:
            completion = groq_client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "You are a specialized AI assistant that only outputs strictly formatted JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return completion.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API call failed: {e}")
            raise e

    @classmethod
    def parse_resume(cls, text: str) -> dict:
        """
        Parses resume raw text and returns structured data as JSON.
        """
        if use_fallback:
            return cls._mock_parse_resume(text)

        prompt = f"""
        Analyze the following resume text and extract candidate information.
        Return the result strictly as a JSON object matching this schema exactly:
        {{
            "name": "Candidate Name or Unknown",
            "email": "email@example.com or empty",
            "phone": "phone number or empty",
            "location": "location city/country or empty",
            "skills": ["Skill1", "Skill2"],
            "experience": [
                {{
                    "company": "Company Name",
                    "role": "Job Title",
                    "startDate": "Start Date",
                    "endDate": "End Date or Present",
                    "description": "Details of work",
                    "current": true
                }}
            ],
            "education": [
                {{
                    "institution": "University/School",
                    "degree": "Degree",
                    "fieldOfStudy": "Major",
                    "startYear": "Year",
                    "endYear": "Year"
                }}
            ],
            "summary": "Short professional summary",
            "improvement_suggestions": ["Suggestion 1", "Suggestion 2"]
        }}

        Resume text:
        ---
        {text}
        ---
        """
        try:
            raw_response = cls._call_llm(prompt)
            return json.loads(raw_response)
        except Exception as e:
            logger.error(f"Failed to parse resume: {e}")
            return cls._mock_parse_resume(text)

    @classmethod
    def match_job(cls, parsed_resume: dict, job_description: str) -> dict:
        """
        Calculates ATS Score, Match Percentage, matched/missing skills, and reasoning based on job description.
        """
        if use_fallback:
            return cls._mock_match_job(parsed_resume, job_description)

        prompt = f"""
        Match the candidate's resume (provided as JSON) against the job description below.
        Evaluate the ATS compatibility, match percentage, and list which skills match and which ones are missing.
        Provide a concise paragraph of evaluation reasoning.
        Return the result strictly as a JSON object matching this schema exactly:
        {{
            "ats_score": 75,
            "match_percentage": 80,
            "skills_matched": ["Skill1", "Skill2"],
            "skills_missing": ["Skill3"],
            "reasoning": "Detailed evaluation reasoning."
        }}

        Candidate Resume JSON:
        ---
        {json.dumps(parsed_resume)}
        ---

        Job Description:
        ---
        {job_description}
        ---
        """
        try:
            raw_response = cls._call_llm(prompt)
            return json.loads(raw_response)
        except Exception as e:
            logger.error(f"Failed to match job: {e}")
            return cls._mock_match_job(parsed_resume, job_description)

    @classmethod
    def generate_interview_questions(cls, skills: list, job_title: str) -> list:
        if use_fallback:
            return cls._mock_interview_questions(skills, job_title)

        prompt = f"""
        Generate 3 technical/role-specific interview questions for a candidate seeking the role of '{job_title}'.
        The candidate has these skills: {", ".join(skills)}.
        Return the response strictly as a JSON object containing a "questions" array of strings:
        {{
            "questions": [
                "Question 1...",
                "Question 2...",
                "Question 3..."
            ]
        }}
        """
        try:
            raw_response = cls._call_llm(prompt)
            return json.loads(raw_response).get("questions", [])
        except Exception as e:
            logger.error(f"Failed to generate questions: {e}")
            return cls._mock_interview_questions(skills, job_title)

    @classmethod
    def evaluate_interview(cls, transcript: list) -> dict:
        if use_fallback:
            return cls._mock_evaluate_interview(transcript)

        prompt = f"""
        Evaluate the following Q&A mock interview transcript.
        Calculate scores, rate communication, technical depth, list strengths, weaknesses, and provide an evaluation summary.
        Return the result strictly as a JSON object matching this schema exactly:
        {{
            "overallScore": 82,
            "evaluation": {{
                "strengths": ["Strength 1", "Strength 2"],
                "weaknesses": ["Weakness 1", "Weakness 2"],
                "communicationRating": 8,
                "technicalRating": 8,
                "summary": "Detailed feedback summary."
            }},
            "detailedFeedback": [
                {{
                    "question": "Question text",
                    "answer": "Answer text",
                    "score": 80,
                    "feedback": "Feedback for this specific answer"
                }}
            ]
        }}

        Transcript:
        ---
        {json.dumps(transcript)}
        ---
        """
        try:
            raw_response = cls._call_llm(prompt)
            return json.loads(raw_response)
        except Exception as e:
            logger.error(f"Failed to evaluate interview: {e}")
            return cls._mock_evaluate_interview(transcript)

    @classmethod
    def evaluate_coding_assessment(cls, problem: str, language: str, code: str) -> dict:
        """
        Evaluates a coding assessment and checks for cheating.
        """
        if use_fallback:
            return {
                "score": 85,
                "passRate": 1.0,
                "feedback": "Mock Mode: Code looks fine, but this is a simulated evaluation.",
                "cheatingDetected": False,
                "cheatingReasoning": "No cheating detected in mock mode."
            }

        prompt = f"""
        You are an expert coding assessor. Please evaluate the following candidate's submitted code for a coding test.
        
        Problem Description/Context:
        {problem}

        Language: {language}
        
        Candidate's Code:
        ```
        {code}
        ```
        
        Task:
        1. Evaluate if the code correctly solves the problem. Determine a score (0-100) and a passRate (0.0 to 1.0, representing test cases passed).
        2. Provide short, constructive feedback.
        3. Determine if there are signs of cheating (e.g., completely hardcoded answers `return [0, 1]`, irrelevant/random variable names mapped perfectly to solution structure, or comments indicating copied text from ChatGPT without modification).
        
        Return the result strictly as a JSON object matching this schema exactly:
        {{
            "score": 90,
            "passRate": 1.0,
            "feedback": "Your code is efficient and well structured.",
            "cheatingDetected": false,
            "cheatingReasoning": "The code logic is sound and naturally written."
        }}
        """
        try:
            raw_response = cls._call_llm(prompt)
            return json.loads(raw_response)
        except Exception as e:
            logger.error(f"Failed to evaluate coding: {e}")
            return {
                "score": 50,
                "passRate": 0.5,
                "feedback": "Failed to parse AI evaluation. " + str(e),
                "cheatingDetected": False,
                "cheatingReasoning": ""
            }

    # --- Fallback Mock Generators ---
    @staticmethod
    def _mock_parse_resume(text: str) -> dict:
        return {
            "name": "Jane Doe",
            "email": "jane.doe@example.com",
            "phone": "+1-555-0199",
            "location": "San Francisco, CA",
            "skills": ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Python", "REST APIs", "Git"],
            "experience": [
                {
                    "company": "Tech Solutions Inc.",
                    "role": "Frontend Developer",
                    "startDate": "Jan 2024",
                    "endDate": "Present",
                    "description": "Developed dynamic interfaces, integrated REST APIs.",
                    "current": True
                }
            ],
            "education": [
                {
                    "institution": "State University",
                    "degree": "B.S. Computer Science",
                    "fieldOfStudy": "Computer Science",
                    "startYear": "2018",
                    "endYear": "2022"
                }
            ],
            "summary": "Mock summary for Jane Doe.",
            "improvement_suggestions": ["Mock suggestion 1"]
        }

    @staticmethod
    def _mock_match_job(parsed_resume: dict, job_description: str) -> dict:
        skills = parsed_resume.get("skills", [])
        job_lower = job_description.lower()
        matched = [s for s in skills if s.lower() in job_lower]
        missing = ["TypeScript", "Docker"]
        
        match_pct = int(min(100, max(45, (len(matched) / (len(matched) + len(missing) + 1)) * 100)))
        ats_score = int(min(100, match_pct + 5))

        return {
            "ats_score": ats_score,
            "match_percentage": match_pct,
            "skills_matched": matched,
            "skills_missing": missing,
            "reasoning": "Mock matching results."
        }

    @staticmethod
    def _mock_interview_questions(skills: list, job_title: str) -> list:
        return ["Mock Q1", "Mock Q2", "Mock Q3"]

    @staticmethod
    def _mock_evaluate_interview(transcript: list) -> dict:
        return {
            "overallScore": 80,
            "evaluation": {
                "strengths": ["Mock strength"],
                "weaknesses": ["Mock weakness"],
                "communicationRating": 8,
                "technicalRating": 7,
                "summary": "Mock interview summary."
            },
            "detailedFeedback": []
        }
