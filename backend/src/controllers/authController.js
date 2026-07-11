const jwt = require('jsonwebtoken');
const { User, CandidateProfile, RecruiterProfile } = require('../models/user');
const crypto = require('crypto');

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_here', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Only candidate and admin roles may self-register through this platform
    const allowedRoles = ['candidate', 'admin'];
    const resolvedRole = allowedRoles.includes(role) ? role : 'candidate';

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Create user
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const user = await User.create({
      name,
      email,
      password,
      role: resolvedRole,
      isVerified: false,
      verificationToken
    });

    // Scaffold Profile depending on role
    if (user.role === 'candidate') {
      await CandidateProfile.create({
        user: user._id,
        skills: [],
        experience: [],
        education: []
      });
    } else if (user.role === 'recruiter') {
      await RecruiterProfile.create({
        user: user._id,
        designation: 'Recruiting Officer'
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      message: `Registration successful. Verify token sent: ${verificationToken}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Find User
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check Password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Fetch profile details
    let profile = null;
    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id }).populate('company');
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;
    
    if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id }).populate('company');
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email successfully verified' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Forgot Password Mock
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found with that email' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset token generated: ${resetToken}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Reset Password Mock
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};