const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const ScreeningResult = require('../models/ScreeningResult');

/**
 * @desc    Get all jobs with candidate counts
 * @route   GET /api/jobs
 * @access  Private
 */
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();

    // Attach candidate counts to each job
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const candidateCount = await Candidate.countDocuments({ jobId: job._id });
        const screenedCount = await ScreeningResult.countDocuments({ jobId: job._id });
        return {
          ...job,
          candidateCount,
          screenedCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithCounts.length,
      data: jobsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new job
 * @route   POST /api/jobs
 * @access  Private
 */
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      department,
      description,
      requiredSkills,
      preferredSkills,
      minimumExperience,
      education,
      status,
    } = req.body;

    if (!title || !department || !description || !requiredSkills || !education) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, department, description, required skills, education).',
      });
    }

    // Format skills if sent as comma-separated string
    const formattedRequiredSkills = Array.isArray(requiredSkills)
      ? requiredSkills.map((s) => s.trim()).filter(Boolean)
      : String(requiredSkills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const formattedPreferredSkills = Array.isArray(preferredSkills)
      ? preferredSkills.map((s) => s.trim()).filter(Boolean)
      : preferredSkills
      ? String(preferredSkills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const job = await Job.create({
      title,
      department,
      description,
      requiredSkills: formattedRequiredSkills,
      preferredSkills: formattedPreferredSkills,
      minimumExperience: Number(minimumExperience) || 0,
      education,
      status: status || 'Active',
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single job by ID with candidate statistics
 * @route   GET /api/jobs/:id
 * @access  Private
 */
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id ${req.params.id}`,
      });
    }

    const candidateCount = await Candidate.countDocuments({ jobId: job._id });
    const screenedCount = await ScreeningResult.countDocuments({ jobId: job._id });

    res.status(200).json({
      success: true,
      data: {
        ...job,
        candidateCount,
        screenedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing job
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id ${req.params.id}`,
      });
    }

    const updateData = { ...req.body };

    if (updateData.requiredSkills) {
      updateData.requiredSkills = Array.isArray(updateData.requiredSkills)
        ? updateData.requiredSkills.map((s) => s.trim()).filter(Boolean)
        : String(updateData.requiredSkills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (updateData.preferredSkills !== undefined) {
      updateData.preferredSkills = Array.isArray(updateData.preferredSkills)
        ? updateData.preferredSkills.map((s) => s.trim()).filter(Boolean)
        : updateData.preferredSkills
        ? String(updateData.preferredSkills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
    }

    job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a job and its associated candidates & screening results
 * @route   DELETE /api/jobs/:id
 * @access  Private
 */
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `Job not found with id ${req.params.id}`,
      });
    }

    // Cascade delete candidates and screening results
    await Candidate.deleteMany({ jobId: job._id });
    await ScreeningResult.deleteMany({ jobId: job._id });
    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Job and all associated records deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
};
