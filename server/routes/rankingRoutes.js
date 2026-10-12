const express = require('express');
const router = express.Router();
const { getRankingsForJob } = require('../controllers/rankingController');
const { protect, requireRecruiter } = require('../middleware/authMiddleware');

router.get('/:jobId', protect, requireRecruiter, getRankingsForJob);

module.exports = router;
