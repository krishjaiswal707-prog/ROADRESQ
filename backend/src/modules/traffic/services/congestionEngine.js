/**
 * Reusable Congestion Classification Service
 * Calculates delay ratio = (trafficDuration - normalDuration) / normalDuration
 * Categories:
 *   LOW: <= 10%
 *   MODERATE: 10% < ratio <= 30%
 *   HIGH: 30% < ratio <= 60%
 *   SEVERE: > 60%
 */

class CongestionEngine {
  constructor(customThresholds = {}) {
    this.thresholds = {
      lowMaxRatio: 0.10,      // 10%
      moderateMaxRatio: 0.30, // 30%
      highMaxRatio: 0.60,     // 60%
      ...customThresholds
    };
  }

  classifyDelay(normalDurationSeconds, trafficDurationSeconds) {
    if (!normalDurationSeconds || normalDurationSeconds <= 0) {
      return {
        congestionLevel: 'LOW',
        delaySeconds: 0,
        delayPercentage: 0,
        delayRatio: 0
      };
    }

    const traffic = Math.max(normalDurationSeconds, trafficDurationSeconds || normalDurationSeconds);
    const delaySeconds = traffic - normalDurationSeconds;
    const delayRatio = +(delaySeconds / normalDurationSeconds).toFixed(4);
    const delayPercentage = +(delayRatio * 100).toFixed(1);

    let congestionLevel = 'LOW';
    if (delayRatio > this.thresholds.highMaxRatio) {
      congestionLevel = 'SEVERE';
    } else if (delayRatio > this.thresholds.moderateMaxRatio) {
      congestionLevel = 'HIGH';
    } else if (delayRatio > this.thresholds.lowMaxRatio) {
      congestionLevel = 'MODERATE';
    }

    return {
      congestionLevel,
      delaySeconds,
      delayPercentage,
      delayRatio
    };
  }
}

module.exports = new CongestionEngine();

