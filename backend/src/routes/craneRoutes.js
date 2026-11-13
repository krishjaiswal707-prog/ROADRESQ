const express = require('express');
const router = express.Router();
const craneService = require('../modules/crane/crane.service');

// 1. GET /api/crane/fleet?cityId=chennai
router.get('/fleet', (req, res) => {
  const cityId = req.query.cityId || 'chennai';
  const fleet = craneService.getFleet(cityId);
  res.json({ status: 'SUCCESS', cityId, count: fleet.length, fleet });
});

// 2. GET /api/crane/requests?cityId=chennai
router.get('/requests', async (req, res) => {
  try {
    const cityId = req.query.cityId || 'chennai';
    const list = await craneService.getRequests(cityId);
    res.json({ status: 'SUCCESS', cityId, count: list.length, requests: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST /api/crane/request
router.post('/request', async (req, res) => {
  try {
    const { cityId, citizenName, contactPhone, vehicleCategory, breakdownType, location, description } = req.body;
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({ error: 'Valid location coordinates {lat, lng} are required.' });
    }

    const created = await craneService.createRequest({
      cityId,
      citizenName,
      contactPhone,
      vehicleCategory,
      breakdownType,
      location,
      description
    });

    res.status(201).json({ status: 'SUCCESS', request: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. PATCH /api/crane/requests/:requestId/status
router.patch('/requests/:requestId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await craneService.updateStatus(req.params.requestId, status);
    if (!updated) return res.status(404).json({ error: 'Crane request not found' });
    res.json({ status: 'SUCCESS', request: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

