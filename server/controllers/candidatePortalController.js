const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const ScreeningResult = require('../models/ScreeningResult');
const User = require('../models/User');
const { calculateScreeningScore } = require('../services/scoringService');

/**
 * @desc    Get candidate profile
 * @route   GET /api/candidate/profile
 * @access  Private (Candidate)
 */
const getCandidateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update candidate profile
 * @route   PUT /api/candidate/profile
 * @access  Private (Candidate)
 */
const updateCandidateProfile = async (req, res, next) => {
  try {
    const { name, phone, education, experience, skills, certifications, projects } = req.body;

    const formattedSkills = Array.isArray(skills)
      ? skills.map((s) => s.trim()).filter(Boolean)
      : skills
      ? String(skills).split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const formattedCerts = Array.isArray(certifications)
      ? certifications.map((c) => c.trim()).filter(Boolean)
      : certifications
      ? String(certifications).split(',').map((c) => c.trim()).filter(Boolean)
      : undefined;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone !== undefined) updateFields.phone = phone;
    if (education !== undefined) updateFields.education = education;
    if (experience !== undefined) updateFields.experience = Number(experience) || 0;
    if (formattedSkills !== undefined) updateFields.skills = formattedSkills;
    if (formattedCerts !== undefined) updateFields.certifications = formattedCerts;
    if (projects !== undefined) updateFields.projects = projects;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    res.status(200).json({
      success: true,
      message: 'Candidate profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload candidate resume and attach to profile
 * @route   POST /api/candidate/upload-resume
 * @access  Private (Candidate)
 */
const uploadCandidateResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume document provided. Please select a valid PDF or DOCX file.',
      });
    }

    const resumeMetadata = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `uploads/${req.file.filename}`,
      uploadDate: new Date(),
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeFile: resumeMetadata },
      { new: true }
    ).select('-passwordHash');

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and attached to your candidate profile successfully.',
      file: resumeMetadata,
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get published jobs for candidate view with application status
 * @route   GET /api/candidate/jobs
 * @access  Private (Candidate)
 */
const getAvailableJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'Active' }).sort({ createdAt: -1 }).lean();

    // Check which jobs candidate has already applied to
    const candidateApplications = await Candidate.find({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    }).lean();

    const appliedJobIds = new Set(
      candidateApplications.map((app) => app.jobId.toString())
    );

    const jobsWithAppliedStatus = jobs.map((job) => ({
      ...job,
      hasApplied: appliedJobIds.has(job._id.toString()),
    }));

    res.status(200).json({
      success: true,
      count: jobsWithAppliedStatus.length,
      data: jobsWithAppliedStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Apply to a specific job using candidate profile & resume
 * @route   POST /api/candidate/apply/:jobId
 * @access  Private (Candidate)
 */
const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job position not found.',
      });
    }

    if (job.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This job posting is no longer active for applications.',
      });
    }

    // Check for duplicate application
    const existingApplication = await Candidate.findOne({
      jobId: job._id,
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job position.',
      });
    }

    // Get candidate profile
    const user = await User.findById(req.user._id);

    // Create Candidate application record
    const application = await Candidate.create({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      education: user.education || "Bachelor's Degree",
      experience: user.experience || 0,
      skills: user.skills && user.skills.length > 0 ? user.skills : ['General'],
      certifications: user.certifications || [],
      projects: user.projects || [],
      resumeFile: user.resumeFile || null,
      userId: user._id,
      jobId: job._id,
      status: 'Applied',
    });

    // Automatically evaluate resume match score using rule-based scoring engine
    const scoreData = calculateScreeningScore(application, job);

    const screeningResult = await ScreeningResult.findOneAndUpdate(
      { jobId: job._id, candidateId: application._id },
      {
        jobId: job._id,
        candidateId: application._id,
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
        status: 'Applied',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      success: true,
      message: `Successfully submitted your application for "${job.title}"!`,
      application,
      candidate: application,
      data: application,
      screeningResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get candidate's submitted applications with personal scores & ranks
 * @route   GET /api/candidate/my-applications
 * @access  Private (Candidate)
 */
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Candidate.find({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    })
      .populate('jobId')
      .sort({ createdAt: -1 })
      .lean();

    const applicationDetails = await Promise.all(
      applications.map(async (app) => {
        // Fetch personal screening result
        const screeningResult = await ScreeningResult.findOne({
          candidateId: app._id,
          jobId: app.jobId?._id,
        }).lean();

        // Calculate candidate's rank among all applicants for this job
        let rank = null;
        let totalApplicants = 0;
        if (app.jobId?._id) {
          const allJobResults = await ScreeningResult.find({
            jobId: app.jobId._id,
          })
            .sort({ matchScore: -1 })
            .lean();

          totalApplicants = allJobResults.length;
          const userResultIndex = allJobResults.findIndex(
            (r) => r.candidateId?.toString() === app._id.toString()
          );
          if (userResultIndex !== -1) {
            rank = userResultIndex + 1;
          }
        }

        return {
          ...app,
          screeningResult: screeningResult || null,
          matchScore: screeningResult?.matchScore ?? null,
          matchedSkills: screeningResult?.matchedSkills || [],
          missingSkills: screeningResult?.missingSkills || [],
          strengths: screeningResult?.strengths || [],
          skillGaps: screeningResult?.skillGaps || [],
          explanation: screeningResult?.explanation || 'Pending recruiter review.',
          recommendation: screeningResult?.recommendation || 'Pending Review',
          rank,
          totalApplicants,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: applicationDetails.length,
      data: applicationDetails,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidateProfile,
  updateCandidateProfile,
  uploadCandidateResume,
  getAvailableJobs,
  applyForJob,
  getMyApplications,
};
