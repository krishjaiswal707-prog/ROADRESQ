const TrafficSignal = require('../models/TrafficSignal');
const TrafficData = require('../models/TrafficData');
const { classifyCongestion } = require('../algorithms/trafficPredictor');
const { BASE_EDGES, NETWORK_NODES, haversineDistanceKm } = require('../algorithms/routeOptimizer');
const { SUPPORTED_CITIES } = require('../config/cities');

class LiveSimulationEngine {
  constructor(io, routeOptimizer) {
    this.io = io;
    this.routeOptimizer = routeOptimizer;
    this.isRunning = false;
    this.intervalId = null;

    // Active ambulance state
    this.ambulance = {
      id: 'AMB-RESQ-108',
      cityId: 'chennai',
      isActive: false,
      tripId: null,
      currentLocation: { lat: 13.0827, lng: 80.2707 },
      destination: { lat: 13.0805, lng: 80.2778 },
      routeIndex: 0,
      path: [],
      greenCorridorEnabled: false,
      speedKmph: 0
    };

    // Simulated background vehicles
    this.vehicles = [];
    this.initVehicles();
  }

  initVehicles() {
    this.vehicles = [
      { id: 'V1', lat: 13.0827, lng: 80.2707, targetLat: 13.0805, targetLng: 80.2778, speed: 0.0002 },
      { id: 'V2', lat: 13.0601, lng: 80.2505, targetLat: 13.0519, targetLng: 80.2514, speed: 0.00018 },
      { id: 'V3', lat: 13.0405, lng: 80.2337, targetLat: 13.0076, targetLng: 80.2038, speed: 0.00022 },
      { id: 'V4', lat: 12.9716, lng: 77.5946, targetLat: 12.9634, targetLng: 77.5755, speed: 0.00025 }
    ];
  }

  async seedSignals() {
    for (const [cityKey, cityData] of Object.entries(SUPPORTED_CITIES)) {
      if (cityData.keySignals && Array.isArray(cityData.keySignals)) {
        for (const sig of cityData.keySignals) {
          await TrafficSignal.findOneAndUpdate(
            { signalId: sig.signalId },
            {
              signalId: sig.signalId,
              cityId: cityKey,
              name: sig.name,
              location: sig.location,
              state: 'RED',
              isGreenCorridorOverridden: false
            },
            { upsert: true, new: true }
          );
        }
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      try {
        await this.step();
      } catch (err) {
        console.error('Simulation step error:', err.message);
      }
    }, 2500); // 2.5s real-time tick

    console.log('🚦 Live Traffic Simulation Engine running.');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  async step() {
    // 1. Advance regular traffic signals unless overridden by green corridor
    const signals = await TrafficSignal.find();
    for (const sig of signals) {
      if (!sig.isGreenCorridorOverridden) {
        // Normal cycle: RED -> GREEN -> YELLOW -> RED
        const nextState = sig.state === 'RED' ? 'GREEN' : sig.state === 'GREEN' ? 'YELLOW' : 'RED';
        sig.state = nextState;
        sig.lastStateChange = new Date();
        await sig.save();
      }
    }

    // 2. Generate simulated live traffic density for segments
    const segmentUpdates = [];
    for (const edge of BASE_EDGES) {
      const u = NETWORK_NODES[edge.from];
      const v = NETWORK_NODES[edge.to];
      const vehicleCount = Math.floor(Math.random() * 38) + 4;
      const avgSpeed = Math.max(10, Math.floor(50 - (vehicleCount * 0.95)));
      const level = classifyCongestion(vehicleCount, avgSpeed);

      this.routeOptimizer.updateSegmentTraffic(edge.segmentId, level, avgSpeed);

      const segmentRecord = {
        segmentId: edge.segmentId,
        name: edge.name,
        coordinates: {
          start: { lat: u.lat, lng: u.lng },
          end: { lat: v.lat, lng: v.lng }
        },
        congestionLevel: level,
        vehicleCount,
        averageSpeedKmph: avgSpeed,
        jamFactor: +(1 + (vehicleCount / 10)).toFixed(1),
        isSimulated: true,
        recordedAt: new Date()
      };

      await TrafficData.create(segmentRecord);
      segmentUpdates.push(segmentRecord);
    }

    // 3. Update simulated civilian vehicle coordinates
    for (const v of this.vehicles) {
      const dLat = v.targetLat - v.lat;
      const dLng = v.targetLng - v.lng;
      const dist = Math.hypot(dLat, dLng);
      if (dist < 0.0005) {
        // Swap direction
        const tempLat = v.lat;
        const tempLng = v.lng;
        v.lat = v.targetLat;
        v.lng = v.targetLng;
        v.targetLat = tempLat;
        v.targetLng = tempLng;
      } else {
        v.lat += (dLat / dist) * v.speed;
        v.lng += (dLng / dist) * v.speed;
      }
    }

    // 4. Advance Emergency Ambulance if active
    if (this.ambulance.isActive && this.ambulance.path.length > 0) {
      const targetPoint = this.ambulance.path[this.ambulance.routeIndex];
      if (targetPoint) {
        const dLat = targetPoint[0] - this.ambulance.currentLocation.lat;
        const dLng = targetPoint[1] - this.ambulance.currentLocation.lng;
        const dist = Math.hypot(dLat, dLng);

        if (dist < 0.0006) {
          // Point reached
          this.ambulance.routeIndex++;
          if (this.ambulance.routeIndex >= this.ambulance.path.length) {
            // Ambulance Arrived at Destination
            this.ambulance.isActive = false;
            this.ambulance.routeIndex = 0;
            this.ambulance.greenCorridorEnabled = false;

            // Reset all green corridor overrides
            await TrafficSignal.updateMany({}, { isGreenCorridorOverridden: false });

            this.io.emit('ambulance-arrived', {
              ambulanceId: this.ambulance.id,
              message: 'Ambulance safely reached destination hospital. Green corridor released.'
            });
          }
        } else {
          // Move ambulance along path (speed is fast under green corridor)
          const moveSpeed = this.ambulance.greenCorridorEnabled ? 0.00065 : 0.0003;
          this.ambulance.currentLocation.lat += (dLat / dist) * moveSpeed;
          this.ambulance.currentLocation.lng += (dLng / dist) * moveSpeed;
        }

        // Check proximity to signals for priority preemption
        if (this.ambulance.greenCorridorEnabled) {
          for (const sig of signals) {
            const distKm = haversineDistanceKm(
              this.ambulance.currentLocation.lat,
              this.ambulance.currentLocation.lng,
              sig.location.lat,
              sig.location.lng
            );
            // Within 1.0 km, pre-empt signal to GREEN
            if (distKm <= 1.0) {
              if (sig.state !== 'GREEN' || !sig.isGreenCorridorOverridden) {
                sig.state = 'GREEN';
                sig.isGreenCorridorOverridden = true;
                await sig.save();
              }
            } else if (distKm > 1.8 && sig.isGreenCorridorOverridden) {
              // Once far past, restore normal cycle
              sig.isGreenCorridorOverridden = false;
              await sig.save();
            }
          }
        }
      }
    }

    // 5. Broadcast synchronized state to all connected dashboard clients
    const latestSignals = await TrafficSignal.find();
    this.io.emit('traffic-feed-update', {
      segments: segmentUpdates,
      signals: latestSignals,
      vehicles: this.vehicles,
      ambulance: this.ambulance,
      timestamp: new Date()
    });
  }

  // API Trigger to dispatch ambulance & engage Green Corridor
  async dispatchAmbulance(tripData, cityId = 'chennai') {
    this.ambulance.isActive = true;
    this.ambulance.cityId = cityId;
    this.ambulance.tripId = tripData.tripId;
    this.ambulance.currentLocation = { lat: tripData.origin.lat, lng: tripData.origin.lng };
    this.ambulance.destination = { lat: tripData.destination.lat, lng: tripData.destination.lng };
    this.ambulance.path = tripData.selectedRoute.pathCoordinates;
    this.ambulance.routeIndex = 0;
    this.ambulance.greenCorridorEnabled = true;
    this.ambulance.speedKmph = 68;

    // Immediately pre-empt signals on this corridor
    if (tripData.controlledSignals && tripData.controlledSignals.length > 0) {
      for (const sigId of tripData.controlledSignals) {
        await TrafficSignal.findOneAndUpdate(
          { signalId: sigId },
          { state: 'GREEN', isGreenCorridorOverridden: true, lastStateChange: new Date() }
        );
      }
    }

    const updatedSignals = await TrafficSignal.find();
    this.io.emit('green-corridor-activated', {
      tripId: tripData.tripId,
      ambulance: this.ambulance,
      signals: updatedSignals
    });

    return this.ambulance;
  }
}

module.exports = LiveSimulationEngine;

