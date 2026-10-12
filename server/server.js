require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const screeningRoutes = require('./routes/screeningRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const candidatePortalRoutes = require('./routes/candidatePortalRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in local dev
    },
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Meaningful Root Route (not "Cannot GET /")
app.get('/', (req, res) => {
  res.status(200).json({
    project: 'Resume Screening and Ranking System Using AI',
    status: 'Online',
    stage: 'AI-Powered Screening Engine',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      candidate: '/api/candidate',
      jobs: '/api/jobs',
      candidates: '/api/candidates',
      resumes: '/api/resumes/upload',
      screening: '/api/screening/:jobId',
      rankings: '/api/rankings/:jobId',
      dashboardStats: '/api/dashboard/stats',
      dashboardCharts: '/api/dashboard/charts',
      databaseOverview: '/api/database',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidatePortalRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/screening', screeningRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/database', databaseRoutes);

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`Resume Screening and Ranking System Using AI - Server Started`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`================================================================`);
});

module.exports = app;
