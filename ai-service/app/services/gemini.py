import os
import json
import logging
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your_gemini_api_key_here")

# Check and configure Gemini
use_fallback = False
if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
    logger.warning("GEMINI_API_KEY is not configured. AI functions will run in FALLBACK MOCK MODE.")
    use_fallback = True
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as e:
        logger.error(f"Error configuring Gemini client: {e}. Falling back to Mock Mode.")
        use_fallback = True

class GeminiService:
    @staticmethod
    def _call_gemini(prompt: str, model_name: str = "gemini-1.5-flash") -> str:
        if use_fallback:
            raise ValueError("Fallback mode active")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
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
        Return the result strictly as a JSON object matching this schema:
        {{
            "name": "Candidate Name or Unknown",
            "email": "email@example.com or empty",
            "phone": "phone number or empty",
            "location": "location city/country or empty",
            "skills": ["Skill1", "Skill2", ...],
            "experience": [
                {{
                    "company": "Company Name",
                    "role": "Job Title",
                    "startDate": "Start Date",
                    "endDate": "End Date or Present",
                    "description": "Details of work",
                    "current": true/false
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
            raw_response = cls._call_gemini(prompt)
            return json.loads(raw_response)
        except Exception:
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
        Return the result strictly as a JSON object matching this schema:
        {{
            "ats_score": 75, // 0 to 100 integer
            "match_percentage": 80, // 0 to 100 integer
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
            raw_response = cls._call_gemini(prompt)
            return json.loads(raw_response)
        except Exception:
            return cls._mock_match_job(parsed_resume, job_description)

    @classmethod
    def generate_interview_questions(cls, skills: list, job_title: str) -> list:
        """
        Generates custom interview questions based on candidate's skills and target job title.
        """
        if use_fallback:
            return cls._mock_interview_questions(skills, job_title)

        prompt = f"""
        Generate 3 technical/role-specific interview questions for a candidate seeking the role of '{job_title}'.
        The candidate has these skills: {", ".join(skills)}.
        Return the response strictly as a JSON array of strings:
        [
            "Question 1...",
            "Question 2...",
            "Question 3..."
        ]
        """
        try:
            raw_response = cls._call_gemini(prompt)
            return json.loads(raw_response)
        except Exception:
            return cls._mock_interview_questions(skills, job_title)

    @classmethod
    def evaluate_interview(cls, transcript: list) -> dict:
        """
        Evaluates interview responses and outputs scores/feedback.
        transcript: list of {"question": "...", "answer": "..."}
        """
        if use_fallback:
            return cls._mock_evaluate_interview(transcript)

        prompt = f"""
        Evaluate the following Q&A mock interview transcript.
        Calculate scores, rate communication, technical depth, list strengths, weaknesses, and provide an evaluation summary.
        Return the result strictly as a JSON object matching this schema:
        {{
            "overallScore": 82, // 0 to 100 integer
            "evaluation": {{
                "strengths": ["Strength 1", "Strength 2"],
                "weaknesses": ["Weakness 1", "Weakness 2"],
                "communicationRating": 8, // 1 to 10 integer
                "technicalRating": 8, // 1 to 10 integer
                "summary": "Detailed feedback summary."
            }},
            "detailedFeedback": [
                {{
                    "question": "Question text",
                    "answer": "Answer text",
                    "score": 80, // 0 to 100 integer
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
            raw_response = cls._call_gemini(prompt)
            return json.loads(raw_response)
        except Exception:
            return cls._mock_evaluate_interview(transcript)

    # --- Fallback Mock Generators ---
    @staticmethod
    def _mock_parse_resume(text: str) -> dict:
        logger.info("Serving mock resume parser results")
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
                    "description": "Developed dynamic interfaces, integrated REST APIs, and managed responsive layout components.",
                    "current": True
                },
                {
                    "company": "Innovate Lab",
                    "role": "Junior Developer",
                    "startDate": "Jun 2022",
                    "endDate": "Dec 2023",
                    "description": "Assisted with building state management stores and writing unit checks.",
                    "current": False
                }
            ],
            "education": [
                {
                    "institution": "State University",
                    "degree": "Bachelor of Science",
                    "fieldOfStudy": "Computer Science",
                    "startYear": "2018",
                    "endYear": "2022"
                }
            ],
            "summary": "Motivated software developer experienced in front-end single page applications and REST API integrations.",
            "improvement_suggestions": [
                "Include concrete metrics for your experiences (e.g. 'Improved speed by 20%').",
                "Add cloud deployment details if you have experience with AWS or GCP."
            ]
        }

    @staticmethod
    def _mock_match_job(parsed_resume: dict, job_description: str) -> dict:
        logger.info("Serving mock job match results")
        # Base parsing matching
        skills = parsed_resume.get("skills", [])
        job_lower = job_description.lower()
        matched = [s for s in skills if s.lower() in job_lower]
        missing = ["TypeScript", "Docker", "Tailwind CSS"] # Static sample missing
        
        match_pct = int(min(100, max(45, (len(matched) / (len(matched) + len(missing) + 1)) * 100)))
        ats_score = int(min(100, match_pct + 5))

        return {
            "ats_score": ats_score,
            "match_percentage": match_pct,
            "skills_matched": matched,
            "skills_missing": missing,
            "reasoning": "The applicant shows solid core capability matching standard criteria. Main improvements include adding system engineering tags and structural CSS tooling."
        }

    @staticmethod
    def _mock_interview_questions(skills: list, job_title: str) -> list:
        logger.info("Serving mock interview questions")
        return [
            f"Can you explain your experience building applications as a {job_title} using {skills[0] if skills else 'React'}?",
            "How do you optimize React component rendering and manage complex application state?",
            "Describe a time you encountered a tricky backend error (e.g., in Node.js/Express) and how you debugged it."
        ]

    @staticmethod
    def _mock_evaluate_interview(transcript: list) -> dict:
        logger.info("Serving mock interview evaluation")
        detailed_feedback = []
        total_score = 0
        for i, qa in enumerate(transcript):
            score = 75 + (i * 5) % 20
            total_score += score
            detailed_feedback.append({
                "question": qa.get("question", "No question"),
                "answer": qa.get("answer", "No answer"),
                "score": score,
                "feedback": f"Strong conceptual grasp, could elaborate more on practical scenarios."
            })
        
        avg_score = int(total_score / len(transcript)) if transcript else 75

        return {
            "overallScore": avg_score,
            "evaluation": {
                "strengths": ["Clear explanation of component rendering", "Strong understanding of REST standards"],
                "weaknesses": ["Could provide deeper architectural details", "Could speak on database scaling methods"],
                "communicationRating": 8,
                "technicalRating": 7,
                "summary": "The candidate has demonstrated competent mid-level capability. Communication is precise; further depth in system design topics is recommended."
            },
            "detailedFeedback": detailed_feedback
        }
