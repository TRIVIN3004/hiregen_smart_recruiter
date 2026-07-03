const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'recruiter', 'candidate'],
    default: 'candidate'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const candidateProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'Software Engineer'
  },
  phone: String,
  location: String,
  bio: String,
  skills: [String],
  experience: [{
    company: String,
    role: String,
    startDate: String,
    endDate: String,
    description: String,
    current: Boolean
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: String,
    endYear: String
  }],
  resumeUrl: String,
  resumePath: String,
  atsScore: {
    type: Number,
    default: 0
  },
  resumeSummary: String,
  improvementSuggestions: [String]
});

const recruiterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: String,
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  designation: String
});

const User = mongoose.model('User', userSchema);
const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);
const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);

module.exports = { User, CandidateProfile, RecruiterProfile };
