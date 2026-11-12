const osrmService = require('../../../services/osrmService');
const tomtomTrafficService = require('../../../services/tomtomTrafficService');
const congestionEngine = require('./congestionEngine');
const TrafficObservation = require('../../../models/TrafficObservation');
const TrafficIncident = require('../../../models/TrafficIncident');
const { getMonitoredCorridors } = require('../../../config/corridors');
const { broadcastToCity } = require('../../../realtime/socketManager');
const { SOCKET_CHANNELS } = require('../../../shared/types/contracts');

class TrafficDataService {
  constructor() {
    this.memoryCache = new Map();
    this.CACHE_TTL_MS = 60 * 1000;
  }

  /**
   * Fetch traffic for a specific corridor using OSRM geometry and TomTom live flow (if available)
   */
  async getCorridorTraffic(cityId, corridor) {
    const cacheKey = `${cityId}:${corridor.routeId}`;
    const cached = this.memoryCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return { ...cached.observation, metadata: { cached: true, providerStatus: 'CACHED' } };
    }

    // 1. Get baseline road distance and free-flow duration from OSRM
    const osrmRoute = await osrmService.getRoute(corridor.origin, corridor.destination, { cityId });

    let source = 'SIMULATED';
    let isSimulated = true;
    let normalSec = osrmRoute.normalDurationSeconds;
    let trafficSec = normalSec;
    let distanceMeters = osrmRoute.distanceMeters;
    let pathCoordinates = osrmRoute.pathCoordinates;

    // 2. Query TomTom Traffic Flow around corridor center if configured
    const midLat = (corridor.origin.lat + corridor.destination.lat) / 2;
    const midLng = (corridor.origin.lng + corridor.destination.lng) / 2;
    const tomtomFlow = await tomtomTrafficService.getSegmentFlow(midLat, midLng);

    if (tomtomFlow.available) {
      source = 'TOMTOM';
      isSimulated = false;
      normalSec = tomtomFlow.normalDurationSeconds > 0 ? tomtomFlow.normalDurationSeconds : normalSec;
      trafficSec = tomtomFlow.trafficDurationSeconds > 0 ? tomtomFlow.trafficDurationSeconds : normalSec;
    } else {
      // Deterministic simulation fallback
      source = 'SIMULATED';
      isSimulated = true;
      trafficSec = Math.round(normalSec * (1 + (Math.random() * 0.42))); // 0 to 42% delay
    }

    const classification = congestionEngine.classifyDelay(normalSec, trafficSec);

    const observation = {
      cityId,
      source,
      isSimulated,
      observedAt: new Date(),
      routeId: corridor.routeId,
      routeName: corridor.name,
      normalDurationSeconds: normalSec,
      trafficDurationSeconds: trafficSec,
      delaySeconds: classification.delaySeconds,
      delayPercentage: classification.delayPercentage,
      congestionLevel: classification.congestionLevel,
      distanceMeters,
      pathCoordinates,
      metadata: {
        cached: false,
        roadGeometryProvider: osrmRoute.provider,
        trafficProvider: source,
        providerStatus: isSimulated ? 'SIMULATED_MODEL_ACTIVE' : 'TOMTOM_LIVE_FLOW_ACTIVE'
      }
    };

    this.memoryCache.set(cacheKey, {
      observation,
      expiresAt: Date.now() + this.CACHE_TTL_MS
    });

    TrafficObservation.create(observation).catch(err => {
      console.warn('Could not save traffic observation to DB:', err.message);
    });

    return observation;
  }

  async refreshCityTraffic(cityId) {
    const corridors = getMonitoredCorridors(cityId);
    const observations = [];

    for (const corr of corridors) {
      try {
        const obs = await this.getCorridorTraffic(cityId, corr);
        observations.push(obs);
      } catch (err) {
        console.error(`Error refreshing corridor ${corr.routeId}:`, err.message);
      }
    }

    broadcastToCity(cityId, SOCKET_CHANNELS.EVENTS.TRAFFIC_UPDATED, {
      cityId,
      corridorsCount: observations.length,
      observations,
      updatedAt: new Date().toISOString()
    });

    return observations;
  }

  async getCityIncidents(cityId) {
    return TrafficIncident.find({ cityId, status: 'ACTIVE' }).sort({ observedAt: -1 }).limit(20);
  }
}

module.exports = new TrafficDataService();
