import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const sectionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: String,
  visible: {
    type: Boolean,
    default: true,
  },
  content: mongoose.Schema.Types.Mixed, // Storing dynamic content for each section type
  settings: mongoose.Schema.Types.Mixed, // Design customization (colors, spacing, alignments, background images)
});

const versionSchema = new mongoose.Schema({
  versionNumber: Number,
  title: String,
  sections: [sectionSchema],
  theme: String,
  colors: mongoose.Schema.Types.Mixed,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    templateType: {
      type: String,
      default: 'minimal',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'custom'],
      default: 'light',
    },
    colors: {
      primary: { type: String, default: '#2563eb' },
      secondary: { type: String, default: '#3b82f6' },
      background: { type: String, default: '#ffffff' },
      text: { type: String, default: '#1f2937' },
    },
    font: {
      type: String,
      default: 'Poppins',
    },
    sections: [sectionSchema],
    isPublished: {
      type: Boolean,
      default: false,
    },
    customDomain: {
      type: String,
      sparse: true,
    },
    password: {
      type: String,
      default: '',
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: String,
      ogImage: String,
      twitterCard: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    versions: [versionSchema],
    currentVersionNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Portfolio = mongoose.model('Portfolio', portfolioSchema);
export default Portfolio;
