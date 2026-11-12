const express = require('express');
const router = express.Router();
const routeOptimizationService = require('../modules/routing/services/routeOptimization.service');

// 1. POST /api/routes/optimize - Traffic-weighted priority route calculation
router.post('/optimize', async (req, res) => {
  try {
    const { cityId, origin, destination, isEmergency } = req.body;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination coordinates are required.' });
    }

    const comparison = await routeOptimizationService.computeAlternativeRoutes(
      cityId || 'chennai',
      origin,
      destination,
      isEmergency ?? true
    );

    res.json({
      status: 'SUCCESS',
      ...comparison
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/routes/alternatives - Route comparisons
router.post('/alternatives', async (req, res) => {
  try {
    const { cityId, origin, destination } = req.body;
    const comparison = await routeOptimizationService.computeAlternativeRoutes(
      cityId || 'chennai',
      origin,
      destination,
      false
    );

    res.json({
      status: 'SUCCESS',
      recommended: comparison.recommendedRoute,
      alternatives: comparison.alternativeRoutes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/routes/recalculate - Dynamic recalculation check
router.post('/recalculate', (req, res) => {
  try {
    const { emergencyId, newEtaMinutes, currentEtaMinutes } = req.body;
    const decision = routeOptimizationService.shouldRecalculate(emergencyId, newEtaMinutes, currentEtaMinutes);
    res.json({
      status: 'SUCCESS',
      ...decision
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

