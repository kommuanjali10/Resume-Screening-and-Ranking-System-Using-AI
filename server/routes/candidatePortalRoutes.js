const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, requireCandidate } = require('../middleware/authMiddleware');
const {
  getCandidateProfile,
  updateCandidateProfile,
  uploadCandidateResume,
  getAvailableJobs,
  applyForJob,
  getMyApplications,
} = require('../controllers/candidatePortalController');

// All routes require candidate authentication
router.use(protect, requireCandidate);

router.get('/profile', getCandidateProfile);
router.put('/profile', updateCandidateProfile);
router.post('/resume', upload.single('resume'), uploadCandidateResume);
router.post('/upload-resume', upload.single('resume'), uploadCandidateResume);
router.get('/jobs', getAvailableJobs);
router.post('/apply/:jobId', applyForJob);
router.get('/applications', getMyApplications);
router.get('/my-applications', getMyApplications);

module.exports = router;
