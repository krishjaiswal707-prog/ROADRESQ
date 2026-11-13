const mongoose = require('mongoose');

const CraneRequestSchema = new mongoose.Schema({
  requestId: { type: String, required: true, unique: true },
  cityId: { type: String, required: true, index: true },
  citizenName: { type: String, default: 'Citizen Requester' },
  contactPhone: { type: String, default: '+91 98765 43210' },
  vehicleCategory: { 
    type: String, 
    enum: ['TWO_WHEELER', 'SEDAN_HATCHBACK', 'SUV_4X4', 'HEAVY_COMMERCIAL'], 
    default: 'SEDAN_HATCHBACK' 
  },
  breakdownType: {
    type: String,
    enum: ['ENGINE_FAILURE', 'ACCIDENT_TOW', 'TIRE_BURST', 'BATTERY_DEAD', 'OFF_ROAD_DITCH'],
    default: 'ENGINE_FAILURE'
  },
  location: {
    name: { type: String, default: 'Roadside Incident Location' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  description: { type: String, default: 'Immediate towing assistance needed.' },
  assignedCraneId: { type: String, default: null },
  assignedCraneName: { type: String, default: null },
  status: {
    type: String,
    enum: ['REQUESTED', 'PENDING', 'ASSIGNED', 'EN_ROUTE', 'ARRIVED', 'SERVICE_IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'REQUESTED'
  },
  etaMinutes: { type: Number, default: 15 },
  createdAt: { type: Date, default: Date.now, index: true },
  completedAt: { type: Date }
});

module.exports = mongoose.model('CraneRequest', CraneRequestSchema);

