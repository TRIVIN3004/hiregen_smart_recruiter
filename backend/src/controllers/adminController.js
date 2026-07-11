const { User, CandidateProfile, RecruiterProfile } = require('../models/user');
const Job = require('../models/job');
const Application = require('../models/application');
const AuditLog = require('../models/auditLog');
const Company = require('../models/company');
const { InterviewResult, CodingResult, AptitudeResult } = require('../models/results');
const Notification = require('../models/notification');
const Announcement = require('../models/announcement');

// Helper to log audit events
const logAuditEvent = async (actorId, action, details) => {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      details
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

// @desc    Get all users (Candidates & Recruiters)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user status / permission
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { role, isVerified } = req.body;
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    
    await user.save();
    
    await logAuditEvent(req.user._id, 'Update User Settings', `Updated User ${user.email} (Verified: ${isVerified}, Role: ${role})`);

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Platform-wide dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin/Recruiter)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const candidateCount = await User.countDocuments({ role: 'candidate' });
    const recruiterCount = await User.countDocuments({ role: 'recruiter' });
    
    const activeJobs = await Job.countDocuments({ status: 'Open' });
    const totalApplications = await Application.countDocuments();
    
    // Calculate hiring funnel counts
    const applied = await Application.countDocuments({ status: 'Applied' });
    const review = await Application.countDocuments({ status: 'Under Review' });
    const interview = await Application.countDocuments({ status: 'Interview Scheduled' });
    const shortlist = await Application.countDocuments({ status: 'Shortlisted' });
    const hired = await Application.countDocuments({ status: 'Hired' });
    const rejected = await Application.countDocuments({ status: 'Rejected' });

    // ATS distribution calculations
    const apps = await Application.find({}, 'atsScore');
    const scoreBuckets = { '0-50': 0, '51-70': 0, '71-85': 0, '86-100': 0 };
    apps.forEach(app => {
      const score = app.atsScore || 0;
      if (score <= 50) scoreBuckets['0-50']++;
      else if (score <= 70) scoreBuckets['51-70']++;
      else if (score <= 85) scoreBuckets['71-85']++;
      else scoreBuckets['86-100']++;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        candidateCount,
        recruiterCount,
        activeJobs,
        totalApplications,
        funnel: { applied, review, interview, shortlist, hired, rejected },
        atsDistribution: scoreBuckets
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Audit Logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().populate('actor', 'name email').sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all candidates with their status and a ranked performance leaderboard
// @route   GET /api/admin/candidates
// @access  Private (Admin)
exports.getCandidatePerformance = async (req, res) => {
  try {
    const candidateUsers = await User.find({ role: 'candidate' }).select('-password').sort({ createdAt: -1 });
    const candidateIds = candidateUsers.map(u => u._id);

    const [profiles, aptitudeAgg, codingAgg, interviewAgg] = await Promise.all([
      CandidateProfile.find({ user: { $in: candidateIds } }),
      // Latest aptitude attempt per candidate
      AptitudeResult.aggregate([
        { $match: { candidate: { $in: candidateIds } } },
        { $sort: { createdAt: -1 } },
        { $group: {
          _id: '$candidate',
          correctAnswers: { $first: '$correctAnswers' },
          totalQuestions: { $first: '$totalQuestions' },
          passed: { $first: '$passed' },
          attempts: { $sum: 1 }
        } }
      ]),
      // Average coding score per candidate
      CodingResult.aggregate([
        { $match: { candidate: { $in: candidateIds } } },
        { $group: {
          _id: '$candidate',
          avgScore: { $avg: '$score' },
          attempts: { $sum: 1 },
          cheatingFlags: { $sum: { $cond: ['$cheatingDetected', 1, 0] } }
        } }
      ]),
      // Average interview score per candidate
      InterviewResult.aggregate([
        { $match: { candidate: { $in: candidateIds } } },
        { $group: {
          _id: '$candidate',
          avgScore: { $avg: '$overallScore' },
          attempts: { $sum: 1 }
        } }
      ])
    ]);

    const profileMap = new Map(profiles.map(p => [p.user.toString(), p]));
    const aptitudeMap = new Map(aptitudeAgg.map(a => [a._id.toString(), a]));
    const codingMap = new Map(codingAgg.map(c => [c._id.toString(), c]));
    const interviewMap = new Map(interviewAgg.map(i => [i._id.toString(), i]));

    let candidates = candidateUsers.map(user => {
      const id = user._id.toString();
      const profile = profileMap.get(id);
      const aptitude = aptitudeMap.get(id);
      const coding = codingMap.get(id);
      const interview = interviewMap.get(id);

      const atsScore = profile?.atsScore || 0;
      const aptitudeScore = aptitude ? (aptitude.correctAnswers / aptitude.totalQuestions) * 100 : null;
      const codingScore = coding ? coding.avgScore : null;
      const interviewScore = interview ? interview.avgScore : null;

      const componentScores = [atsScore > 0 ? atsScore : null, aptitudeScore, codingScore, interviewScore].filter(s => s !== null && s !== undefined);
      const overallScore = componentScores.length > 0
        ? Math.round(componentScores.reduce((sum, s) => sum + s, 0) / componentScores.length)
        : 0;

      const assessmentsCompleted = [aptitude, coding, interview].filter(Boolean).length;
      let status = 'Not Started';
      if (assessmentsCompleted === 3) status = 'Completed';
      else if (assessmentsCompleted > 0) status = 'In Progress';

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        title: profile?.title || 'Software Engineer',
        atsScore,
        aptitude: aptitude ? { correctAnswers: aptitude.correctAnswers, totalQuestions: aptitude.totalQuestions, passed: aptitude.passed, attempts: aptitude.attempts, score: Math.round(aptitudeScore) } : null,
        coding: coding ? { avgScore: Math.round(coding.avgScore), attempts: coding.attempts, cheatingFlags: coding.cheatingFlags } : null,
        interview: interview ? { avgScore: Math.round(interview.avgScore), attempts: interview.attempts } : null,
        overallScore,
        status,
        assessmentsCompleted
      };
    });

    // Sort descending by overall performance score, tie-break by earlier signup
    candidates.sort((a, b) => {
      if (b.overallScore !== a.overallScore) return b.overallScore - a.overallScore;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    // Assign rank order (1st, 2nd, 3rd...)
    candidates = candidates.map((c, idx) => ({ ...c, rank: idx + 1 }));

    res.status(200).json({
      success: true,
      totalCandidates: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send a platform-wide announcement to all candidates (creates a notification for each)
// @route   POST /api/admin/announcements
// @access  Private (Admin)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, error: 'Please provide both a title and a message' });
    }

    const candidates = await User.find({ role: 'candidate' }).select('_id');

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user._id,
      recipientCount: candidates.length
    });

    if (candidates.length > 0) {
      const notifications = candidates.map(c => ({
        recipient: c._id,
        title,
        message,
        type: 'announcement'
      }));
      await Notification.insertMany(notifications);
    }

    await logAuditEvent(req.user._id, 'Send Announcement', `Sent announcement "${title}" to ${candidates.length} candidate(s)`);

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all announcements sent by admins (history)
// @route   GET /api/admin/announcements
// @access  Private (Admin)
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};