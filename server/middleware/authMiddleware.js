const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in first.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secure_resume_screening_jwt_secret_key_2026_review1';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token. Please log in again.',
      error: error.message,
    });
  }
};

/**
 * Middleware restricting route access to Recruiters and Admins
 */
const requireRecruiter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'recruiter' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Recruiter privileges are required to access this resource.',
    });
  }

  next();
};

/**
 * Middleware restricting route access to Candidates
 */
const requireCandidate = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'candidate' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Candidate account required for this resource.',
    });
  }

  next();
};

module.exports = {
  protect,
  requireRecruiter,
  requireCandidate,
};
