const axios = require('axios');

/**
 * Service to calculate traffic-aware routes using Google Routes API v2
 * Falls back gracefully to mathematical Haversine/Dijkstra routing if API key is not configured or rate-limited.
 */

class GoogleRoutesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_ROUTES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    this.endpoint = 'https://routes.googleapis.com/directions/v2:computeRoutes';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey !== 'your_google_routes_backend_api_key_here' && this.apiKey.trim().length > 15);
  }

  /**
   * Request route with Google Routes API
   * routingPreference: 'TRAFFIC_AWARE_OPTIMAL' | 'TRAFFIC_AWARE'
   */
  async computeTrafficRoute(origin, destination, options = {}) {
    if (!this.isConfigured()) {
      return {
        isProviderData: false,
        dataSource: 'ALGORITHMIC_GRAPH_ESTIMATE',
        message: 'Google Routes API key not configured. Using internal A*/Dijkstra routing engine.'
      };
    }

    try {
      const requestBody = {
        origin: {
          location: {
            latLng: {
              latitude: origin.lat,
              longitude: origin.lng
            }
          }
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.lat,
              longitude: destination.lng
            }
          }
        },
        travelMode: 'DRIVE',
        routingPreference: options.routingPreference || 'TRAFFIC_AWARE_OPTIMAL',
        computeAlternativeRoutes: true,
        extraComputations: ['TRAFFIC_ON_POLYLINE']
      };

      const response = await axios.post(this.endpoint, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.staticDuration,routes.travelAdvisory.speedReadingIntervals'
        },
        timeout: 8000
      });

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('No routes returned from Google Routes API.');
      }

      const primary = response.data.routes[0];
      const normalDurationSec = parseInt(primary.staticDuration?.replace('s', '') || '0', 10);
      const trafficDurationSec = parseInt(primary.duration?.replace('s', '') || '0', 10);
      const distanceMeters = primary.distanceMeters || 0;

      return {
        isProviderData: true,
        dataSource: 'GOOGLE_ROUTES_API',
        distanceKm: +(distanceMeters / 1000).toFixed(2),
        normalDurationMinutes: Math.round(normalDurationSec / 60),
        trafficDurationMinutes: Math.round(trafficDurationSec / 60),
        delayMinutes: Math.max(0, Math.round((trafficDurationSec - normalDurationSec) / 60)),
        encodedPolyline: primary.polyline?.encodedPolyline || null,
        alternativeRoutesCount: response.data.routes.length - 1
      };
    } catch (error) {
      console.warn('⚠️ Google Routes API request failed; falling back to internal graph engine:', error.message);
      return {
        isProviderData: false,
        dataSource: 'FALLBACK_ALGORITHMIC',
        error: error.message
      };
    }
  }
}

module.exports = new GoogleRoutesService();

