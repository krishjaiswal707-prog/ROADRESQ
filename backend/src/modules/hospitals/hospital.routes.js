const express = require('express');
const router = express.Router();
const hospitalDiscoveryService = require('../../services/hospitalDiscoveryService');

// 1. GET /api/hospitals/discover?cityId=chennai
router.get('/discover', async (req, res) => {
  try {
    const cityId = req.query.cityId || 'chennai';
    const result = await hospitalDiscoveryService.discoverHospitals(cityId);
    res.json({
      status: 'SUCCESS',
      ...result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /api/hospitals/:cityId? - Existing endpoint backward-compatibility
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
