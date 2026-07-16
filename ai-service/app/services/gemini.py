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

    @classmethod
    def generate_aptitude_questions(cls) -> list:
        if use_fallback:
            return cls._mock_aptitude_questions()

        prompt = """
        Generate 30 multiple choice aptitude questions for a recruitment assessment.
        Provide a mixture of:
        - 10 Quantitative Aptitude questions
        - 10 Logical Reasoning questions
        - 10 Verbal Ability questions

        Return the result strictly as a JSON object containing a "questions" array matching this schema:
        {
            "questions": [
                {
                    "id": "q_1",
                    "category": "Quantitative",
                    "question": "Question text?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctIndex": 0
                }
            ]
        }
        Do not add any markdown formatting, prefix, or suffix text. Just return raw JSON.
        """
        try:
            raw_response = cls._call_llm(prompt)
            parsed = json.loads(raw_response)
            questions = parsed.get("questions", [])
            if len(questions) > 0:
                # Ensure all questions have correct format
                for idx, q in enumerate(questions):
                    if not q.get("id"):
                        q["id"] = f"q_{idx+1}"
                return questions
            return cls._mock_aptitude_questions()
        except Exception as e:
            logger.error(f"Failed to generate aptitude questions dynamically: {e}")
            return cls._mock_aptitude_questions()

    @classmethod
    def evaluate_aptitude_test(cls, answers: list) -> dict:
        total_questions = len(answers)
        correct_answers = 0
        for ans in answers:
            selected = ans.get("selectedIndex")
            correct = ans.get("correctIndex")
            if selected is not None and selected == correct:
                correct_answers += 1
        
        passed = correct_answers >= 15
        return {
            "totalQuestions": total_questions,
            "correctAnswers": correct_answers,
            "passed": passed
        }

    @staticmethod
    def _mock_aptitude_questions() -> list:
        return [
            {
                "id": "mock_q1",
                "category": "Quantitative",
                "question": "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
                "options": ["120 metres", "150 metres", "324 metres", "180 metres"],
                "correctIndex": 1
            },
            {
                "id": "mock_q2",
                "category": "Quantitative",
                "question": "The average of 20 numbers is zero. Of them, at the most, how many may be greater than zero?",
                "options": ["0", "1", "10", "19"],
                "correctIndex": 3
            },
            {
                "id": "mock_q3",
                "category": "Quantitative",
                "question": "A sum of money at simple interest amounts to Rs. 815 in 3 years and to Rs. 854 in 4 years. The sum is:",
                "options": ["Rs. 650", "Rs. 690", "Rs. 698", "Rs. 700"],
                "correctIndex": 2
            },
            {
                "id": "mock_q4",
                "category": "Quantitative",
                "question": "A, B and C can do a piece of work in 20, 30 and 60 days respectively. In how many days can A do the work if he is assisted by B and C on every third day?",
                "options": ["12 days", "15 days", "16 days", "18 days"],
                "correctIndex": 1
            },
            {
                "id": "mock_q5",
                "category": "Quantitative",
                "question": "If 20% of a = b, then b% of 20 is the same as:",
                "options": ["4% of a", "5% of a", "20% of a", "None of these"],
                "correctIndex": 0
            },
            {
                "id": "mock_q6",
                "category": "Quantitative",
                "question": "A fruit seller had some apples. He sells 40% apples and still has 420 apples. Originally, he had:",
                "options": ["588 apples", "600 apples", "672 apples", "700 apples"],
                "correctIndex": 3
            },
            {
                "id": "mock_q7",
                "category": "Quantitative",
                "question": "Find the greatest number that will divide 43, 91 and 183 so as to leave the same remainder in each case.",
                "options": ["4", "7", "9", "13"],
                "correctIndex": 0
            },
            {
                "id": "mock_q8",
                "category": "Quantitative",
                "question": "The H.C.F. of two numbers is 11 and their L.C.M. is 7700. If one of the numbers is 275, then the other is:",
                "options": ["279", "283", "308", "318"],
                "correctIndex": 2
            },
            {
                "id": "mock_q9",
                "category": "Quantitative",
                "question": "A grocer has a sale of Rs. 6435, Rs. 6927, Rs. 6855, Rs. 7230 and Rs. 6562 for 5 consecutive months. How much sale must he have in the sixth month so that he gets an average sale of Rs. 6500?",
                "options": ["Rs. 4991", "Rs. 5991", "Rs. 6001", "Rs. 6991"],
                "correctIndex": 0
            },
            {
                "id": "mock_q10",
                "category": "Quantitative",
                "question": "A is two years older than B who is twice as old as C. If the total of the ages of A, B and C be 27, then how old is B?",
                "options": ["7", "8", "9", "10"],
                "correctIndex": 3
            },
            {
                "id": "mock_q11",
                "category": "Logical Reasoning",
                "question": "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
                "options": ["(1/3)", "(1/8)", "(2/8)", "(1/16)"],
                "correctIndex": 1
            },
            {
                "id": "mock_q12",
                "category": "Logical Reasoning",
                "question": "Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?",
                "options": ["7", "10", "12", "13"],
                "correctIndex": 1
            },
            {
                "id": "mock_q13",
                "category": "Logical Reasoning",
                "question": "Look at this series: 36, 34, 30, 28, 24, ... What number should come next?",
                "options": ["20", "22", "23", "26"],
                "correctIndex": 1
            },
            {
                "id": "mock_q14",
                "category": "Logical Reasoning",
                "question": "Look at this series: 53, 53, 40, 40, 27, 27, ... What number should come next?",
                "options": ["12", "14", "27", "53"],
                "correctIndex": 1
            },
            {
                "id": "mock_q15",
                "category": "Logical Reasoning",
                "question": "Look at this series: 21, 9, 21, 11, 21, 13, 21, ... What number should come next?",
                "options": ["14", "15", "21", "25"],
                "correctIndex": 1
            },
            {
                "id": "mock_q16",
                "category": "Logical Reasoning",
                "question": "Which word does NOT belong with the others?",
                "options": ["parsley", "basil", "dill", "mayonnaise"],
                "correctIndex": 3
            },
            {
                "id": "mock_q17",
                "category": "Logical Reasoning",
                "question": "Which word does NOT belong with the others?",
                "options": ["tulip", "rose", "bud", "daisy"],
                "correctIndex": 2
            },
            {
                "id": "mock_q18",
                "category": "Logical Reasoning",
                "question": "Which word does NOT belong with the others?",
                "options": ["guitar", "violin", "flute", "cello"],
                "correctIndex": 2
            },
            {
                "id": "mock_q19",
                "category": "Logical Reasoning",
                "question": "Which word does NOT belong with the others?",
                "options": ["dodge", "flee", "duck", "avoid"],
                "correctIndex": 1
            },
            {
                "id": "mock_q20",
                "category": "Logical Reasoning",
                "question": "Which word does NOT belong with the others?",
                "options": ["branch", "dirt", "leaf", "root"],
                "correctIndex": 1
            },
            {
                "id": "mock_q21",
                "category": "Verbal",
                "question": "Find the synonym of 'ABANDON':",
                "options": ["Retain", "Forsake", "Keep", "Cherish"],
                "correctIndex": 1
            },
            {
                "id": "mock_q22",
                "category": "Verbal",
                "question": "Find the synonym of 'BENEFACTOR':",
                "options": ["Helper", "Opponent", "Rival", "Enemy"],
                "correctIndex": 0
            },
            {
                "id": "mock_q23",
                "category": "Verbal",
                "question": "Find the antonym of 'ARTIFICIAL':",
                "options": ["Synthetic", "Natural", "Bogus", "Unnatural"],
                "correctIndex": 1
            },
            {
                "id": "mock_q24",
                "category": "Verbal",
                "question": "Find the antonym of 'EXPAND':",
                "options": ["Grow", "Stretch", "Shrink", "Inflate"],
                "correctIndex": 2
            },
            {
                "id": "mock_q25",
                "category": "Verbal",
                "question": "Choose the word that is correctly spelled:",
                "options": ["Accomodate", "Acommodate", "Accommodate", "Acomodate"],
                "correctIndex": 2
            },
            {
                "id": "mock_q26",
                "category": "Verbal",
                "question": "Choose the word that is correctly spelled:",
                "options": ["Receive", "Recieve", "Receve", "Reiceve"],
                "correctIndex": 0
            },
            {
                "id": "mock_q27",
                "category": "Verbal",
                "question": "Complete the sentence: 'The committee _______ unable to reach a consensus.'",
                "options": ["was", "were", "has", "have"],
                "correctIndex": 0
            },
            {
                "id": "mock_q28",
                "category": "Verbal",
                "question": "Neither of the candidates _______ suitable for the job.",
                "options": ["are", "is", "were", "been"],
                "correctIndex": 1
            },
            {
                "id": "mock_q29",
                "category": "Verbal",
                "question": "Find the synonym of 'GENEROUS':",
                "options": ["Selfish", "Magnanimous", "Stingy", "Mean"],
                "correctIndex": 1
            },
            {
                "id": "mock_q30",
                "category": "Verbal",
                "question": "Complete the analogy: 'Scribble is to Write as Stammer is to _______'",
                "options": ["Walk", "Speak", "Play", "Sleep"],
                "correctIndex": 1
            }
        ]
