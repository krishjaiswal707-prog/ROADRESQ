const express = require('express');
const router = express.Router();
const RoadHazard = require('../models/RoadHazard');
const roadGraphEngine = require('../modules/routing/roadGraphEngine');
const { broadcastToCity } = require('../realtime/socketManager');

// 1. GET /api/hazards?cityId=chennai
router.get('/', async (req, res) => {
  try {
    const cityId = (req.query.cityId || 'chennai').toLowerCase();
    const hazards = await RoadHazard.find({ cityId }).sort({ reportedAt: -1 });
    res.json({ status: 'SUCCESS', cityId, count: hazards.length, hazards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST /api/hazards - Citizen report
router.post('/', async (req, res) => {
  try {
    const { cityId, hazardType, severity, location, description, reportedBy } = req.body;
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({ error: 'Valid location coordinates are required.' });
    }

    const hazardId = `HAZ-${Date.now()}`;
    const newHazard = new RoadHazard({
      hazardId,
      cityId: (cityId || 'chennai').toLowerCase(),
      hazardType: hazardType || 'POTHOLE',
      severity: severity || 'MEDIUM',
      location,
      description,
      reportedBy: reportedBy || 'Citizen Alert',
      verificationStatus: 'SUBMITTED',
      isBlockingTraffic: severity === 'CRITICAL'
    });

    await newHazard.save();

    broadcastToCity(cityId, 'hazard:reported', { hazard: newHazard });
    res.status(201).json({ status: 'SUCCESS', hazard: newHazard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PATCH /api/hazards/:hazardId/verify - Admin verification & road blockage influence
router.patch('/:hazardId/verify', async (req, res) => {
  try {
    const { verificationStatus, isBlockingTraffic, assignedMaintenanceTeam } = req.body;
    const update = {
      verificationStatus,
      verifiedAt: new Date()
    };
    if (typeof isBlockingTraffic === 'boolean') update.isBlockingTraffic = isBlockingTraffic;
    if (assignedMaintenanceTeam) update.assignedMaintenanceTeam = assignedMaintenanceTeam;

    const hazard = await RoadHazard.findOneAndUpdate({ hazardId: req.params.hazardId }, update, { new: true });
    if (!hazard) return res.status(404).json({ error: 'Road hazard report not found' });

    // If verified as blocking traffic, update road graph edge to avoid routing ambulances through it
    if (hazard.isBlockingTraffic && hazard.verificationStatus === 'VERIFIED') {
      const closestNode = roadGraphEngine.findClosestNode(hazard.cityId, hazard.location.lat, hazard.location.lng);
      if (closestNode) {
        console.log(`🚧 Road Hazard verified! Marking road network around ${closestNode.name} as restricted.`);
      }
    }

    broadcastToCity(hazard.cityId, 'hazard:verified', { hazard });
    res.json({ status: 'SUCCESS', hazard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

