const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'super_secure_resume_screening_jwt_secret_key_2026_review1';
  return jwt.sign({ id, role }, secret, {
    expiresIn: '7d',
  });
};

/**
 * @desc    Register a new user (Candidate or Recruiter)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'candidate', phone, education, experience, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Role validation: candidates and recruiters only
    const validRole = role === 'recruiter' ? 'recruiter' : 'candidate';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const formattedSkills = Array.isArray(skills)
      ? skills.map((s) => s.trim()).filter(Boolean)
      : skills
      ? String(skills).split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: validRole,
      phone: phone || '',
      education: education || '',
      experience: Number(experience) || 0,
      skills: formattedSkills,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: `${validRole === 'candidate' ? 'Candidate' : 'Recruiter'} registration successful!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        education: user.education,
        experience: user.experience,
        skills: user.skills,
        resumeFile: user.resumeFile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user (Candidate or Recruiter) & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    // Optional portal mismatch check to guide user
    if (portal && portal !== user.role && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `This account is registered as a ${user.role}. Please log in through the ${user.role === 'candidate' ? 'Candidate Portal' : 'Recruiter Portal'}.`,
        role: user.role,
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        education: user.education,
        experience: user.experience,
        skills: user.skills,
        certifications: user.certifications,
        projects: user.projects,
        resumeFile: user.resumeFile,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.passwordHash;
    delete updates.role; // Prevent escalating role via profile update

    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (updates.certifications && typeof updates.certifications === 'string') {
      updates.certifications = updates.certifications.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
