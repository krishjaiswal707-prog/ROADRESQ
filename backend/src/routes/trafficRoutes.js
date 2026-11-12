const express = require('express');
const router = express.Router();
const trafficDataService = require('../modules/traffic/services/trafficData.service');
const { getMonitoredCorridors } = require('../config/corridors');
const TrafficObservation = require('../models/TrafficObservation');

// 1. GET /api/traffic/live?cityId=chennai
router.get('/live', async (req, res) => {
  try {
    const cityId = (req.query.cityId || 'chennai').toLowerCase();
    const observations = await trafficDataService.refreshCityTraffic(cityId);
    res.json({
      status: 'SUCCESS',
      cityId,
      count: observations.length,
      observations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/traffic/corridors?cityId=chennai
router.get('/corridors', (req, res) => {
  const cityId = (req.query.cityId || 'chennai').toLowerCase();
  const corridors = getMonitoredCorridors(cityId);
  res.json({
    status: 'SUCCESS',
    cityId,
    corridors
  });
});

// 3. GET /api/traffic/observations?cityId=chennai
router.get('/observations', async (req, res) => {
  try {
    const cityId = (req.query.cityId || 'chennai').toLowerCase();
    const limit = parseInt(req.query.limit, 10) || 50;
    const history = await TrafficObservation.find({ cityId }).sort({ observedAt: -1 }).limit(limit);
    res.json({
      status: 'SUCCESS',
      cityId,
      count: history.length,
      observations: history
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET /api/traffic/incidents?cityId=chennai
router.get('/incidents', async (req, res) => {
  try {
    const cityId = (req.query.cityId || 'chennai').toLowerCase();
    const incidents = await trafficDataService.getCityIncidents(cityId);
    res.json({
      status: 'SUCCESS',
      cityId,
      incidents
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. POST /api/traffic/refresh
router.post('/refresh', async (req, res) => {
  try {
    const cityId = (req.body.cityId || 'chennai').toLowerCase();
    const refreshed = await trafficDataService.refreshCityTraffic(cityId);
    res.json({
      status: 'SUCCESS',
      message: `Refreshed ${refreshed.length} monitored corridors for ${cityId}`,
      data: refreshed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
