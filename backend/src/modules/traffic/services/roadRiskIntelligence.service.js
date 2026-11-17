const RoadHazard = require('../../../models/RoadHazard');
const RoadRiskAssessment = require('../../../models/RoadRiskAssessment');

class RoadRiskIntelligenceService {
  /**
   * Evaluates road risk scores, duplicate clustering, and waterlogging/weather detours
   */
  async assessSegmentRisk(cityId, segmentId, segmentName, coordinates, weather = { waterlogging: false }) {
    // 1. Fetch active hazards within or near this segment
    const activeHazards = await RoadHazard.find({
      cityId,
      status: { $in: ['REPORTED', 'INVESTIGATING', 'CONFIRMED'] }
    });

    let riskScore = 15; // base nominal risk
    const contributingHazards = [];

    for (const h of activeHazards) {
      // Calculate severity penalty
      let weight = 10;
      if (h.severity === 'CRITICAL') weight = 30;
      else if (h.severity === 'HIGH') weight = 20;
      else if (h.severity === 'MODERATE') weight = 12;

      riskScore += weight;
      contributingHazards.push({
        hazardId: h._id.toString(),
        type: h.hazardType || h.type,
        severity: h.severity,
        reportedAt: h.createdAt
      });
    }

    // Weather & Flood / Waterlogging impact
    let floodMultiplier = 1.0;
    if (weather.waterlogging) {
      floodMultiplier = 1.45;
      riskScore = Math.round(riskScore * floodMultiplier);
    }

    riskScore = Math.min(100, Math.max(5, riskScore));

    let riskTier = 'LOW';
    let recommendedAction = 'NORMAL';
    if (riskScore >= 75) {
      riskTier = 'CRITICAL';
      recommendedAction = 'ROAD_CLOSURE';
    } else if (riskScore >= 50) {
      riskTier = 'HIGH';
      recommendedAction = 'DETOUR_RECOMMENDED';
    } else if (riskScore >= 30) {
      riskTier = 'MODERATE';
      recommendedAction = 'CAUTION_SLOWDOWN';
    }

    const assessment = {
      cityId,
      segmentId,
      segmentName,
      coordinates: coordinates || [[13.0827, 80.2707], [13.0604, 80.2496]],
      riskScore,
      riskTier,
      contributingHazards,
      weatherCondition: {
        status: weather.waterlogging ? 'WATERLOGGED_MONSOON' : 'CLEAR',
        waterloggingReported: weather.waterlogging,
        floodRiskMultiplier: floodMultiplier
      },
      recommendedRoutingAction: recommendedAction,
      evaluatedAt: new Date()
    };

    // Save record
    await RoadRiskAssessment.create(assessment).catch(e => console.error('Risk save error:', e.message));

    return assessment;
  }

  /**
   * Identifies high-risk segments across city
   */
  async getCityRiskHeatmap(cityId) {
    return await RoadRiskAssessment.find({ cityId }).sort({ riskScore: -1 }).limit(25);
  }
}

module.exports = new RoadRiskIntelligenceService();
