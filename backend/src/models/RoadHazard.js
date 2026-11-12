const mongoose = require('mongoose');

const RoadHazardSchema = new mongoose.Schema({
  hazardId: { type: String, required: true, unique: true },
  cityId: { type: String, required: true, index: true },
  hazardType: {
    type: String,
    enum: ['POTHOLE', 'DAMAGED_BRIDGE', 'ROAD_CRACK', 'WATERLOGGING', 'OBSTRUCTION', 'ACCIDENT_PRONE'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  location: {
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  description: { type: String, required: true },
  reportedBy: { type: String, default: 'Citizen Alert' },
  verificationStatus: {
    type: String,
    enum: ['SUBMITTED', 'VERIFIED', 'IN_REPAIR', 'REPAIRED', 'REJECTED'],
    default: 'SUBMITTED',
    index: true
  },
  isBlockingTraffic: { type: Boolean, default: false },
  assignedMaintenanceTeam: { type: String, default: null },
  reportedAt: { type: Date, default: Date.now, index: true },
  verifiedAt: { type: Date },
  repairedAt: { type: Date }
});

module.exports = mongoose.model('RoadHazard', RoadHazardSchema);
