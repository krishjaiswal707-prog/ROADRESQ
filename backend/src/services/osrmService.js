const axios = require('axios');
const https = require('https');
const http = require('http');
const roadGraphEngine = require('../modules/routing/roadGraphEngine');
const { dijkstraShortestPath } = require('../modules/routing/algorithms/dijkstraEngine');

const httpsAgent = new https.Agent({ family: 4, keepAlive: true });
const httpAgent = new http.Agent({ family: 4, keepAlive: true });

/**
 * OSRM Road-based Routing Service
 * Connects to Open Source Routing Machine for real road network geometries, distances, and free-flow duration.
 * NOTE: OSRM calculates static road network routes and geometry, NOT live traffic speeds.
 */
class OSRMService {
  constructor() {
    this.baseUrl = (process.env.OSRM_BASE_URL || 'https://router.project-osrm.org').replace(/\/$/, '');
    this.timeoutMs = parseInt(process.env.OSRM_REQUEST_TIMEOUT_MS, 10) || 6000;
  }

  /**
   * Request driving route between origin and destination
   * Coordinates: { lat: number, lng: number }
   */
  async getRoute(origin, destination, options = {}) {
    if (!origin || !destination || isNaN(origin.lat) || isNaN(origin.lng) || isNaN(destination.lat) || isNaN(destination.lng)) {
      throw new Error('Invalid origin or destination coordinates supplied to OSRM.');
    }

    // OSRM expects: {longitude},{latitude};{longitude},{latitude}
    const coordsStr = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
    const url = `${this.baseUrl}/route/v1/driving/${coordsStr}?overview=full&geometries=geojson&alternatives=${options.alternatives ? 'true' : 'false'}`;

    try {
      const isHttps = url.startsWith('https:');
      const response = await axios.get(url, {
        timeout: this.timeoutMs,
        httpsAgent: isHttps ? httpsAgent : undefined,
        httpAgent: !isHttps ? httpAgent : undefined,
        headers: {
          'User-Agent': 'RoadResqAI/1.0 (emergency-routing-assistance)'
        }
      });

      if (response.data?.code !== 'Ok' || !response.data?.routes || response.data.routes.length === 0) {
        throw new Error(`OSRM responded with code: ${response.data?.code || 'NO_ROUTES'}`);
      }

      const primary = response.data.routes[0];
      // GeoJSON coordinates format is [lng, lat], convert to Leaflet standard [lat, lng]
      const pathCoordinates = primary.geometry.coordinates.map(coord => [coord[1], coord[0]]);

      const alternatives = (response.data.routes.slice(1) || []).map((alt, idx) => ({
        routeId: `OSRM_ALT_${idx + 1}`,
        name: `OSRM Alternative ${idx + 1}`,
        distanceMeters: Math.round(alt.distance),
        durationSeconds: Math.round(alt.duration),
        pathCoordinates: alt.geometry.coordinates.map(c => [c[1], c[0]])
      }));

      return {
        isProviderData: true,
        provider: 'OSRM',
        source: 'OPEN_STREET_MAP_OSRM',
        distanceMeters: Math.round(primary.distance),
        distanceKm: +( (primary.distance / 1000).toFixed(2) ),
        normalDurationSeconds: Math.round(primary.duration),
        normalDurationMinutes: Math.max(1, Math.round(primary.duration / 60)),
        pathCoordinates,
        geojsonGeometry: primary.geometry,
        alternatives
      };
    } catch (error) {
      console.warn(`⚠️ OSRM request failed (${error.message}). Falling back to internal Road Graph Engine.`);
      return this.fallbackGraphRoute(origin, destination, options.cityId || 'chennai');
    }
  }

  /**
   * Internal Road Graph Fallback if OSRM endpoint is temporarily unreachable
   */
  fallbackGraphRoute(origin, destination, cityId) {
    const graph = roadGraphEngine.getCityGraph(cityId);
    const startNode = roadGraphEngine.findClosestNode(cityId, origin.lat, origin.lng);
    const targetNode = roadGraphEngine.findClosestNode(cityId, destination.lat, destination.lng);

    if (!startNode || !targetNode) {
      return {
        isProviderData: false,
        provider: 'INTERNAL_GRAPH_FALLBACK',
        source: 'ROAD_GRAPH_ENGINE',
        distanceMeters: 5000,
        distanceKm: 5.0,
        normalDurationSeconds: 600,
        normalDurationMinutes: 10,
        pathCoordinates: [[origin.lat, origin.lng], [destination.lat, destination.lng]]
      };
    }

    const pathResult = dijkstraShortestPath(graph.nodes, graph.edges, startNode.id, targetNode.id, {
      objective: 'DISTANCE'
    });

    return {
      isProviderData: false,
      provider: 'INTERNAL_GRAPH_FALLBACK',
      source: 'ROAD_GRAPH_ENGINE',
      distanceMeters: pathResult.totalDistanceMeters,
      distanceKm: +( (pathResult.totalDistanceMeters / 1000).toFixed(2) ),
      normalDurationSeconds: pathResult.totalDurationSeconds,
      normalDurationMinutes: Math.max(1, Math.round(pathResult.totalDurationSeconds / 60)),
      pathCoordinates: pathResult.pathCoordinates
    };
  }
}

module.exports = new OSRMService();

