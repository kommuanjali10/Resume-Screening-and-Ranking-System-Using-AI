const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const ScreeningResult = require('../models/ScreeningResult');

/**
 * @desc    Get all candidates with filtering, searching, and match scores
 * @route   GET /api/candidates
 * @access  Private
 */
const getCandidates = async (req, res, next) => {
  try {
    const { jobId, status, search, minExperience } = req.query;

    const query = {};

    if (jobId) {
      query.jobId = jobId;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (minExperience) {
      query.experience = { $gte: Number(minExperience) };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const candidates = await Candidate.find(query)
      .populate('jobId', 'title department minimumExperience')
      .sort({ createdAt: -1 })
      .lean();

    // Attach screening result match scores
    const candidatesWithScore = await Promise.all(
      candidates.map(async (cand) => {
        const result = await ScreeningResult.findOne({
          candidateId: cand._id,
          jobId: cand.jobId?._id || cand.jobId,
        }).lean();

        return {
          ...cand,
          screeningResult: result || null,
          matchScore: result ? result.matchScore : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: candidatesWithScore.length,
      data: candidatesWithScore,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a candidate with profile and resume metadata
 * @route   POST /api/candidates
 * @access  Private
 */
const createCandidate = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      education,
      experience,
      skills,
      certifications,
      projects,
      jobId,
      status,
      resumeFile,
    } = req.body;

    if (!name || !email || !education || !jobId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, education, and job selection are required.',
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Selected job does not exist.',
      });
    }

    // Parse skills
    const formattedSkills = Array.isArray(skills)
      ? skills.map((s) => s.trim()).filter(Boolean)
      : String(skills || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    // Parse certifications
    const formattedCerts = Array.isArray(certifications)
      ? certifications.map((c) => c.trim()).filter(Boolean)
      : certifications
      ? String(certifications)
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    // Parse projects
    let formattedProjects = [];
    if (Array.isArray(projects)) {
      formattedProjects = projects.map((p) => {
        if (typeof p === 'string') {
          return { title: p, description: '', technologies: [] };
        }
        return p;
      });
    } else if (typeof projects === 'string' && projects.trim().length > 0) {
      formattedProjects = projects
        .split('\n')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((title) => ({ title, description: '', technologies: [] }));
    }

    const candidate = await Candidate.create({
      name,
      email: email.toLowerCase().trim(),
      phone: phone || '',
      education,
      experience: Number(experience) || 0,
      skills: formattedSkills,
      certifications: formattedCerts,
      projects: formattedProjects,
      jobId,
      status: status || 'New',
      resumeFile: resumeFile || null,
    });

    res.status(201).json({
      success: true,
      message: 'Candidate profile created successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate details by ID with job and screening result
 * @route   GET /api/candidates/:id
 * @access  Private
 */
const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobId')
      .lean();

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: `Candidate not found with id ${req.params.id}`,
      });
    }

    const screeningResult = await ScreeningResult.findOne({
      candidateId: candidate._id,
      jobId: candidate.jobId?._id || candidate.jobId,
    }).lean();

    res.status(200).json({
      success: true,
      data: {
        ...candidate,
        screeningResult: screeningResult || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update candidate details or status
 * @route   PUT /api/candidates/:id
 * @access  Private
 */
const updateCandidate = async (req, res, next) => {
  try {
    let candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: `Candidate not found with id ${req.params.id}`,
      });
    }

    const updateData = { ...req.body };

    if (updateData.skills) {
      updateData.skills = Array.isArray(updateData.skills)
        ? updateData.skills.map((s) => s.trim()).filter(Boolean)
        : String(updateData.skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (updateData.certifications !== undefined) {
      updateData.certifications = Array.isArray(updateData.certifications)
        ? updateData.certifications.map((c) => c.trim()).filter(Boolean)
        : String(updateData.certifications)
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
    }

    candidate = await Candidate.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('jobId');

    // Sync status with ScreeningResult if updated
    if (updateData.status) {
      await ScreeningResult.findOneAndUpdate(
        { candidateId: candidate._id },
        { status: updateData.status }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Candidate updated successfully',
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete candidate and associated screening results
 * @route   DELETE /api/candidates/:id
 * @access  Private
 */
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: `Candidate not found with id ${req.params.id}`,
      });
    }

    await ScreeningResult.deleteMany({ candidateId: candidate._id });
    await Candidate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Candidate and related screening results deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  createCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
};
