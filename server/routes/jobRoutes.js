const express = require('express');
const router = express.Router();
const {
  getJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');
const { protect, requireRecruiter } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getJobs)
  .post(protect, requireRecruiter, createJob);

router.route('/:id')
  .get(protect, getJobById)
  .put(protect, requireRecruiter, updateJob)
  .delete(protect, requireRecruiter, deleteJob);

module.exports = router;
