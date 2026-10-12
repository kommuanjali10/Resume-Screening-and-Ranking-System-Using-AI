const express = require('express');
const router = express.Router();
const {
  startScreeningForJob,
  getScreeningResultsForJob,
} = require('../controllers/screeningController');
const { protect, requireRecruiter } = require('../middleware/authMiddleware');

router.post('/:jobId', protect, requireRecruiter, startScreeningForJob);
router.get('/:jobId', protect, requireRecruiter, getScreeningResultsForJob);

module.exports = router;
