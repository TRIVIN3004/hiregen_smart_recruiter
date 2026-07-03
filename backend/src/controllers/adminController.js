const { User, CandidateProfile, RecruiterProfile } = require('../models/user');
const Job = require('../models/job');
const Application = require('../models/application');
const AuditLog = require('../models/auditLog');
const Company = require('../models/company');

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
