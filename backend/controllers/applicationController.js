const Application = require('../models/Application');
const Job = require('../models/Job');
const path = require('path');
const fs = require('fs');

// @desc Apply for a job (with resume upload)
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'active') return res.status(400).json({ message: 'Job is no longer accepting applications' });

    const existing = await Application.findOne({ job: req.params.jobId, applicant: req.user._id });
    if (existing) return res.status(400).json({ message: 'You have already applied for this job' });

    if (!req.file) return res.status(400).json({ message: 'Resume is required' });

    const application = await Application.create({
      job: req.params.jobId,
      applicant: req.user._id,
      recruiter: job.recruiter,
      coverLetter: req.body.coverLetter,
      resume: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        uploadedAt: new Date()
      }
    });

    await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicantsCount: 1 } });

    const populated = await Application.findById(application._id)
      .populate('job', 'title company location')
      .populate('applicant', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get my applications (job seeker)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate('job', 'title company location type salary status')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get applications for a job (recruiter)
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.query;
    const query = { job: req.params.jobId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate('applicant', 'name email phone location skills education experience bio')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all applications for recruiter
const getRecruiterApplications = async (req, res) => {
  try {
    const applications = await Application.find({ recruiter: req.user._id })
      .populate('job', 'title company location')
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = req.body.status || application.status;
    application.recruiterNotes = req.body.recruiterNotes || application.recruiterNotes;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Schedule interview
const scheduleInterview = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { scheduledAt, duration, type, notes } = req.body;
    const meetingLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/interview/${application._id}`;

    application.interview = { scheduledAt, duration, type, notes, meetingLink, status: 'scheduled' };
    application.status = 'Interview Scheduled';
    await application.save();

    const updated = await Application.findById(application._id)
      .populate('applicant', 'name email')
      .populate('job', 'title company');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Download resume
const downloadResume = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Check if requester is the applicant or the recruiter
    if (
      application.applicant.toString() !== req.user._id.toString() &&
      application.recruiter.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!application.resume || !application.resume.path) {
      return res.status(404).json({ message: 'No resume found' });
    }

    if (!fs.existsSync(application.resume.path)) {
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    res.download(application.resume.path, application.resume.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single application
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('job', 'title company location type salary description')
      .populate('applicant', 'name email phone location skills education experience bio')
      .populate('recruiter', 'name company email');

    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (
      application.applicant._id.toString() !== req.user._id.toString() &&
      application.recruiter._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  applyForJob, getMyApplications, getJobApplications, getRecruiterApplications,
  updateApplicationStatus, scheduleInterview, downloadResume, getApplicationById
};
