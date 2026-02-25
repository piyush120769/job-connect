const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs } = require('../controllers/jobController');
const { protect, recruiterOnly } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.get('/my-jobs', protect, recruiterOnly, getMyJobs);
router.get('/:id', getJobById);
router.post('/', protect, recruiterOnly, createJob);
router.put('/:id', protect, recruiterOnly, updateJob);
router.delete('/:id', protect, recruiterOnly, deleteJob);

module.exports = router;
