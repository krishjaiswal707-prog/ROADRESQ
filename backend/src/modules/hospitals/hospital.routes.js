const express = require('express');
const router = express.Router();
const hospitalDiscoveryService = require('../../services/hospitalDiscoveryService');

// 1. GET /api/hospitals/discover?cityId=chennai&refresh=false
router.get('/discover', async (req, res) => {
  try {
    const cityId = req.query.cityId || 'chennai';
    const forceRefresh = req.query.refresh === 'true';
    const result = await hospitalDiscoveryService.discoverHospitals(cityId, forceRefresh);
    res.json({
      status: 'SUCCESS',
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/hospitals/rank - Smart Hospital Ranking Engine (Task 3 & Task 7)
router.post('/rank', async (req, res) => {
  try {
    const { cityId = 'chennai', origin, emergencyType = 'CRITICAL', specialty } = req.body;
    if (!origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number') {
      return res.status(400).json({ error: 'Valid emergency origin coordinates {lat, lng} are required.' });
    }

    const evaluation = await hospitalDiscoveryService.rankHospitalsForEmergency(
      cityId,
      origin,
      emergencyType,
      specialty
    );

    res.json({
      status: 'SUCCESS',
      ...evaluation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /api/hospitals/:cityId? - Existing endpoint backward-compatibility
router.get('/:cityId?', async (req, res) => {
  try {
    const cityId = req.params.cityId || req.query.cityId || 'chennai';
    const result = await hospitalDiscoveryService.discoverHospitals(cityId);
    res.json({
      cityId: result.cityId,
      cityName: result.cityName,
      count: result.count,
      source: result.source,
      hospitals: result.hospitals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
