const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const ScreeningResult = require('../models/ScreeningResult');
const { calculateScreeningScore } = require('../services/scoringService');

/**
 * @desc    Execute rule-based screening engine for all candidates under a job
 * @route   POST /api/screening/:jobId
 * @access  Private
 */
const startScreeningForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id ${jobId}`,
      });
    }

    const candidates = await Candidate.find({ jobId });

    if (candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No candidates found for this job. Please upload or register candidates before running screening.',
      });
    }

    const results = [];

    for (const candidate of candidates) {
      // Execute rule-based screening algorithm
      const scoreData = calculateScreeningScore(candidate, job);

      // Upsert ScreeningResult in MongoDB
      const savedResult = await ScreeningResult.findOneAndUpdate(
        { jobId: job._id, candidateId: candidate._id },
        {
          jobId: job._id,
          candidateId: candidate._id,
          matchScore: scoreData.matchScore,
          matchedSkills: scoreData.matchedSkills,
          missingSkills: scoreData.missingSkills,
          skillsScore: scoreData.skillsScore,
          experienceScore: scoreData.experienceScore,
          educationScore: scoreData.educationScore,
          certificationScore: scoreData.certificationScore,
          projectScore: scoreData.projectScore,
          explanation: scoreData.explanation,
          strengths: scoreData.strengths,
          skillGaps: scoreData.skillGaps,
          recommendation: scoreData.recommendation,
          status: candidate.status || 'Under Review',
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).populate('candidateId');

      results.push(savedResult);
    }

    // Sort results descending by matchScore
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      success: true,
      message: `Screening completed successfully for ${results.length} candidate(s).`,
      job: {
        id: job._id,
        title: job.title,
        department: job.department,
        description: job.description,
        requiredSkills: job.requiredSkills,
        minimumExperience: job.minimumExperience,
        education: job.education,
      },
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get stored screening results for a specific job
 * @route   GET /api/screening/:jobId
 * @access  Private
 */
const getScreeningResultsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id ${jobId}`,
      });
    }

    const results = await ScreeningResult.find({ jobId })
      .populate('candidateId')
      .sort({ matchScore: -1 });

    res.status(200).json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        department: job.department,
        description: job.description,
        requiredSkills: job.requiredSkills,
        minimumExperience: job.minimumExperience,
        education: job.education,
      },
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startScreeningForJob,
  getScreeningResultsForJob,
};
