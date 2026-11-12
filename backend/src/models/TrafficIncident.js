const mongoose = require('mongoose');

const TrafficIncidentSchema = new mongoose.Schema({
  cityId: { type: String, required: true, index: true },
  incidentType: {
    type: String,
    enum: ['CONGESTION', 'ACCIDENT', 'ROAD_CLOSURE', 'CONSTRUCTION', 'HAZARD'],
    required: true
  },
  location: {
    name: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  severity: {
    type: String,
    enum: ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'],
    default: 'MODERATE'
  },
  description: { type: String, required: true },
  source: { type: String, enum: ['official', 'google', 'user_report', 'simulation'], required: true },
  verified: { type: Boolean, default: false },
  isSimulated: { type: Boolean, default: false },
  status: { type: String, enum: ['ACTIVE', 'CLEARED', 'INVESTIGATING'], default: 'ACTIVE' },
  observedAt: { type: Date, default: Date.now, index: true },
  clearedAt: { type: Date }
});

module.exports = mongoose.model('TrafficIncident', TrafficIncidentSchema);

