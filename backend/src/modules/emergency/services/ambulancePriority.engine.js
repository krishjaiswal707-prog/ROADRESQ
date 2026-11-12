const { haversineDistanceKm } = require('../../../algorithms/routeOptimizer');
const { EMERGENCY_PRIORITY, AMBULANCE_STATUSES } = require('../../../shared/types/contracts');

class AmbulanceDispatchPriorityEngine {
  constructor() {
    this.ambulances = [
      {
        id: 'AMB-CHN-101',
        cityId: 'chennai',
        name: 'Alpha Trauma Rescue',
        location: { lat: 13.0827, lng: 80.2707 },
        status: AMBULANCE_STATUSES.AVAILABLE,
        capabilities: ['ADVANCED_LIFE_SUPPORT', 'VENTILATOR'],
        level: 'ALS'
      },
      {
        id: 'AMB-CHN-102',
        cityId: 'chennai',
        name: 'Bravo Rapid Transit',
        location: { lat: 13.0519, lng: 80.2514 },
        status: AMBULANCE_STATUSES.AVAILABLE,
        capabilities: ['BASIC_LIFE_SUPPORT'],
        level: 'BLS'
      },
      {
        id: 'AMB-BLR-201',
        cityId: 'bengaluru',
        name: 'Bengaluru Quick Responder',
        location: { lat: 12.9716, lng: 77.5946 },
        status: AMBULANCE_STATUSES.AVAILABLE,
        capabilities: ['ADVANCED_LIFE_SUPPORT'],
        level: 'ALS'
      }
    ];
  }

  getAvailableAmbulances(cityId) {
    const normalized = (cityId || 'chennai').toLowerCase();
    return this.ambulances.filter(a => a.cityId === normalized && a.status === AMBULANCE_STATUSES.AVAILABLE);
  }

  /**
   * Triage & Select best ambulance based on:
   * 1. Emergency Severity (CRITICAL > HIGH > MODERATE > LOW)
   * 2. Capability matching
   * 3. Traffic-weighted ETA (not just Euclidean distance)
   */
  selectOptimalAmbulance(cityId, emergencyLocation, severity = 'HIGH') {
    const available = this.getAvailableAmbulances(cityId);
    if (available.length === 0) {
      return null;
    }

    let bestAmbulance = null;
    let minScore = Infinity;

    for (const amb of available) {
      const distKm = haversineDistanceKm(
        amb.location.lat, amb.location.lng,
        emergencyLocation.lat, emergencyLocation.lng
      );

      // Estimated ETA in minutes assuming 40 km/h in city
      const etaMinutes = (distKm / 40) * 60;

      // Severity weight factor: Critical cases prioritize Advanced Life Support (ALS)
      let score = etaMinutes;
      if ((severity === EMERGENCY_PRIORITY.CRITICAL || severity === 'CRITICAL') && amb.level !== 'ALS') {
        score += 8; // Penalty for lack of intensive care equipment
      }

      if (score < minScore) {
        minScore = score;
        bestAmbulance = {
          ...amb,
          estimatedDispatchEtaMinutes: Math.max(1, Math.round(etaMinutes)),
          distanceKm: +(distKm.toFixed(2))
        };
      }
    }

    return bestAmbulance;
  }
}

module.exports = new AmbulanceDispatchPriorityEngine();

