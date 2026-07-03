const Job = require('../models/job');
const Application = require('../models/application');
const { CandidateProfile } = require('../models/user');
const Company = require('../models/company');
const Notification = require('../models/notification');
const fs = require('fs');
const path = require('path');

// Helper to notify candidates
const createNotification = async (recipientId, title, message, type = 'info') => {
  try {
    await Notification.create({
      recipient: recipientId,
      title,
      message,
      type
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
exports.createJob = async (req, res) => {
  try {
    const { title, companyId, description, requirements, skills, experience, location, salary, type } = req.body;

    let company = companyId;
    if (!company) {
      // Find company linked to recruiter
      const { RecruiterProfile } = require('../models/user');
      const recProfile = await RecruiterProfile.findOne({ user: req.user._id });
      company = recProfile ? recProfile.company : null;
    }

    if (!company) {
      // If recruiter doesn't have a company, check if one exists or create a default demo company
      let demoCompany = await Company.findOne({ name: 'Default Company' });
      if (!demoCompany) {
        demoCompany = await Company.create({
          name: 'Default Company',
          website: 'https://example.com',
          industry: 'Technology',
          size: '1-10',
          location: 'Remote',
          description: 'Demo recruiter company'
        });
      }
      company = demoCompany._id;
    }

    const job = await Job.create({
      title,
      company,
      recruiter: req.user._id,
      description,
      requirements: requirements || [],
      skills: skills || [],
      experience,
      location,
      salary: salary || 'Competitive',
      type: type || 'Full-time'
    });

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all jobs (with query filters)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
  try {
    const { search, location, type, experience } = req.query;
    
    let query = { status: 'Open' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (experience) {
      query.experience = experience;
    }

    const jobs = await Job.find(query).populate('company', 'name location logoUrl description website');

    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name location logoUrl description website size industry')
      .populate('recruiter', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Verify ownership
    if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.status(200).json({ success: true, message: 'Job successfully deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Apply for a job with resume file upload
// @route   POST /api/jobs/:id/apply
// @access  Private (Candidate)
exports.applyJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company');
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Check if candidate already applied
    const alreadyApplied = await Application.findOne({
      job: job._id,
      candidate: req.user._id
    });

    if (alreadyApplied) {
      return res.status(400).json({ success: false, error: 'You have already applied for this job' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a resume file (PDF/DOCX)' });
    }

    const resumePath = req.file.path;
    const resumeUrl = `/uploads/${req.file.filename}`;

    // Read file and parse/match through FastAPI AI Service
    let matchAnalysis = {
      skillsMatched: [],
      skillsMissing: [],
      reasoning: "Local mock processing completed. Connected to local database tracker."
    };
    let atsScore = 75;
    let matchPercentage = 70;
    let parsedData = null;

    try {
      const { FormData } = require('multer');
      // Native Node fetch using multipart form data
      const fsModule = require('fs');
      const fileStream = fsModule.createReadStream(resumePath);
      
      // Construct form data manually to support native Node fetch
      // Or send direct buffer and headers
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      
      const form = new global.FormData();
      const fileBlob = new Blob([fs.readFileSync(resumePath)], { type: req.file.mimetype });
      form.append('file', fileBlob, req.file.originalname);
      form.append('job_description', `${job.title} at ${job.company.name}. Job details: ${job.description}. Requirements: ${job.requirements.join(', ')}. Skills: ${job.skills.join(', ')}`);

      console.log(`Sending resume to FastAPI: ${AI_SERVICE_URL}/api/ai/parse-match`);
      
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/ai/parse-match`, {
        method: 'POST',
        body: form
      });

      if (aiResponse.ok) {
        const result = await aiResponse.json();
        parsedData = result.parsed_resume;
        atsScore = result.ats_score || 75;
        matchPercentage = result.match_percentage || 70;
        matchAnalysis = {
          skillsMatched: result.skills_matched || [],
          skillsMissing: result.skills_missing || [],
          reasoning: result.reasoning || 'Successfully evaluated by Gemini.'
        };
      } else {
        console.warn('FastAPI service returned error, using fallback evaluation');
      }
    } catch (apiError) {
      console.warn('Could not contact FastAPI AI service. Falling back to base score calculation.', apiError.message);
      // Fallback skill checker
      const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });
      if (candidateProfile && candidateProfile.skills.length > 0) {
        const matched = candidateProfile.skills.filter(s => 
          job.skills.some(js => js.toLowerCase().includes(s.toLowerCase()))
        );
        const missing = job.skills.filter(js => 
          !candidateProfile.skills.some(s => s.toLowerCase().includes(js.toLowerCase()))
        );
        matchPercentage = Math.round((matched.length / Math.max(job.skills.length, 1)) * 100) || 60;
        atsScore = Math.min(100, 50 + matchPercentage / 2);
        matchAnalysis = {
          skillsMatched: matched,
          skillsMissing: missing,
          reasoning: "Fallback parsing utilized. Connect FastAPI and supply a GEMINI_API_KEY for deep AI evaluations."
        };
      }
    }

    // Update candidate profile
    const profile = await CandidateProfile.findOne({ user: req.user._id });
    if (profile) {
      profile.resumePath = resumePath;
      profile.resumeUrl = resumeUrl;
      profile.atsScore = atsScore;
      if (parsedData) {
        profile.resumeSummary = parsedData.summary || profile.resumeSummary;
        profile.improvementSuggestions = parsedData.improvement_suggestions || profile.improvementSuggestions;
        if (parsedData.skills && parsedData.skills.length > 0) {
          profile.skills = Array.from(new Set([...profile.skills, ...parsedData.skills]));
        }
      }
      await profile.save();
    }

    // Create Application
    const application = await Application.create({
      job: job._id,
      candidate: req.user._id,
      atsScore,
      matchPercentage,
      matchAnalysis,
      status: 'Applied'
    });

    await createNotification(
      req.user._id,
      'Application Submitted',
      `Your application for ${job.title} at ${job.company.name} has been submitted successfully! ATS Score: ${atsScore}%`,
      'application'
    );

    // Notify recruiter
    await createNotification(
      job.recruiter,
      'New Applicant',
      `${req.user.name} applied for ${job.title} with a match percentage of ${matchPercentage}%`,
      'application'
    );

    res.status(201).json({
      success: true,
      message: 'Applied successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get applications (For Candidates to see theirs, or Recruiters/Admins to see job applicants)
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res) => {
  try {
    let applications;

    if (req.user.role === 'candidate') {
      applications = await Application.find({ candidate: req.user._id })
        .populate({
          path: 'job',
          populate: { path: 'company', select: 'name logoUrl location' }
        });
    } else if (req.user.role === 'recruiter') {
      // Find jobs posted by this recruiter
      const jobs = await Job.find({ recruiter: req.user._id });
      const jobIds = jobs.map(j => j._id);
      
      applications = await Application.find({ job: { $in: jobIds } })
        .populate('candidate', 'name email')
        .populate('job', 'title location');
    } else {
      // Admin gets all
      applications = await Application.find()
        .populate('candidate', 'name email')
        .populate({
          path: 'job',
          populate: { path: 'company', select: 'name' }
        });
    }

    res.status(200).json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Recruiter/Admin)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let application = await Application.findById(req.params.id)
      .populate('candidate')
      .populate({
        path: 'job',
        populate: { path: 'company' }
      });

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Verify ownership
    if (application.job.recruiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to modify this application' });
    }

    application.status = status;
    await application.save();

    // Notify candidate
    await createNotification(
      application.candidate._id,
      'Application Update',
      `Your application for ${application.job.title} at ${application.job.company.name} status is now: ${status}`,
      status === 'Interview Scheduled' ? 'interview' : 'application'
    );

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
