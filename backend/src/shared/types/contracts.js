/**
 * ROAD RESQ AI - Standard Shared Data Contracts (Step 3.1)
 * Standardizes:
 * - Coordinates: { latitude: number, longitude: number }
 * - Simulation flags: { isSimulated: boolean }
 * - Timestamps: ISO strings
 */

// 1. Congestion & Traffic Classifications
const CONGESTION_LEVELS = Object.freeze({
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  SEVERE: 'Severe'
});

// 2. Ambulance Statuses
const AMBULANCE_STATUSES = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  EN_ROUTE: 'EN_ROUTE',
  ARRIVED: 'ARRIVED',
  PAUSED: 'PAUSED'
});

// 3. Emergency Priority Levels
const EMERGENCY_PRIORITY = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MODERATE: 'MODERATE',
  LOW: 'LOW'
});

// 4. Traffic Signal States
const SIGNAL_STATES = Object.freeze({
  RED: 'RED',
  YELLOW: 'YELLOW',
  GREEN: 'GREEN'
});

// 5. Socket.io Event Channels and Room Helpers
const SOCKET_CHANNELS = Object.freeze({
  ROOM_PREFIX: 'city:',
  getCityRoom: (cityId) => `city:${(cityId || 'chennai').toLowerCase().trim()}`,

  EVENTS: {
    // Ambulance Events
    AMBULANCE_LOCATION: 'ambulance:location',
    AMBULANCE_STATUS: 'ambulance:status',
    AMBULANCE_ASSIGNED: 'ambulance:assigned',
    AMBULANCE_ARRIVED: 'ambulance:arrived',

    // Traffic Events
    TRAFFIC_UPDATED: 'traffic:updated',
    TRAFFIC_INCIDENT: 'traffic:incident',
    TRAFFIC_CONGESTION: 'traffic:congestion',

    // Routing Events
    ROUTE_CALCULATED: 'route:calculated',
    ROUTE_UPDATED: 'route:updated',
    ROUTE_RECALCULATED: 'route:recalculated',

    // Corridor Events
    CORRIDOR_ACTIVATED: 'corridor:activated',
    CORRIDOR_RELEASED: 'corridor:released',
    SIGNAL_CHANGED: 'signal:changed',

    // Emergency Events
    EMERGENCY_CREATED: 'emergency:created',
    EMERGENCY_ASSIGNED: 'emergency:assigned',
    EMERGENCY_RESOLVED: 'emergency:resolved',

    // Legacy compatibility event
    LEGACY_FEED_UPDATE: 'traffic-feed-update'
  }
});

/**
 * Standard Coordinate Validator and Formatter
 */
function formatCoordinate(lat, lng) {
  const latitude = typeof lat === 'number' ? lat : parseFloat(lat);
  const longitude = typeof lng === 'number' ? lng : parseFloat(lng);

  if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw new Error(`Invalid WGS84 coordinates: latitude=${lat}, longitude=${lng}`);
  }

  return { latitude, longitude };
}

/**
 * Create a standardized TrafficSnapshot contract
 */
function createTrafficSnapshot({ segmentId, name, startCoord, endCoord, congestionLevel, vehicleCount, speedKmph, isSimulated = true, source = 'INTERNAL_SIMULATION' }) {
  return {
    segmentId,
    name,
    startPoint: formatCoordinate(startCoord.lat || startCoord.latitude, startCoord.lng || startCoord.longitude),
    endPoint: formatCoordinate(endCoord.lat || endCoord.latitude, endCoord.lng || endCoord.longitude),
    congestionLevel: Object.values(CONGESTION_LEVELS).includes(congestionLevel) ? congestionLevel : CONGESTION_LEVELS.LOW,
    vehicleCount: Math.max(0, vehicleCount || 0),
    speedKmph: Math.max(5, speedKmph || 40),
    isSimulated: Boolean(isSimulated),
    source,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  CONGESTION_LEVELS,
  AMBULANCE_STATUSES,
  EMERGENCY_PRIORITY,
  SIGNAL_STATES,
  SOCKET_CHANNELS,
  formatCoordinate,
  createTrafficSnapshot
};
