import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import parser_routes

app = FastAPI(
    title="HireGen AI Core Service",
    description="Python FastAPI service powered by Google Gemini for resume extraction, ATS scoring, and interview simulations.",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach router
app.include_router(parser_routes.router)

@app.get("/")
def read_root():
    return {
        "service": "HireGen AI Backend Engine",
        "status": "Online",
        "features": ["Resume Parsing", "ATS Scoring", "Interview Simulation"]
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
