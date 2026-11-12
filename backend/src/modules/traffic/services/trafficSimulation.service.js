const TrafficData = require('../../models/TrafficData');
const TrafficSignal = require('../../models/TrafficSignal');
const { classifyCongestion } = require('../../algorithms/trafficPredictor');
const { BASE_EDGES, NETWORK_NODES } = require('../../algorithms/routeOptimizer');
const { broadcastToCity, SOCKET_EVENTS } = require('../../realtime/socketManager');
const { createTrafficSnapshot } = require('../../shared/types/contracts');

class TrafficSimulationService {
  constructor(defaultCity = 'chennai') {
    this.cityId = defaultCity;
    this.isRunning = false;
    this.intervalId = null;
  }

  async seedSignals() {
    const defaultSignals = [
      { signalId: 'SIG-GANDHI', name: 'Gandhipuram Junction Signal', location: { lat: 11.0168, lng: 76.9558 } },
      { signalId: 'SIG-CROSSCUT', name: 'Cross Cut Road Signal', location: { lat: 11.0145, lng: 76.9610 } },
      { signalId: 'SIG-AVINASHI', name: 'Avinashi Flyover Intersection', location: { lat: 11.0110, lng: 76.9680 } },
      { signalId: 'SIG-LAKSHMI', name: 'Lakshmi Mills Junction Signal', location: { lat: 11.0085, lng: 76.9805 } },
      { signalId: 'SIG-100FT', name: '100 Feet Road Signal', location: { lat: 11.0210, lng: 76.9625 } }
    ];

    for (const sig of defaultSignals) {
      await TrafficSignal.findOneAndUpdate(
        { signalId: sig.signalId },
        { ...sig, state: 'RED' },
        { upsert: true, new: true }
      );
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      try {
        await this.step();
      } catch (err) {
        console.error('Traffic simulation step error:', err.message);
      }
    }, 3000);

    console.log(`🚦 Modular TrafficSimulationService active for city: ${this.cityId}`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  async step() {
    // 1. Advance Signals in Normal automation cycle
    const signals = await TrafficSignal.find();
    for (const sig of signals) {
      if (!sig.isGreenCorridorOverridden) {
        sig.state = sig.state === 'RED' ? 'GREEN' : sig.state === 'GREEN' ? 'YELLOW' : 'RED';
        sig.lastStateChange = new Date();
        await sig.save();
      }
    }

    // 2. Generate traffic fluctuations for segments
    const segmentSnapshots = [];
    for (const edge of BASE_EDGES) {
      const u = NETWORK_NODES[edge.from];
      const v = NETWORK_NODES[edge.to];
      const vehicleCount = Math.floor(Math.random() * 35) + 5;
      const speedKmph = Math.max(12, Math.floor(52 - (vehicleCount * 0.9)));
      const level = classifyCongestion(vehicleCount, speedKmph);

      const snapshot = createTrafficSnapshot({
        segmentId: edge.segmentId,
        name: edge.name,
        startCoord: u,
        endCoord: v,
        congestionLevel: level,
        vehicleCount,
        speedKmph,
        isSimulated: true
      });

      segmentSnapshots.push(snapshot);
    }

    // 3. Broadcast to city room & legacy feed
    broadcastToCity(this.cityId, SOCKET_EVENTS.TRAFFIC_UPDATED, {
      cityId: this.cityId,
      segments: segmentSnapshots,
      signals,
      isSimulated: true
    });
  }
}

module.exports = TrafficSimulationService;

