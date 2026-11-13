const axios = require('axios');
const { getCityConfig } = require('../config/cities');

/**
 * Hospital Discovery Service using OpenStreetMap Overpass API
 * Discovers real hospitals, emergency clinics, and trauma centers around target cities.
 * Falls back safely to configured emergency trauma hospital registries if Overpass is busy.
 */
class HospitalDiscoveryService {
  constructor() {
    this.overpassEndpoint = 'https://overpass-api.de/api/interpreter';
    this.timeoutMs = 6000;
    this.cache = new Map(); // cityId -> { hospitals, cachedAt }
    this.CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  }

  async discoverHospitals(cityId) {
    const normalized = (cityId || 'chennai').toLowerCase();
    const city = getCityConfig(normalized);

    const cached = this.cache.get(normalized);
    if (cached && (Date.now() - cached.cachedAt < this.CACHE_TTL_MS)) {
      return {
        cityId: normalized,
        cityName: city.cityName,
        source: 'OVERPASS_CACHE',
        count: cached.hospitals.length,
        hospitals: cached.hospitals
      };
    }

    // Overpass QL query: hospitals and clinics within 10km radius of city center
    const radiusMeters = 10000;
    const query = `
      [out:json][timeout:5];
      (
        node["amenity"="hospital"](around:${radiusMeters},${city.center.lat},${city.center.lng});
        node["amenity"="clinic"](around:${radiusMeters},${city.center.lat},${city.center.lng});
      );
      out body 25;
    `;

    try {
      const response = await axios.post(this.overpassEndpoint, `data=${encodeURIComponent(query)}`, {
        timeout: this.timeoutMs,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const elements = response.data?.elements || [];
      if (elements.length > 0) {
        const liveHospitals = elements
          .filter(e => e.tags && (e.tags.name || e.tags['name:en']))
          .map(e => ({
            id: `OSM_HOSP_${e.id}`,
            name: e.tags.name || e.tags['name:en'],
            lat: e.lat,
            lng: e.lon,
            emergencyBeds: 25, // Baseline demo attribute
            traumaLevel: e.tags.emergency === 'yes' ? 1 : 2,
            hasEmergencyDepartment: e.tags.emergency === 'yes',
            phone: e.tags.phone || e.tags['contact:phone'] || '108 / Emergency Dispatch',
            address: e.tags['addr:street'] || `${city.cityName} Metropolitan Area`,
            source: 'OPEN_STREET_MAP_OVERPASS'
          }));

        // Merge with our verified trauma centers
        const merged = [...city.hospitals, ...liveHospitals];
        // Deduplicate by name
        const uniqueHospitals = Array.from(new Map(merged.map(h => [h.name.toLowerCase().trim(), h])).values());

        this.cache.set(normalized, { hospitals: uniqueHospitals, cachedAt: Date.now() });

        return {
          cityId: normalized,
          cityName: city.cityName,
          source: 'OPEN_STREET_MAP_OVERPASS_LIVE',
          count: uniqueHospitals.length,
          hospitals: uniqueHospitals
        };
      }
    } catch (error) {
      console.warn(`⚠️ Overpass API unavailable (${error.message}). Returning verified hospital registry for ${city.cityName}.`);
    }

    // Graceful Fallback
    return {
      cityId: normalized,
      cityName: city.cityName,
      source: 'VERIFIED_HOSPITAL_REGISTRY',
      count: city.hospitals.length,
      hospitals: city.hospitals
    };
  }
}

module.exports = new HospitalDiscoveryService();

