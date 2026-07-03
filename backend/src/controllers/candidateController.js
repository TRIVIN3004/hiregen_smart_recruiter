const { CandidateProfile, User } = require('../models/user');
const { InterviewResult, CodingResult } = require('../models/results');
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
    const { language, problemTitle, code, score, passRate, feedback } = req.body;

    const result = await CodingResult.create({
      candidate: req.user._id,
      language,
      problemTitle,
      code,
      score,
      passRate,
      feedback
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
