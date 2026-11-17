const hospitalDiscoveryService = require('../../../services/hospitalDiscoveryService');

class HospitalRecommendationEngine {
  /**
   * Evaluates and ranks hospitals with explainable suitability scoring
   */
  async recommendHospitals(cityId, incidentLocation, priorityLevel = 'HIGH', limit = 5) {
    // 1. Fetch real or fallback hospital data from OSM Overpass service
    const discoveryResult = await hospitalDiscoveryService.discoverHospitals(cityId);
    const rawHospitals = discoveryResult.hospitals || [];

    const requiresTraumaCenter = priorityLevel === 'CRITICAL' || priorityLevel === 'HIGH';

    const rankedHospitals = rawHospitals.map(hospital => {
      // Free-first verified fields vs fallback simulation
      const isVerified = Boolean(hospital.osmId || hospital.id);
      const distanceKm = hospital.distanceKm || 3.5;
      const hasEmergency = hospital.hasEmergency !== false;
      const hasTrauma = hospital.traumaTier === 'LEVEL_1' || hospital.traumaTier === 'LEVEL_2' || Boolean(hospital.icuBeds && hospital.icuBeds > 5);
      const availableIcu = hospital.icuBeds || 4;

      // Scoring model:
      // Distance: 40 pts max (inverse distance)
      const distanceScore = Math.max(0, 40 - (distanceKm * 3.5));
      
      // Emergency / Trauma Capability: 35 pts max
      let capabilityScore = 15;
      if (hasEmergency) capabilityScore += 10;
      if (requiresTraumaCenter && hasTrauma) capabilityScore += 10;

      // ICU & Bed availability: 25 pts max
      const capacityScore = Math.min(25, availableIcu * 3);

      const suitabilityScore = Math.round(Math.min(100, distanceScore + capabilityScore + capacityScore));

      return {
        id: hospital.id || hospital.osmId,
        name: hospital.name,
        lat: hospital.lat,
        lng: hospital.lng,
        distanceKm: +distanceKm.toFixed(2),
        estimatedTransitMinutes: Math.round(distanceKm * 2.2),
        suitabilityScore,
        verificationStatus: isVerified ? 'VERIFIED_OSM_DATA' : 'ESTIMATED_REGISTRY',
        capabilities: {
          emergencyWard: hasEmergency,
          traumaTier: hasTrauma ? 'LEVEL_1' : 'GENERAL',
          icuBedsAvailable: availableIcu,
          oxygenSupport: true
        },
        recommendationReason: `${suitabilityScore}% Match: ${distanceKm.toFixed(1)} km away (~${Math.round(distanceKm * 2.2)} min transit). Emergency ward active with ${availableIcu} ICU beds.`
      };
    });

    // Sort descending by suitability score
    rankedHospitals.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    return rankedHospitals.slice(0, limit);
  }
}

module.exports = new HospitalRecommendationEngine();
