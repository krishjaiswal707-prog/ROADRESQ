const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'REPORT_CREATED',
      'REPORT_VERIFIED',
      'PRIORITY_ASSIGNED',
      'RESOURCE_ALLOCATED',
      'DISPATCH_INITIATED',
      'CORRIDOR_ACTIVATED',
      'RESOURCE_ARRIVED',
      'INCIDENT_RESOLVED'
    ],
    required: true
  },
  timestamp: { type: Date, default: Date.now },
  description: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const EmergencyTimelineSchema = new mongoose.Schema({
  incidentId: { type: String, required: true, unique: true, index: true },
  cityId: { type: String, required: true, default: 'chennai', index: true },
  events: [TimelineEventSchema],
  slaStatus: {
    type: String,
    enum: ['ON_TARGET', 'WARNING', 'BREACHED'],
    default: 'ON_TARGET'
  },
  metrics: {
    reportToVerificationSec: { type: Number, default: 0 },
    verificationToAssignmentSec: { type: Number, default: 0 },
    dispatchToArrivalSec: { type: Number, default: 0 },
    totalResponseSec: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now, index: true },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('EmergencyTimeline', EmergencyTimelineSchema);
