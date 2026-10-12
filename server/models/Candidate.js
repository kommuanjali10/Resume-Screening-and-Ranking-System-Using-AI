const mongoose = require('mongoose');

const projectSubSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    technologies: { type: [String], default: [] },
  },
  { _id: false }
);

const resumeFileSchema = new mongoose.Schema(
  {
    filename: { type: String },
    originalName: { type: String },
    path: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    uploadDate: { type: Date, default: Date.now },
  },
  { _id: false }
);

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Candidate email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      type: String,
      required: [true, 'Education information is required'],
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Experience in years is required'],
      min: [0, 'Experience cannot be negative'],
      default: 0,
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    projects: {
      type: [projectSubSchema],
      default: [],
    },
    resumeFile: {
      type: resumeFileSchema,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
    },
    status: {
      type: String,
      enum: ['Applied', 'New', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'],
      default: 'Applied',
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

candidateSchema.index({ jobId: 1, email: 1 });
candidateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Candidate', candidateSchema);
