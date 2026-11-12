const axios = require('axios');
const congestionEngine = require('../modules/traffic/services/congestionEngine');

/**
 * TomTom Traffic Flow API Integration
 * Queries TomTom Traffic Flow Segment Data API (Free quota: 2,500 daily transactions)
 * If no key is set or quota is exceeded, cleanly returns an unavailable status.
 */
class TomTomTrafficService {
  constructor() {
    this.apiKey = process.env.TOMTOM_API_KEY || '';
    this.baseUrl = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/relative0/10/json';
    this.timeoutMs = parseInt(process.env.TOMTOM_REQUEST_TIMEOUT_MS, 10) || 5000;
    this.cacheTTLMs = (parseInt(process.env.TOMTOM_CACHE_TTL_SECONDS, 10) || 60) * 1000;
    this.cache = new Map(); // key -> { data, expiresAt }
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10 && this.apiKey !== 'your_tomtom_api_key_here');
  }

  /**
   * Fetch traffic flow around specific point
   */
  async getSegmentFlow(lat, lng) {
    if (!this.isConfigured()) {
      return {
        available: false,
        source: 'TOMTOM',
        reason: 'API_KEY_NOT_CONFIGURED',
        isSimulated: false
      };
    }

    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return { ...cached.data, cached: true };
    }

    try {
      const url = `${this.baseUrl}?point=${lat},${lng}&unit=KMPH&key=${this.apiKey}`;
      const response = await axios.get(url, { timeout: this.timeoutMs });

      const flowData = response.data?.flowSegmentData;
      if (!flowData) {
        return {
          available: false,
          source: 'TOMTOM',
          reason: 'NO_SEGMENT_DATA',
          isSimulated: false
        };
      }

      const currentSpeed = flowData.currentSpeed || 0;
      const freeFlowSpeed = flowData.freeFlowSpeed || 0;
      const currentTravelTime = flowData.currentTravelTime || 0;
      const freeFlowTravelTime = flowData.freeFlowTravelTime || 0;
      const confidence = flowData.confidence || 1.0;
      const roadClosure = flowData.roadClosure || false;

      // Classify through existing congestion engine
      const classification = congestionEngine.classifyDelay(freeFlowTravelTime, currentTravelTime);

      const result = {
        available: true,
        source: 'TOMTOM',
        isSimulated: false,
        currentSpeedKmph: currentSpeed,
        freeFlowSpeedKmph: freeFlowSpeed,
        normalDurationSeconds: freeFlowTravelTime,
        trafficDurationSeconds: currentTravelTime,
        delaySeconds: classification.delaySeconds,
        delayPercentage: classification.delayPercentage,
        congestionLevel: classification.congestionLevel,
        roadClosure,
        confidence,
        coordinates: flowData.coordinates?.coordinate || [],
        observedAt: new Date().toISOString()
      };

      this.cache.set(cacheKey, { data: result, expiresAt: Date.now() + this.cacheTTLMs });
      return result;
    } catch (error) {
      const status = error.response?.status;
      let reason = 'REQUEST_FAILED';
      if (status === 401 || status === 403) reason = 'AUTHENTICATION_FAILED_OR_FORBIDDEN';
      else if (status === 429) reason = 'QUOTA_EXCEEDED';
      else if (error.code === 'ECONNABORTED') reason = 'TIMEOUT';

      console.warn(`⚠️ TomTom Traffic Flow unavailable (${reason}):`, error.message);
      return {
        available: false,
        source: 'TOMTOM',
        reason,
        isSimulated: false,
        errorMessage: error.message
      };
    }
  }
}

module.exports = new TomTomTrafficService();

