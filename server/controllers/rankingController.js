const ScreeningResult = require('../models/ScreeningResult');
const Job = require('../models/Job');

/**
 * @desc    Get candidate rankings for a specific job
 * @route   GET /api/rankings/:jobId
 * @access  Private
 */
const getRankingsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const { status, search, sortBy = 'matchScore', order = 'desc' } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id ${jobId}`,
      });
    }

    const sortDirection = order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortBy] = sortDirection;

    const query = { jobId };
    if (status && status !== 'All') {
      query.status = status;
    }

    let results = await ScreeningResult.find(query)
      .populate('candidateId')
      .sort(sortObj)
      .lean();

    // Filter out orphaned candidate references if any
    results = results.filter((r) => r.candidateId);

    // Apply search filter on candidate name, email, or matched skills
    if (search) {
      const q = search.toLowerCase();
      results = results.filter((r) => {
        const cand = r.candidateId;
        const matchesName = cand?.name?.toLowerCase().includes(q);
        const matchesEmail = cand?.email?.toLowerCase().includes(q);
        const matchesSkill = r.matchedSkills?.some((s) => s.toLowerCase().includes(q));
        return matchesName || matchesEmail || matchesSkill;
      });
    }

    // Assign integer ranks 1..N based on sorted position
    const rankedResults = results.map((result, index) => ({
      rank: index + 1,
      ...result,
      candidate: result.candidateId,
    }));

    res.status(200).json({
      success: true,
      job: {
        id: job._id,
        title: job.title,
        department: job.department,
        requiredSkills: job.requiredSkills,
        minimumExperience: job.minimumExperience,
      },
      count: rankedResults.length,
      data: rankedResults,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRankingsForJob,
};
