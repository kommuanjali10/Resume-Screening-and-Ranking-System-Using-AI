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

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide user name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['candidate', 'recruiter', 'admin'],
      default: 'candidate',
    },
    // Candidate Profile Fields
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    education: {
      type: String,
      trim: true,
      default: '',
    },
    experience: {
      type: Number,
      min: 0,
      default: 0,
    },
    skills: {
      type: [String],
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Never expose passwordHash in toJSON transforms
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
