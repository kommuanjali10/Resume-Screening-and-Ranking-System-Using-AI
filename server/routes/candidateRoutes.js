const express = require('express');
const router = express.Router();
const {
  getCandidates,
  createCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} = require('../controllers/candidateController');
const { protect, requireRecruiter } = require('../middleware/authMiddleware');

router.use(protect, requireRecruiter);

router.route('/')
  .get(getCandidates)
  .post(createCandidate);

router.route('/:id')
  .get(getCandidateById)
  .put(updateCandidate)
  .delete(deleteCandidate);

module.exports = router;
