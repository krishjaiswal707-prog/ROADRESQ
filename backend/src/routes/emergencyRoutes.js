const express = require('express');
const router = express.Router();
const EmergencyTrip = require('../models/EmergencyTrip');
const ambulancePriorityEngine = require('../modules/emergency/services/ambulancePriority.engine');
const routeOptimizationService = require('../modules/routing/services/routeOptimization.service');
const { getCityConfig } = require('../config/cities');
const TrafficSignal = require('../models/TrafficSignal');

module.exports = (routeOptimizer, simulationEngine) => {
  // Available ambulances for city
  router.get('/available-ambulances', (req, res) => {
    const cityId = req.query.cityId || 'chennai';
    const list = ambulancePriorityEngine.getAvailableAmbulances(cityId);
    res.json({ status: 'SUCCESS', cityId, count: list.length, ambulances: list });
  });

  // 1. Calculate & compare optimal emergency routes (Dijkstra/A* with traffic weights)
  router.post('/optimize-route', async (req, res) => {
    try {
      const { origin, destination, cityId } = req.body;
      if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination coordinates are required.' });
      }

      const activeCityId = cityId || 'chennai';
      const comparison = await routeOptimizationService.computeAlternativeRoutes(
        activeCityId,
        origin,
        destination,
        true
      );

      res.json({
        recommendedRoute: comparison.recommendedRoute,
        alternativeRoutes: comparison.alternativeRoutes
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Dispatch Ambulance & Activate Priority Green Corridor
  router.post('/dispatch', async (req, res) => {
    try {
      const { origin, destination, ambulanceId, cityId } = req.body;
      if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination coordinates are required.' });
      }

      const activeCityId = (cityId || 'chennai').toLowerCase();
      const tripId = `TRIP-${Date.now()}`;

      // Calculate path & time savings via multi-city OSRM + Graph Engine
      const comparison = await routeOptimizationService.computeAlternativeRoutes(
        activeCityId,
        origin,
        destination,
        true
      );
      const rec = comparison.recommendedRoute;

      // Identify signals along route for this city
      const cityConfig = getCityConfig(activeCityId);
      const citySignals = cityConfig.keySignals || [];
      const signalsToPreempt = citySignals.map(s => s.signalId);

      const trip = new EmergencyTrip({
        tripId,
        ambulanceId: ambulanceId || 'AMB-RESQ-108',
        origin: { name: origin.name || `${activeCityId.toUpperCase()} Incident Site`, lat: origin.lat, lng: origin.lng },
        destination: { name: destination.name || 'Hospital Trauma Center', lat: destination.lat, lng: destination.lng },
        currentLocation: { lat: origin.lat, lng: origin.lng },
        status: 'EN_ROUTE',
        greenCorridorActive: true,
        controlledSignals: signalsToPreempt,
        selectedRoute: {
          pathCoordinates: rec.pathCoordinates,
          distanceKm: rec.distanceKm,
          estimatedMinutes: rec.trafficDurationMinutes || rec.estimatedMinutes,
          standardMinutesWithoutCorridor: rec.normalDurationMinutes || rec.standardMinutesWithoutCorridor,
          timeSavedMinutes: rec.timeSavedMinutes
        },
        alternativeRoutes: comparison.alternativeRoutes
      });

      await trip.save();

      // Trigger simulation engine to start moving the ambulance and clearing signals
      await simulationEngine.dispatchAmbulance(trip, activeCityId);

      // Return both trip and the routeOptimization payload expected by frontend
      res.status(201).json({
        message: 'Ambulance dispatched and Green Corridor activated.',
        trip,
        routeOptimization: {
          distanceKm: rec.distanceKm,
          estimatedMinutes: rec.trafficDurationMinutes || rec.estimatedMinutes,
          standardMinutesWithoutCorridor: rec.normalDurationMinutes || rec.standardMinutesWithoutCorridor,
          timeSavedMinutes: rec.timeSavedMinutes,
          pathCoordinates: rec.pathCoordinates,
          alternatives: comparison.alternativeRoutes
        }
      });
    } catch (err) {
      console.error('Dispatch error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Get current active emergency trip
  router.get('/active', async (req, res) => {
    try {
      const activeTrip = await EmergencyTrip.findOne({ status: 'EN_ROUTE' }).sort({ startedAt: -1 });
      res.json(activeTrip || { status: 'IDLE', ambulance: simulationEngine.ambulance });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Cancel / Release Green Corridor manually
  router.post('/cancel', async (req, res) => {
    try {
      simulationEngine.ambulance.isActive = false;
      simulationEngine.ambulance.greenCorridorEnabled = false;
      simulationEngine.ambulance.routeIndex = 0;

      await EmergencyTrip.updateMany({ status: 'EN_ROUTE' }, { status: 'CANCELLED', completedAt: new Date() });
      const TrafficSignal = require('../models/TrafficSignal');
      await TrafficSignal.updateMany({}, { isGreenCorridorOverridden: false });

      res.json({ message: 'Emergency trip cancelled and Green Corridor released.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

