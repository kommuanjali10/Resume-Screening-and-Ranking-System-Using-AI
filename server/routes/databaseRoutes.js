const express = require('express');
const router = express.Router();
const { getDatabaseOverview } = require('../controllers/databaseController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDatabaseOverview);

module.exports = router;
