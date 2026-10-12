const express = require('express');
const router = express.Router();
const { getStats, getCharts } = require('../controllers/dashboardController');
const { protect, requireRecruiter } = require('../middleware/authMiddleware');

router.get('/stats', protect, requireRecruiter, getStats);
router.get('/charts', protect, requireRecruiter, getCharts);

module.exports = router;
