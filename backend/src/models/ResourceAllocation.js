const mongoose = require('mongoose');

const ResourceAllocationSchema = new mongoose.Schema({
  allocationId: { type: String, required: true, unique: true, index: true },
  incidentId: { type: String, required: true, index: true },
  resourceType: { type: String, enum: ['AMBULANCE', 'CRANE', 'FIRE_TENDER'], required: true },
  resourceId: { type: String, required: true },
  resourceName: { type: String, required: true },
  capabilityTier: { type: String, enum: ['ALS', 'BLS', 'HEAVY_CRANE', 'MEDIUM_CRANE', 'FLATBED'], required: true },
  targetHospitalId: { type: String },
  matchScore: { type: Number, required: true },
  matchFactors: {
    capabilityMatch: Boolean,
    distanceKm: Number,
    estimatedArrivalMinutes: Number,
    trafficCongestionPenalty: Number,
    hospitalSuitabilityScore: Number
  },
  status: { type: String, enum: ['DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'COMPLETED', 'CANCELLED'], default: 'DISPATCHED' },
  dispatchedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ResourceAllocation', ResourceAllocationSchema);
