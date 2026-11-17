const mongoose = require('mongoose');

const SystemHealthAuditSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  containerStatus: {
    app: { status: String, memoryUsageMb: Number, uptimeSeconds: Number },
    database: { status: String, connected: Boolean, responseTimeMs: Number },
    redis: { status: String, connected: Boolean, pendingJobs: Number }
  },
  workerStatus: {
    activeWorkers: Number,
    completedJobs: Number,
    failedJobs: Number
  },
  activeCorridorsCount: Number,
  activeDispatchesCount: Number,
  averageResponseTimeSeconds: Number
}, { timestamps: true });

module.exports = mongoose.model('SystemHealthAudit', SystemHealthAuditSchema);
