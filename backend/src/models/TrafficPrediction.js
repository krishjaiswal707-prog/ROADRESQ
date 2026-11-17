const mongoose = require('mongoose');

const TrafficPredictionSchema = new mongoose.Schema({
  cityId: { type: String, required: true, index: true },
  junctionId: { type: String, required: true, index: true },
  horizonMinutes: { type: Number, enum: [15, 30, 60], required: true },
  predictedCongestion: { type: String, enum: ['LOW', 'MODERATE', 'HEAVY', 'SEVERE'], required: true },
  predictedSpeedKmh: { type: Number, required: true },
  confidence: { type: Number, min: 0, max: 1, required: true },
  modelType: { type: String, default: 'BASELINE_EXPONENTIAL_SMOOTHING' },
  explanation: { type: String, required: true },
  factors: {
    historicalAverageSpeed: Number,
    recentTrendSlope: Number,
    activeIncidentsNearby: Number,
    weatherMultiplier: Number
  },
  generatedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

TrafficPredictionSchema.index({ cityId: 1, junctionId: 1, horizonMinutes: 1, generatedAt: -1 });

module.exports = mongoose.model('TrafficPrediction', TrafficPredictionSchema);
