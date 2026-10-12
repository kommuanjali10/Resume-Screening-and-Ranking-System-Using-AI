const mongoose = require('mongoose');

const screeningResultSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: [true, 'Candidate reference is required'],
    },
    matchScore: {
      type: Number,
      required: [true, 'Match score is required'],
      min: [0, 'Match score cannot be less than 0'],
      max: [100, 'Match score cannot exceed 100'],
    },
    matchedSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    skillsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 50,
      default: 0,
    },
    experienceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 20,
      default: 0,
    },
    educationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    certificationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    projectScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
      default: 0,
    },
    explanation: {
      type: String,
      required: [true, 'Screening explanation is required'],
    },
    strengths: {
      type: [String],
      default: [],
    },
    skillGaps: {
      type: [String],
      default: [],
    },
    recommendation: {
      type: String,
      default: 'Requires Recruiter Review',
    },
    status: {
      type: String,
      enum: ['Applied', 'New', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'],
      default: 'Under Review',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate screening records for the same candidate and job
screeningResultSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });
screeningResultSchema.index({ matchScore: -1 });

module.exports = mongoose.model('ScreeningResult', screeningResultSchema);
