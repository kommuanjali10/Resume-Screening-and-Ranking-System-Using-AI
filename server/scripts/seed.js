require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const ScreeningResult = require('../models/ScreeningResult');
const { calculateScreeningScore } = require('../services/scoringService');

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume_screening_db';

  try {
    console.log(`[Seed] Connecting to MongoDB at ${uri}...`);
    await mongoose.connect(uri);
    console.log('[Seed] Database connected successfully.');

    // 1. Clean existing records to make seed idempotent
    console.log('[Seed] Purging existing seed collections...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Candidate.deleteMany({});
    await ScreeningResult.deleteMany({});

    // 2. Seed Recruiter Account
    console.log('[Seed] Creating demo recruiter...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    const recruiter = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter@demo.com',
      passwordHash,
      role: 'recruiter',
    });
    console.log(`[Seed] Created Recruiter: ${recruiter.name} (${recruiter.email})`);

    // 3. Seed Realistic Jobs
    console.log('[Seed] Creating realistic jobs...');
    const job1 = await Job.create({
      title: 'Senior Full Stack React & Node Developer',
      department: 'Engineering',
      description: 'Seeking a seasoned Full Stack Engineer to lead web application architecture using React, Node.js, Express, and MongoDB. You will design scalable REST APIs, craft intuitive user interfaces, and collaborate with cross-functional product teams.',
      requiredSkills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'REST APIs'],
      preferredSkills: ['TypeScript', 'Docker', 'AWS', 'Tailwind CSS', 'Redux'],
      minimumExperience: 3,
      education: "Bachelor's Degree in Computer Science or Software Engineering",
      status: 'Active',
    });

    const job2 = await Job.create({
      title: 'Machine Learning & Python Engineer',
      department: 'Data Science & AI',
      description: 'Join our AI engineering team to build scalable NLP feature extractors, fine-tune transformer models, and deploy production machine learning inference pipelines using Python, PyTorch, and Scikit-Learn.',
      requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'NLP', 'Scikit-Learn'],
      preferredSkills: ['Hugging Face', 'Transformers', 'FastAPI', 'Docker', 'SQL'],
      minimumExperience: 2,
      education: "Master's Degree in Computer Science, Data Science, or related field",
      status: 'Active',
    });

    console.log(`[Seed] Created Job 1: "${job1.title}" (ID: ${job1._id})`);
    console.log(`[Seed] Created Job 2: "${job2.title}" (ID: ${job2._id})`);

    // 4. Seed Realistic Candidates
    console.log('[Seed] Creating candidates with diverse profiles...');

    const candidateData = [
      // Job 1 - High Match
      {
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        phone: '+1 (555) 234-5678',
        education: 'B.Tech in Computer Science and Engineering',
        experience: 4.5,
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'REST APIs', 'TypeScript', 'Tailwind CSS'],
        certifications: ['AWS Certified Developer - Associate', 'MongoDB Certified Developer Associate'],
        projects: [
          {
            title: 'E-Commerce Microservices Platform',
            description: 'Built high-throughput backend in Node/Express and responsive React frontend',
            technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
          },
          {
            title: 'Collaborative Realtime Workspace',
            description: 'Collaborative canvas with WebSockets and Redux state management',
            technologies: ['React', 'Node.js', 'WebSockets'],
          },
        ],
        jobId: job1._id,
        status: 'Shortlisted',
        resumeFile: {
          originalName: 'Alex_Rivera_Senior_FullStack_Resume.pdf',
          filename: 'Alex_Rivera_Resume-sample.pdf',
          path: 'uploads/Alex_Rivera_Resume-sample.pdf',
          mimetype: 'application/pdf',
          size: 245000,
        },
      },
      // Job 1 - Medium Match
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+1 (555) 876-5432',
        education: 'Bachelor of Science in Information Technology',
        experience: 2.0,
        skills: ['React', 'JavaScript', 'MongoDB', 'HTML5', 'CSS3'],
        certifications: ['Meta Front-End Developer Professional Certificate'],
        projects: [
          {
            title: 'Health & Fitness Tracker Dashboard',
            description: 'React-based tracking dashboard with responsive charts',
            technologies: ['React', 'JavaScript'],
          },
        ],
        jobId: job1._id,
        status: 'Under Review',
        resumeFile: {
          originalName: 'Priya_Sharma_Resume.docx',
          filename: 'Priya_Sharma_Resume-sample.docx',
          path: 'uploads/Priya_Sharma_Resume-sample.docx',
          mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 182000,
        },
      },
      // Job 1 - Low Match
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@example.com',
        phone: '+1 (555) 345-6789',
        education: 'Associate Degree in Graphic & Web Design',
        experience: 1.0,
        skills: ['HTML5', 'CSS3', 'JavaScript', 'WordPress', 'Figma'],
        certifications: [],
        projects: [],
        jobId: job1._id,
        status: 'Rejected',
        resumeFile: {
          originalName: 'Marcus_Vance_WebResume.pdf',
          filename: 'Marcus_Vance_Resume-sample.pdf',
          path: 'uploads/Marcus_Vance_Resume-sample.pdf',
          mimetype: 'application/pdf',
          size: 115000,
        },
      },
      // Job 2 - High Match
      {
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+1 (555) 901-2345',
        education: 'Master of Science in Artificial Intelligence & Robotics',
        experience: 3.5,
        skills: ['Python', 'Machine Learning', 'PyTorch', 'NLP', 'Scikit-Learn', 'FastAPI'],
        certifications: ['TensorFlow Developer Certificate', 'DeepLearning.AI NLP Specialization'],
        projects: [
          {
            title: 'Clinical Text Summarizer',
            description: 'Fine-tuned transformer models for biomedical abstract summarization',
            technologies: ['PyTorch', 'Python', 'NLP'],
          },
          {
            title: 'Sentiment Classification Pipeline',
            description: 'End-to-end NLP classifier deployed with FastAPI container',
            technologies: ['Python', 'Scikit-Learn', 'FastAPI'],
          },
        ],
        jobId: job2._id,
        status: 'Shortlisted',
        resumeFile: {
          originalName: 'Elena_Rostova_AI_Researcher.pdf',
          filename: 'Elena_Rostova_Resume-sample.pdf',
          path: 'uploads/Elena_Rostova_Resume-sample.pdf',
          mimetype: 'application/pdf',
          size: 320000,
        },
      },
      // Job 2 - Medium Match
      {
        name: 'Devon Clark',
        email: 'devon.clark@example.com',
        phone: '+1 (555) 456-7890',
        education: 'Bachelor of Science in Data Analytics',
        experience: 1.5,
        skills: ['Python', 'Machine Learning', 'Scikit-Learn', 'SQL', 'Pandas'],
        certifications: ['Google Data Analytics Professional Certificate'],
        projects: [
          {
            title: 'Customer Churn Predictor',
            description: 'Classification model using Random Forest and XGBoost',
            technologies: ['Python', 'Scikit-Learn'],
          },
        ],
        jobId: job2._id,
        status: 'New',
        resumeFile: {
          originalName: 'Devon_Clark_Data_Analyst.pdf',
          filename: 'Devon_Clark_Resume-sample.pdf',
          path: 'uploads/Devon_Clark_Resume-sample.pdf',
          mimetype: 'application/pdf',
          size: 198000,
        },
      },
    ];

    for (const candItem of candidateData) {
      const candUser = await User.create({
        name: candItem.name,
        email: candItem.email,
        passwordHash,
        role: 'candidate',
        phone: candItem.phone,
        education: candItem.education,
        experience: candItem.experience,
        skills: candItem.skills,
        certifications: candItem.certifications,
        projects: candItem.projects,
        resumeFile: candItem.resumeFile,
      });
      candItem.userId = candUser._id;
    }

    const candidates = await Candidate.create(candidateData);
    console.log(`[Seed] Successfully inserted ${candidates.length} candidates and candidate user accounts.`);

    // 5. Compute and Save Screening Results using Rule-Based Engine
    console.log('[Seed] Executing Rule-Based Screening Engine for candidates...');
    for (const cand of candidates) {
      const job = cand.jobId.toString() === job1._id.toString() ? job1 : job2;
      const scoreData = calculateScreeningScore(cand, job);

      const result = await ScreeningResult.create({
        jobId: job._id,
        candidateId: cand._id,
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
        status: cand.status,
      });

      console.log(`  -> Screened: ${cand.name} | Score: ${result.matchScore}% | Status: ${result.status}`);
    }

    console.log('================================================================');
    console.log('SEED COMPLETED SUCCESSFULLY!');
    console.log('Demo Credentials:');
    console.log('  Recruiter: recruiter@demo.com / Password123!');
    console.log('  Candidate: alex.rivera@example.com / Password123!');
    console.log('================================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error occurred during database seeding:', error);
    process.exit(1);
  }
};

seedData();
