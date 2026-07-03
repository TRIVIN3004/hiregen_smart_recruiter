const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Interview Scheduled', 'Shortlisted', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  atsScore: {
    type: Number,
    default: 0
  },
  matchPercentage: {
    type: Number,
    default: 0
  },
  matchAnalysis: {
    skillsMatched: [String],
    skillsMissing: [String],
    reasoning: String
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Application', applicationSchema);
