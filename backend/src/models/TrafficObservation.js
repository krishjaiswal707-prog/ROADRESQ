const mongoose = require('mongoose');

const TrafficObservationSchema = new mongoose.Schema({
  cityId: { type: String, required: true, index: true },
  source: { type: String, enum: ['google', 'simulation', 'SIMULATED', 'TOMTOM'], required: true },
  isSimulated: { type: Boolean, required: true, default: false },
  observedAt: { type: Date, required: true, default: Date.now, index: true },
  routeId: { type: String, required: true, index: true },
  routeName: { type: String, default: 'Monitored Corridor' },
  normalDurationSeconds: { type: Number, required: true },
  trafficDurationSeconds: { type: Number, required: true },
  delaySeconds: { type: Number, required: true },
  delayPercentage: { type: Number, required: true }, // e.g. 25.5%
  congestionLevel: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH', 'SEVERE'],
    required: true
  },
  distanceMeters: { type: Number, default: 0 },
  encodedPolyline: { type: String, default: null },
  metadata: {
    cached: { type: Boolean, default: false },
    providerStatus: { type: String, default: 'OK' }
  }
});

TrafficObservationSchema.index({ cityId: 1, routeId: 1, observedAt: -1 });

module.exports = mongoose.model('TrafficObservation', TrafficObservationSchema);

