const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const ScreeningResult = require('../models/ScreeningResult');

/**
 * @desc    Get complete database persistence audit & collections overview
 * @route   GET /api/database
 * @access  Private
 */
const getDatabaseOverview = async (req, res, next) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    // Database connection details
    const dbInfo = {
      status: isConnected ? 'Connected' : 'Disconnected',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || 'Unknown',
      port: mongoose.connection.port || 27017,
      name: mongoose.connection.name || 'resume_screening_db',
      timestamp: new Date().toISOString(),
    };

    // Collection counts
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    const candidateCount = await Candidate.countDocuments();
    const screeningResultCount = await ScreeningResult.countDocuments();

    // Fetch actual documents for inspection (safely stripping passwords)
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const jobs = await Job.find()
      .sort({ createdAt: -1 })
      .lean();

    const candidates = await Candidate.find()
      .populate('jobId', 'title department')
      .sort({ createdAt: -1 })
      .lean();

    const screeningResults = await ScreeningResult.find()
      .populate('jobId', 'title')
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      database: dbInfo,
      counts: {
        users: userCount,
        jobs: jobCount,
        candidates: candidateCount,
        screeningResults: screeningResultCount,
        totalDocuments: userCount + jobCount + candidateCount + screeningResultCount,
      },
      collections: {
        users,
        jobs,
        candidates,
        screeningResults,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDatabaseOverview,
};
