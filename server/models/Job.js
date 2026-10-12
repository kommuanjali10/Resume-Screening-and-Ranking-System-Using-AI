const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department or company is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill must be specified'],
      validate: {
        validator: function (skills) {
          return Array.isArray(skills) && skills.length > 0;
        },
        message: 'Please provide at least one required skill',
      },
    },
    preferredSkills: {
      type: [String],
      default: [],
    },
    minimumExperience: {
      type: Number,
      required: [true, 'Minimum experience is required'],
      min: [0, 'Minimum experience cannot be negative'],
      default: 0,
    },
    education: {
      type: String,
      required: [true, 'Education requirement is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active',
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

jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
