const { broadcastToCity, SOCKET_EVENTS } = require('../../realtime/socketManager');
const { haversineDistanceKm } = require('../../algorithms/routeOptimizer');
const { AMBULANCE_STATUSES } = require('../../shared/types/contracts');

class AmbulanceSimulator {
  constructor(ambulanceId, defaultCity = 'chennai') {
    this.ambulanceId = ambulanceId;
    this.cityId = defaultCity;
    this.status = AMBULANCE_STATUSES.AVAILABLE;
    this.currentLocation = { lat: 13.0827, lng: 80.2707 }; // WGS84 coordinates
    this.destination = null;
    this.route = [];
    this.routeIndex = 0;
    this.isGreenCorridorActive = false;
    this.speedKmph = 40;
    this.isSimulated = true;
  }

  assignEmergency(tripData) {
    this.cityId = tripData.cityId || this.cityId;
    this.status = AMBULANCE_STATUSES.EN_ROUTE;
    this.currentLocation = { ...tripData.origin };
    this.destination = { ...tripData.destination };
    this.route = tripData.selectedRoute.pathCoordinates || [];
    this.routeIndex = 0;
    this.isGreenCorridorActive = tripData.greenCorridorActive ?? true;
    this.speedKmph = this.isGreenCorridorActive ? 65 : 35;

    broadcastToCity(this.cityId, SOCKET_EVENTS.AMBULANCE_ASSIGNED, {
      ambulanceId: this.ambulanceId,
      status: this.status,
      currentLocation: this.currentLocation,
      destination: this.destination,
      greenCorridorActive: this.isGreenCorridorActive,
      isSimulated: true
    });
  }

  step() {
    if (this.status !== AMBULANCE_STATUSES.EN_ROUTE || this.route.length === 0) {
      return null;
    }

    const targetCoord = this.route[this.routeIndex];
    if (!targetCoord) return null;

    const dLat = targetCoord[0] - this.currentLocation.lat;
    const dLng = targetCoord[1] - this.currentLocation.lng;
    const dist = Math.hypot(dLat, dLng);

    // Approximate step move
    const stepSize = this.isGreenCorridorActive ? 0.0006 : 0.0003;

    if (dist < 0.0005) {
      this.routeIndex++;
      if (this.routeIndex >= this.route.length) {
        // Destination Reached
        this.status = AMBULANCE_STATUSES.ARRIVED;
        this.isGreenCorridorActive = false;

        broadcastToCity(this.cityId, SOCKET_EVENTS.AMBULANCE_ARRIVED, {
          ambulanceId: this.ambulanceId,
          destination: this.destination,
          message: `Ambulance ${this.ambulanceId} safely arrived at hospital.`
        });
        return { reachedDestination: true };
      }
    } else {
      this.currentLocation.lat += (dLat / dist) * stepSize;
      this.currentLocation.lng += (dLng / dist) * stepSize;
    }

    // Broadcast GPS ping
    broadcastToCity(this.cityId, SOCKET_EVENTS.AMBULANCE_LOCATION, {
      ambulanceId: this.ambulanceId,
      location: this.currentLocation,
      speedKmph: this.speedKmph,
      status: this.status,
      isSimulated: true,
      timestamp: new Date()
    });

    return {
      ambulanceId: this.ambulanceId,
      location: this.currentLocation,
      status: this.status
    };
  }

  release() {
    this.status = AMBULANCE_STATUSES.AVAILABLE;
    this.destination = null;
    this.route = [];
    this.routeIndex = 0;
    this.isGreenCorridorActive = false;
  }
}

module.exports = AmbulanceSimulator;

