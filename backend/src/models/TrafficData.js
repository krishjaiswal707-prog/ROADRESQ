const mongoose = require('mongoose');

const TrafficDataSchema = new mongoose.Schema({
  segmentId: { type: String, required: true },
  name: { type: String, required: true },
  coordinates: {
    start: { lat: Number, lng: Number },
    end: { lat: Number, lng: Number }
  },
  congestionLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Severe'],
    required: true
  },
  vehicleCount: { type: Number, default: 0 },
  averageSpeedKmph: { type: Number, default: 40 },
  jamFactor: { type: Number, default: 1.0 }, // 1.0 (free flow) to 5.0 (deadlock)
  isSimulated: { type: Boolean, default: true },
  recordedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrafficData', TrafficDataSchema);

