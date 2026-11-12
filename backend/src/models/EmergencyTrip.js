const mongoose = require('mongoose');

const EmergencyTripSchema = new mongoose.Schema({
  tripId: { type: String, required: true, unique: true },
  ambulanceId: { type: String, required: true },
  origin: {
    name: { type: String, default: 'Emergency Origin' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  destination: {
    name: { type: String, default: 'Hospital Destination' },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  status: {
    type: String,
    enum: ['IDLE', 'EN_ROUTE', 'ARRIVED', 'CANCELLED'],
    default: 'IDLE'
  },
  greenCorridorActive: { type: Boolean, default: false },
  controlledSignals: [{ type: String }],
  selectedRoute: {
    pathCoordinates: [[Number]], // [[lat, lng], ...]
    distanceKm: Number,
    estimatedMinutes: Number,
    standardMinutesWithoutCorridor: Number,
    timeSavedMinutes: Number
  },
  alternativeRoutes: [
    {
      name: String,
      pathCoordinates: [[Number]],
      distanceKm: Number,
      estimatedMinutes: Number,
      congestionLevel: String
    }
  ],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('EmergencyTrip', EmergencyTripSchema);

