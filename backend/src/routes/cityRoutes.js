const express = require('express');
const router = express.Router();
const { listAvailableCities, getCityConfig } = require('../config/cities');
const googleRoutesService = require('../services/googleRoutesService');

// 1. List all supported cities
router.get('/', (req, res) => {
  res.json({
    status: 'SUCCESS',
    cities: listAvailableCities()
  });
});

// 2. Get specific city config with hospitals & signals
router.get('/:cityId', (req, res) => {
  const city = getCityConfig(req.params.cityId);
  res.json({
    status: 'SUCCESS',
    city
  });
});

// 3. Test Google Routes API connectivity for a selected city
router.post('/:cityId/test-route', async (req, res) => {
  try {
    const city = getCityConfig(req.params.cityId);
    const origin = city.center;
    const dest = city.hospitals[0] ? { lat: city.hospitals[0].lat, lng: city.hospitals[0].lng } : city.center;

    const result = await googleRoutesService.computeTrafficRoute(origin, dest);
    res.json({
      city: city.cityName,
      googleConfigured: googleRoutesService.isConfigured(),
      routeAnalysis: result
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

