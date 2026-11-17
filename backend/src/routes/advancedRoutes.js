const express = require('express');
const router = express.Router();
const emergencyPriorityService = require('../modules/emergency/services/emergencyPriority.service');
const emergencyTimelineService = require('../modules/emergency/services/emergencyTimeline.service');
const hospitalRecommendationService = require('../modules/emergency/services/hospitalRecommendation.service');
const trafficPredictionService = require('../modules/traffic/services/trafficPrediction.service');
const roadRiskIntelligenceService = require('../modules/traffic/services/roadRiskIntelligence.service');
const containerOperationsService = require('../modules/monitoring/containerOperations.service');
const workerQueue = require('../shared/workerQueue');

module.exports = function(io) {
  // 1. Calculate explainable emergency priority
  router.post('/priority/calculate', async (req, res) => {
    try {
      const evaluation = emergencyPriorityService.calculatePriority(req.body);
      res.json({ success: true, evaluation });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Incident Timeline APIs
  router.get('/timeline/:incidentId', async (req, res) => {
    try {
      const timeline = await emergencyTimelineService.getOrCreateTimeline(req.params.incidentId);
      res.json({ success: true, timeline });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/timeline/:incidentId/event', async (req, res) => {
    try {
      const { eventType, description, metadata } = req.body;
      const timeline = await emergencyTimelineService.recordEvent(
        req.params.incidentId,
        eventType,
        description,
        metadata,
        io
      );
      res.json({ success: true, timeline });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Smart Hospital Recommendations
  router.post('/hospitals/recommend', async (req, res) => {
    try {
      const { cityId = 'chennai', location = { lat: 13.0827, lng: 80.2707 }, priorityLevel = 'HIGH' } = req.body;
      const recommendations = await hospitalRecommendationService.recommendHospitals(
        cityId,
        location,
        priorityLevel
      );
      res.json({ success: true, recommendations });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Traffic Prediction (15m, 30m, 60m)
  router.get('/traffic/predictions/:cityId', async (req, res) => {
    try {
      const { cityId } = req.params;
      const { junctionId = 'JUNCTION_CENTRAL', speed = 35, hazards = 0 } = req.query;
      const predictions = await trafficPredictionService.generatePredictions(
        cityId,
        junctionId,
        parseFloat(speed),
        parseInt(hazards)
      );
      res.json({ success: true, cityId, predictions });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Road Risk Assessment & Weather Avoidance
  router.post('/traffic/road-risk', async (req, res) => {
    try {
      const { cityId = 'chennai', segmentId = 'SEG_ANNA_SALAI', segmentName = 'Anna Salai Arterial', coordinates, waterlogging = false } = req.body;
      const assessment = await roadRiskIntelligenceService.assessSegmentRisk(
        cityId,
        segmentId,
        segmentName,
        coordinates,
        { waterlogging }
      );
      res.json({ success: true, assessment });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Container Monitoring & Operations Platform
  router.get('/monitoring/overview', async (req, res) => {
    try {
      const overview = await containerOperationsService.getContainerOverview();
      res.json({ success: true, overview });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/monitoring/logs/:containerName', async (req, res) => {
    try {
      const logs = await containerOperationsService.getSafeContainerLogs(req.params.containerName, req.query.lines);
      res.json({ success: true, logs });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
