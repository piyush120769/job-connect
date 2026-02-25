const express = require('express');
const router = express.Router();
const {
  applyForJob, getMyApplications, getJobApplications, getRecruiterApplications,
  updateApplicationStatus, scheduleInterview, downloadResume, getApplicationById
} = require('../controllers/applicationController');
const { protect, recruiterOnly, jobseekerOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/my', protect, jobseekerOnly, getMyApplications);
router.get('/recruiter', protect, recruiterOnly, getRecruiterApplications);
router.get('/:id', protect, getApplicationById);
router.get('/:id/resume', protect, downloadResume);
router.post('/job/:jobId', protect, jobseekerOnly, upload.single('resume'), applyForJob);
router.get('/job/:jobId', protect, recruiterOnly, getJobApplications);
router.put('/:id/status', protect, recruiterOnly, updateApplicationStatus);
router.put('/:id/interview', protect, recruiterOnly, scheduleInterview);

module.exports = router;
