const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const ScreeningResult = require('../models/ScreeningResult');

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const resumesScreened = await ScreeningResult.countDocuments();
    const shortlistedCandidates = await Candidate.countDocuments({ status: 'Shortlisted' });

    // Recent activities (combine latest jobs and candidate creations)
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const recentCandidates = await Candidate.find()
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    const activities = [
      ...recentJobs.map((j) => ({
        id: j._id,
        type: 'JOB_CREATED',
        message: `New job requisition opened: "${j.title}" in ${j.department}`,
        timestamp: j.createdAt,
      })),
      ...recentCandidates.map((c) => ({
        id: c._id,
        type: 'CANDIDATE_ADDED',
        message: `Candidate ${c.name} applied for "${c.jobId?.title || 'Job'}" (${c.status})`,
        timestamp: c.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalCandidates,
        resumesScreened,
        shortlistedCandidates,
        recentActivities: activities,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard charts data (score distribution, job-wise candidates, status breakdown)
 * @route   GET /api/dashboard/charts
 * @access  Private
 */
const getCharts = async (req, res, next) => {
  try {
    // 1. Score Distribution (Buckets: 0-40, 41-60, 61-80, 81-100)
    const screeningResults = await ScreeningResult.find().select('matchScore').lean();

    const scoreBuckets = [
      { range: '0-40% (Low)', count: 0, fill: '#ef4444' },
      { range: '41-60% (Borderline)', count: 0, fill: '#f59e0b' },
      { range: '61-80% (Moderate)', count: 0, fill: '#3b82f6' },
      { range: '81-100% (High)', count: 0, fill: '#10b981' },
    ];

    screeningResults.forEach((r) => {
      const s = r.matchScore;
      if (s <= 40) scoreBuckets[0].count++;
      else if (s <= 60) scoreBuckets[1].count++;
      else if (s <= 80) scoreBuckets[2].count++;
      else scoreBuckets[3].count++;
    });

    // 2. Job-wise candidate count
    const jobs = await Job.find().select('title').lean();
    const jobCandidatesData = await Promise.all(
      jobs.map(async (job) => {
        const count = await Candidate.countDocuments({ jobId: job._id });
        const screened = await ScreeningResult.countDocuments({ jobId: job._id });
        return {
          jobId: job._id,
          name: job.title.length > 20 ? job.title.substring(0, 18) + '...' : job.title,
          fullTitle: job.title,
          candidates: count,
          screened: screened,
        };
      })
    );

    // 3. Candidate Status Breakdown (Shortlisted vs Rejected vs Review vs New)
    const statusCounts = await Candidate.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = {
      New: { name: 'New', count: 0, color: '#6366f1' },
      'Under Review': { name: 'Under Review', count: 0, color: '#f59e0b' },
      Shortlisted: { name: 'Shortlisted', count: 0, color: '#10b981' },
      Rejected: { name: 'Rejected', count: 0, color: '#ef4444' },
    };

    statusCounts.forEach((sc) => {
      if (statusMap[sc._id]) {
        statusMap[sc._id].count = sc.count;
      }
    });

    const statusDistribution = Object.values(statusMap);

    res.status(200).json({
      success: true,
      data: {
        scoreDistribution: scoreBuckets,
        jobCandidates: jobCandidatesData,
        statusDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getCharts,
};
