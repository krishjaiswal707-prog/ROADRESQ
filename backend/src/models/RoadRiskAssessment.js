const mongoose = require('mongoose');

const RoadRiskAssessmentSchema = new mongoose.Schema({
  cityId: { type: String, required: true, index: true },
  segmentId: { type: String, required: true, index: true },
  segmentName: { type: String, required: true },
  coordinates: [[Number]], // polyline coordinates
  riskScore: { type: Number, min: 0, max: 100, required: true }, // 0=safe, 100=extreme danger
  riskTier: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], required: true },
  contributingHazards: [{
    hazardId: String,
    type: String,
    severity: String,
    reportedAt: Date
  }],
  weatherCondition: {
    status: { type: String, default: 'CLEAR' },
    waterloggingReported: { type: Boolean, default: false },
    floodRiskMultiplier: { type: Number, default: 1.0 }
  },
  recommendedRoutingAction: {
    type: String,
    enum: ['NORMAL', 'CAUTION_SLOWDOWN', 'DETOUR_RECOMMENDED', 'ROAD_CLOSURE'],
    default: 'NORMAL'
  },
  evaluatedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

RoadRiskAssessmentSchema.index({ cityId: 1, riskScore: -1 });

module.exports = mongoose.model('RoadRiskAssessment', RoadRiskAssessmentSchema);
