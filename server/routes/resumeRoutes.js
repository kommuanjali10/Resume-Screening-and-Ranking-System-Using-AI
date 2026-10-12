const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadResumes, getResumeFile } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.array('resumes', 10), uploadResumes);
router.get('/:filename', protect, getResumeFile);

module.exports = router;
