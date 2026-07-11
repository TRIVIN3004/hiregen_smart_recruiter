const mongoose = require('mongoose');

const interviewResultSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  transcript: [{
    question: String,
    answer: String,
    score: Number,
    feedback: String
  }],
  overallScore: {
    type: Number,
    required: true
  },
  evaluation: {
    strengths: [String],
    weaknesses: [String],
    communicationRating: Number,
    technicalRating: Number,
    summary: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const codingResultSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    required: true
  },
  problemTitle: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  passRate: {
    type: Number, // e.g. 0.8 for 80% test cases passed
    required: true
  },
  feedback: String,
  cheatingDetected: {
    type: Boolean,
    default: false
  },
  cheatingReasoning: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const aptitudeResultSchema = new mongoose.Schema({
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 30
  },
  correctAnswers: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: [{
    questionId: Number,
    category: String,
    question: String,
    selectedIndex: Number,
    correctIndex: Number,
    isCorrect: Boolean
  }],
  timeTakenSeconds: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const InterviewResult = mongoose.model('InterviewResult', interviewResultSchema);
const CodingResult = mongoose.model('CodingResult', codingResultSchema);
const AptitudeResult = mongoose.model('AptitudeResult', aptitudeResultSchema);

module.exports = { InterviewResult, CodingResult, AptitudeResult };