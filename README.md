# HireGen AI - Smart AI Recruitment Platform

HireGen AI is a production-ready, modern full-stack recruitment platform that automates candidate screening using Google Gemini AI. The platform supports separate dashboards for candidates, recruiters, and admins.

## Core Features

*   **AI Resume Parser**: Automated extraction of skills, experience, and education histories from PDFs.
*   **ATS Score Compatibility**: Compute score alignment percentages against targeted job postings.
*   **Conversational AI Mock Interview**: Practice speech and chat questions with detailed reviews.
*   **Interactive Coding Sandbox**: Complete programming exercises (JavaScript, Python, C++, Go) with checking metrics.
*   **Recruiter Boards**: View charts representing application funnels and candidate rankings.
*   **Administration Control Console**: Modify prompt templates, track audit event streams, and update user roles.

---

## Folder Architecture

```text
├── backend/                  # Node.js + Express.js API service
├── ai-service/               # Python FastAPI + Gemini parser engine
├── frontend/                 # React + Tailwind CSS client
├── docker-compose.yml        # Multi-container local orchestra
└── README.md                 # Setup and run manual (this file)
```

---

## Environment Configuration

### Backend config (`backend/.env`)

```text
PORT=5000
MONGO_URI=mongodb://localhost:27017/hiregen
JWT_SECRET=super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8000
```

### AI-Service config (`ai-service/.env`)

```text
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
HOST=0.0.0.0
```

---

## Running the Platform

### Method 1: Docker Compose (Quickest)

1.  Make sure Docker Desktop is installed and active on your system.
2.  Set your `GEMINI_API_KEY` in `ai-service/.env` or export it in your shell environment.
3.  Run this command in the project root folder:
    ```bash
    docker-compose up --build
    ```
4.  Open the application at `http://localhost:3000`.

### Method 2: Local Manual Setup

#### 1. Setup Database
Ensure local **MongoDB** is running on your computer at `mongodb://localhost:27017/hiregen` (default).

#### 2. Run Python AI Service
1.  Navigate to `/ai-service`
2.  Create virtual environment and activate:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run FastAPI:
    ```bash
    python app/main.py
    ```

#### 3. Run Node.js Backend API
1.  Navigate to `/backend`
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start server:
    ```bash
    npm start
    ```

#### 4. Run React Client
1.  Navigate to `/frontend`
2.  Install packages:
    ```bash
    npm install
    ```
3.  Run Dev server:
    ```bash
    npm run dev
    ```
4.  Open browser at `http://localhost:3000`.
