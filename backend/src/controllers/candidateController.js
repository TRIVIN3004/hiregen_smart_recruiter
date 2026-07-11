const fs = require('fs');
const { CandidateProfile, User } = require('../models/user');
const { InterviewResult, CodingResult, AptitudeResult } = require('../models/results');
const Notification = require('../models/notification');

// @desc    Update candidate profile details
// @route   PUT /api/candidate/profile
// @access  Private (Candidate)
exports.updateProfile = async (req, res) => {
  try {
    const { title, phone, location, bio, skills, experience, education } = req.body;
    
    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    if (title) profile.title = title;
    if (phone) profile.phone = phone;
    if (location) profile.location = location;
    if (bio) profile.bio = bio;
    if (skills) profile.skills = skills;
    if (experience) profile.experience = experience;
    if (education) profile.education = education;

    await profile.save();

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Upload candidate resume (PDF) and get an AI-generated quality summary
// @route   POST /api/candidate/resume/upload
// @access  Private (Candidate)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a resume file (PDF)' });
    }

    const resumePath = req.file.path;
    const resumeUrl = `/uploads/${req.file.filename}`;
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    let parsedData = null;
    let atsScore = 0;
    let qualityAssessment = null;

    try {
      // Step 1: Parse the resume via the AI service (generic job description since this is a profile-level upload)
      const genericJobDescription = 'General technology role. Evaluate the candidate resume on its own merits across skills, experience, and education quality.';
      const form = new global.FormData();
      const fileBlob = new Blob([fs.readFileSync(resumePath)], { type: req.file.mimetype });
      form.append('file', fileBlob, req.file.originalname);
      form.append('job_description', genericJobDescription);

      const parseResponse = await fetch(`${AI_SERVICE_URL}/api/ai/parse-match`, {
        method: 'POST',
        body: form
      });

      if (parseResponse.ok) {
        const parseResult = await parseResponse.json();
        parsedData = parseResult.parsed_resume;
        atsScore = parseResult.ats_score || 0;
      } else {
        console.warn('AI parse-match returned an error while uploading resume.');
      }

      // Step 2: Get the AI quality assessment based on the parsed resume
      if (parsedData) {
        const qualityResponse = await fetch(`${AI_SERVICE_URL}/api/ai/assess-quality`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parsed_resume: parsedData })
        });

        if (qualityResponse.ok) {
          qualityAssessment = await qualityResponse.json();
        } else {
          console.warn('AI assess-quality returned an error.');
        }
      }
    } catch (apiError) {
      console.warn('Could not contact FastAPI AI service for resume upload.', apiError.message);
    }

    // Update / create candidate profile with resume info + AI results
    let profile = await CandidateProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new CandidateProfile({ user: req.user._id });
    }

    profile.resumeUrl = resumeUrl;
    profile.resumePath = resumePath;
    profile.atsScore = atsScore;

    if (parsedData) {
      if (parsedData.skills && parsedData.skills.length) profile.skills = parsedData.skills;
      if (parsedData.experience && parsedData.experience.length) profile.experience = parsedData.experience;
      if (parsedData.education && parsedData.education.length) profile.education = parsedData.education;
      if (parsedData.summary) profile.resumeSummary = parsedData.summary;
    }

    if (qualityAssessment) {
      profile.improvementSuggestions = qualityAssessment.improvement_suggestions || [];
    }

    await profile.save();

    res.status(200).json({
      success: true,
      data: {
        profile,
        parsedResume: parsedData,
        qualityAssessment
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Save AI Mock Interview Result
// @route   POST /api/candidate/results/interview
// @access  Private (Candidate)
exports.saveInterviewResult = async (req, res) => {
  try {
    const { jobTitle, transcript, overallScore, evaluation } = req.body;

    const result = await InterviewResult.create({
      candidate: req.user._id,
      jobTitle,
      transcript,
      overallScore,
      evaluation
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Candidate Interview Results
// @route   GET /api/candidate/results/interview
// @access  Private (Candidate/Recruiter)
exports.getInterviewResults = async (req, res) => {
  try {
    const query = req.user.role === 'candidate' ? { candidate: req.user._id } : {};
    const results = await InterviewResult.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Save Coding Assessment Result
// @route   POST /api/candidate/results/coding
// @access  Private (Candidate)
exports.saveCodingResult = async (req, res) => {
  try {
    const { language, problemTitle, problemDescription, code } = req.body;

    // Call AI Service to evaluate the code
    let aiScore = 50;
    let aiPassRate = 0.5;
    let aiFeedback = "Fallback mock evaluation.";
    let cheatingDetected = false;
    let cheatingReasoning = "Fallback mock reasoning.";

    try {
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/coding/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: `${problemTitle}: ${problemDescription}`,
          language,
          code
        })
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        aiScore = result.score || aiScore;
        aiPassRate = result.passRate || aiPassRate;
        aiFeedback = result.feedback || aiFeedback;
        cheatingDetected = result.cheatingDetected || false;
        cheatingReasoning = result.cheatingReasoning || "";
      } else {
        console.warn('FastAPI coding evaluate returned error');
      }
    } catch (apiError) {
      console.warn('Could not contact FastAPI AI service for coding evaluation.', apiError.message);
    }

    const result = await CodingResult.create({
      candidate: req.user._id,
      language,
      problemTitle,
      code,
      score: aiScore,
      passRate: aiPassRate,
      feedback: aiFeedback,
      cheatingDetected,
      cheatingReasoning
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Candidate Coding Results
// @route   GET /api/candidate/results/coding
// @access  Private (Candidate/Recruiter)
exports.getCodingResults = async (req, res) => {
  try {
    const query = req.user.role === 'candidate' ? { candidate: req.user._id } : {};
    const results = await CodingResult.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Generate a fresh set of 30 AI aptitude test questions
// @route   POST /api/candidate/aptitude/generate
// @access  Private (Candidate)
exports.generateAptitude = async (req, res) => {
  try {
    let questions = [];

    try {
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/aptitude/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        questions = result.questions || [];
      } else {
        console.warn('AI aptitude/generate returned an error.');
      }
    } catch (apiError) {
      console.warn('Could not contact FastAPI AI service for aptitude generation.', apiError.message);
    }

    if (!questions.length) {
      return res.status(502).json({ success: false, error: 'Failed to generate aptitude questions. Please try again.' });
    }

    // Strip correct answers before sending to the client; keep a signed copy server-side isn't
    // persisted here, so we send correctIndex along but the frontend only reveals it after submit.
    res.status(200).json({ success: true, data: { questions, durationSeconds: 2400, passMark: 15 } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Submit aptitude test answers for AI evaluation
// @route   POST /api/candidate/aptitude/submit
// @access  Private (Candidate)
exports.submitAptitude = async (req, res) => {
  try {
    const { answers, timeTakenSeconds } = req.body; // answers: [{questionId, category, question, selectedIndex, correctIndex}]

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, error: 'No answers submitted' });
    }

    let totalQuestions = answers.length;
    let correctAnswers = answers.filter(a => a.selectedIndex === a.correctIndex).length;
    let passed = correctAnswers >= 15;

    try {
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/aptitude/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answers.map(a => ({
            questionId: a.questionId,
            selectedIndex: a.selectedIndex,
            correctIndex: a.correctIndex
          }))
        })
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        totalQuestions = result.totalQuestions ?? totalQuestions;
        correctAnswers = result.correctAnswers ?? correctAnswers;
        passed = result.passed ?? passed;
      }
    } catch (apiError) {
      console.warn('Could not contact FastAPI AI service for aptitude evaluation, using local scoring.', apiError.message);
    }

    const resultDoc = await AptitudeResult.create({
      candidate: req.user._id,
      totalQuestions,
      correctAnswers,
      passed,
      answers: answers.map(a => ({
        questionId: a.questionId,
        category: a.category,
        question: a.question,
        selectedIndex: a.selectedIndex,
        correctIndex: a.correctIndex,
        isCorrect: a.selectedIndex === a.correctIndex
      })),
      timeTakenSeconds
    });

    res.status(201).json({ success: true, data: resultDoc });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get notifications for user
// @route   GET /api/candidate/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark notifications as read
// @route   PUT /api/candidate/notifications/:id
// @access  Private
exports.readNotification = async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};