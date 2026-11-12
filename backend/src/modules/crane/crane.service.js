const { haversineDistanceKm } = require('../../algorithms/routeOptimizer');
const CraneRequest = require('../../models/CraneRequest');
const { broadcastToCity } = require('../../realtime/socketManager');

class CraneAssistanceService {
  constructor() {
    this.fleet = [
      {
        id: 'CRANE-CHN-01',
        cityId: 'chennai',
        name: 'Chennai QuickTow Recovery Flatbed',
        serviceType: 'FLATBED_HYDRAULIC',
        capacityTons: 5.0,
        phone: '+91 94441 22334',
        location: { lat: 13.0827, lng: 80.2707 },
        status: 'AVAILABLE'
      },
      {
        id: 'CRANE-CHN-02',
        cityId: 'chennai',
        name: 'South Coast Heavy Duty Lifter',
        serviceType: 'HEAVY_WINCH_CRANE',
        capacityTons: 15.0,
        phone: '+91 98402 99881',
        location: { lat: 13.0182, lng: 80.1772 },
        status: 'AVAILABLE'
      },
      {
        id: 'CRANE-BLR-01',
        cityId: 'bengaluru',
        name: 'Silicon City Auto Hauler',
        serviceType: 'WHEEL_LIFT_TOW',
        capacityTons: 3.5,
        phone: '+91 99001 55667',
        location: { lat: 12.9716, lng: 77.5946 },
        status: 'AVAILABLE'
      },
      {
        id: 'CRANE-CBE-01',
        cityId: 'coimbatore',
        name: 'Kovai Express Breakdown Rig',
        serviceType: 'FLATBED_HYDRAULIC',
        capacityTons: 6.0,
        phone: '+91 97890 12345',
        location: { lat: 11.0168, lng: 76.9558 },
        status: 'AVAILABLE'
      }
    ];
  }

  getFleet(cityId) {
    const normalized = (cityId || 'chennai').toLowerCase();
    return this.fleet.filter(c => c.cityId === normalized);
  }

  async createRequest({ cityId, citizenName, contactPhone, vehicleCategory, breakdownType, location, description }) {
    const requestId = `CRN-${Date.now()}`;
    const normalizedCity = (cityId || 'chennai').toLowerCase();

    // Auto-recommend nearest available crane
    const available = this.fleet.filter(c => c.cityId === normalizedCity && c.status === 'AVAILABLE');
    let nearestCrane = null;
    let minDistance = Infinity;

    for (const c of available) {
      const d = haversineDistanceKm(c.location.lat, c.location.lng, location.lat, location.lng);
      if (d < minDistance) {
        minDistance = d;
        nearestCrane = c;
      }
    }

    const etaMinutes = nearestCrane ? Math.max(5, Math.round((minDistance / 30) * 60)) : 20;

    const newRequest = new CraneRequest({
      requestId,
      cityId: normalizedCity,
      citizenName: citizenName || 'Citizen Motorist',
      contactPhone: contactPhone || '+91 98765 43210',
      vehicleCategory: vehicleCategory || 'SEDAN_HATCHBACK',
      breakdownType: breakdownType || 'ENGINE_FAILURE',
      location,
      description: description || 'Vehicle immobilized, roadside recovery requested.',
      assignedCraneId: nearestCrane ? nearestCrane.id : null,
      assignedCraneName: nearestCrane ? nearestCrane.name : null,
      status: nearestCrane ? 'ASSIGNED' : 'PENDING',
      etaMinutes
    });

    await newRequest.save();

    if (nearestCrane) {
      nearestCrane.status = 'EN_ROUTE';
    }

    broadcastToCity(normalizedCity, 'crane:updated', {
      requestId,
      request: newRequest,
      crane: nearestCrane
    });

    return newRequest;
  }

  async getRequests(cityId) {
    const normalized = (cityId || 'chennai').toLowerCase();
    return CraneRequest.find({ cityId: normalized }).sort({ createdAt: -1 });
  }

  async updateStatus(requestId, status) {
    const req = await CraneRequest.findOneAndUpdate({ requestId }, { status }, { new: true });
    if (req && status === 'COMPLETED') {
      const crane = this.fleet.find(c => c.id === req.assignedCraneId);
      if (crane) crane.status = 'AVAILABLE';
    }
    return req;
  }
}

module.exports = new CraneAssistanceService();
