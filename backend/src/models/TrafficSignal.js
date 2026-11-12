const mongoose = require('mongoose');

const TrafficSignalSchema = new mongoose.Schema({
  signalId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  state: {
    type: String,
    enum: ['RED', 'YELLOW', 'GREEN'],
    default: 'RED'
  },
  isGreenCorridorOverridden: { type: Boolean, default: false },
  priorityDirection: { type: String, default: 'ALL' },
  cycleDurationSeconds: { type: Number, default: 60 },
  lastStateChange: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrafficSignal', TrafficSignalSchema);

