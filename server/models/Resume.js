import mongoose from 'mongoose';

const workExperienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  description: String,
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  fieldOfStudy: String,
  startDate: String,
  endDate: String,
  description: String,
});

const resumeProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
});

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'My Professional Resume',
    },
    templateType: {
      type: String,
      enum: ['classic', 'modern', 'minimal', 'creative'],
      default: 'modern',
    },
    personalDetails: {
      fullName: String,
      email: String,
      phone: String,
      website: String,
      location: String,
      summary: String,
      github: String,
      linkedin: String,
      twitter: String,
    },
    workExperience: [workExperienceSchema],
    education: [educationSchema],
    skills: [String],
    projects: [resumeProjectSchema],
    certifications: [
      {
        name: String,
        issuer: String,
        date: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
