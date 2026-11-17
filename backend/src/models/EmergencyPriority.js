const mongoose = require('mongoose');

const EmergencyPrioritySchema = new mongoose.Schema({
  incidentId: { type: String, required: true, index: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  severityLevel: { type: String, enum: ['CRITICAL', 'HIGH', 'MODERATE', 'LOW'], required: true },
  factors: {
    incidentSeverity: { type: Number, required: true }, // e.g. 0-35
    waitingDurationMinutes: { type: Number, required: true }, // e.g. 0-25
    affectedCount: { type: Number, required: true }, // e.g. 0-15
    emergencyCategoryWeight: { type: Number, required: true }, // e.g. 0-15
    roadAccessibilityPenalty: { type: Number, default: 0 }, // e.g. -10 to +10
    resourceAvailabilityPenalty: { type: Number, default: 0 }
  },
  explanation: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

EmergencyPrioritySchema.index({ incidentId: 1, timestamp: -1 });

module.exports = mongoose.model('EmergencyPriority', EmergencyPrioritySchema);
