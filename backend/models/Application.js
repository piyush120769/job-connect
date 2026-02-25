const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Applied', 'Reviewing', 'Shortlisted', 'Interview Scheduled', 'Rejected', 'Hired'],
    default: 'Applied'
  },
  coverLetter: { type: String },
  resume: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: Date
  },
  interview: {
    scheduledAt: Date,
    duration: { type: Number, default: 30 }, // minutes
    type: { type: String, enum: ['video', 'phone', 'in-person'], default: 'video' },
    meetingLink: String,
    notes: String,
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' }
  },
  recruiterNotes: String,
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
