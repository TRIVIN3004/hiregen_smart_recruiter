const aiController = require('../controllers/aiController');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

// Controllers
const authController = require('../controllers/authController');
const jobController = require('../controllers/jobController');
const adminController = require('../controllers/adminController');
const candidateController = require('../controllers/candidateController');

// --- Auth Routes ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', protect, authController.getMe);
router.get('/auth/verify/:token', authController.verifyEmail);
router.post('/auth/forgotpassword', authController.forgotPassword);
router.put('/auth/resetpassword/:token', authController.resetPassword);

// --- Job Routes ---
router.get('/jobs', jobController.getJobs);
router.get('/jobs/:id', jobController.getJob);
router.post('/jobs', protect, authorize('recruiter', 'admin'), jobController.createJob);
router.put('/jobs/:id', protect, authorize('recruiter', 'admin'), jobController.updateJob);
router.delete('/jobs/:id', protect, authorize('recruiter', 'admin'), jobController.deleteJob);
router.post('/jobs/:id/apply', protect, authorize('candidate'), upload.single('file'), jobController.applyJob);

// --- Application Routes ---
router.get('/applications', protect, jobController.getApplications);
router.put('/applications/:id', protect, authorize('recruiter', 'admin'), jobController.updateApplicationStatus);

// --- Candidate Assessment & Profile Routes ---
router.put('/candidate/profile', protect, authorize('candidate'), candidateController.updateProfile);
router.post('/candidate/resume/upload', protect, authorize('candidate'), upload.single('file'), candidateController.uploadResume);
router.post('/candidate/results/interview', protect, authorize('candidate'), candidateController.saveInterviewResult);
router.get('/candidate/results/interview', protect, candidateController.getInterviewResults);
router.post('/candidate/results/coding', protect, authorize('candidate'), candidateController.saveCodingResult);
router.get('/candidate/results/coding', protect, candidateController.getCodingResults);
router.post('/candidate/aptitude/generate', protect, authorize('candidate'), candidateController.generateAptitude);
router.post('/candidate/aptitude/submit', protect, authorize('candidate'), candidateController.submitAptitude);
router.get('/candidate/notifications', protect, candidateController.getNotifications);
router.put('/candidate/notifications/:id', protect, candidateController.readNotification);

// --- Admin Control Routes ---
router.get('/admin/users', protect, authorize('admin'), adminController.getUsers);
router.put('/admin/users/:id', protect, authorize('admin'), adminController.updateUser);
router.get('/admin/stats', protect, authorize('admin', 'recruiter'), adminController.getStats);
router.get('/admin/logs', protect, authorize('admin'), adminController.getAuditLogs);
router.get('/admin/candidates', protect, authorize('admin'), adminController.getCandidatePerformance);
router.post('/admin/announcements', protect, authorize('admin'), adminController.createAnnouncement);
router.get('/admin/announcements', protect, authorize('admin'), adminController.getAnnouncements);

// AI Assistant
router.post('/chat', aiController.chat);

module.exports = router;