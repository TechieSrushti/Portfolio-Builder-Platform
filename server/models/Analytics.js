import mongoose from 'mongoose';

const valueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true, default: 0 },
});

const analyticsSchema = new mongoose.Schema(
  {
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    uniqueIPs: [String], // Used to compute unique visitors
    countries: [valueSchema],
    sources: [valueSchema],
    devices: [valueSchema],
  },
  {
    timestamps: true,
  }
);

// Index to search by portfolio and date fast
analyticsSchema.index({ portfolio: 1, date: 1 }, { unique: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics;
