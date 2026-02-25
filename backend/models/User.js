const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'recruiter'], required: true },
  // Job Seeker fields
  skills: [String],
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  resume: {
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: Date
  },
  bio: String,
  location: String,
  phone: String,
  // Recruiter fields
  company: String,
  companyDescription: String,
  website: String,
  avatar: String,
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
