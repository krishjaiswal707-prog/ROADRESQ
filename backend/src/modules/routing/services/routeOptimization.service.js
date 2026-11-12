const roadGraphEngine = require('../roadGraphEngine');
const { dijkstraShortestPath } = require('../algorithms/dijkstraEngine');
const { astarShortestPath } = require('../algorithms/astarEngine');
const osrmService = require('../../../services/osrmService');

class RouteOptimizationService {
  constructor() {
    this.recalculationCooldowns = new Map();
  }

  /**
   * Evaluates & compares alternative emergency routes:
   * - Uses OSRM for real road geometry and baseline distance/duration
   * - Uses Dijkstra / A* with live/simulated traffic weights for priority corridor calculation
   */
  async computeAlternativeRoutes(cityId, origin, destination, isEmergency = true) {
    const graph = roadGraphEngine.getCityGraph(cityId);
    const startNode = roadGraphEngine.findClosestNode(cityId, origin.lat, origin.lng);
    const targetNode = roadGraphEngine.findClosestNode(cityId, destination.lat, destination.lng);

    if (!startNode || !targetNode) {
      throw new Error(`Could not map coordinates to road network for city ${cityId}`);
    }

    // 1. Fetch real road geometry and distance from OSRM
    const osrmResult = await osrmService.getRoute(origin, destination, { cityId, alternatives: true });

    // 2. Dijkstra traffic-weighted evaluation
    const fastestPath = dijkstraShortestPath(graph.nodes, graph.edges, startNode.id, targetNode.id, {
      objective: 'TRAFFIC_WEIGHTED'
    });

    // 3. Dijkstra shortest distance evaluation
    const shortestPath = dijkstraShortestPath(graph.nodes, graph.edges, startNode.id, targetNode.id, {
      objective: 'DISTANCE'
    });

    // A* confirmation check for verification consistency
    const astarPath = astarShortestPath(graph.nodes, graph.edges, startNode.id, targetNode.id);

    // Baseline times
    const normalMinutes = osrmResult.isProviderData 
      ? osrmResult.normalDurationMinutes 
      : Math.round((fastestPath?.totalDurationSeconds || 900) / 60);

    // Green Corridor speed multiplier (~40% time saving with automated signal preemption)
    const priorityMinutes = isEmergency ? Math.max(2, Math.round(normalMinutes * 0.58)) : normalMinutes;
    const timeSaved = Math.max(1, normalMinutes - priorityMinutes);

    // Prefer high-fidelity road polyline from OSRM, fallback to graph coordinates
    const recommendedCoords = osrmResult.pathCoordinates?.length > 0 
      ? osrmResult.pathCoordinates 
      : fastestPath.pathCoordinates;

    const recommendedRoute = {
      routeId: 'ROUTE_RECOMMENDED_PRIORITY',
      name: 'Priority Emergency Corridor (OSRM Road-Snapped)',
      pathCoordinates: recommendedCoords,
      distanceKm: osrmResult.distanceKm || +( (fastestPath.totalDistanceMeters / 1000).toFixed(2) ),
      trafficDurationMinutes: priorityMinutes,
      normalDurationMinutes: normalMinutes,
      timeSavedMinutes: timeSaved,
      congestionLevel: 'LOW',
      recommendationReason: `OSRM road-snapped corridor with simulated signal preemption. Saves ~${timeSaved} min.`,
      isSimulated: true, // Emergency green corridor speed override is simulated
      source: osrmResult.isProviderData ? 'OSRM_ROAD_GEOMETRY' : 'ROAD_GRAPH_ENGINE'
    };

    // Alternative routes from OSRM alternatives or graph fallback
    const alternativeRoutes = (osrmResult.alternatives?.length > 0 ? osrmResult.alternatives : [
      {
        routeId: 'ROUTE_ALT_SHORTEST_DIST',
        name: 'Direct Arterial (Shortest Distance)',
        pathCoordinates: shortestPath.pathCoordinates,
        distanceMeters: shortestPath.totalDistanceMeters,
        durationSeconds: (normalMinutes + 3) * 60
      }
    ]).map((alt, i) => ({
      routeId: alt.routeId || `ROUTE_ALT_${i + 1}`,
      name: alt.name || `Alternative Corridor ${i + 1}`,
      pathCoordinates: alt.pathCoordinates,
      distanceKm: +( (alt.distanceMeters / 1000).toFixed(2) ),
      trafficDurationMinutes: Math.round(alt.durationSeconds / 60) + 2,
      congestionLevel: 'MODERATE',
      recommendationReason: 'Alternative path with standard traffic signal delays.'
    }));

    return {
      cityId,
      recommendedRoute,
      alternativeRoutes,
      astarConsistencyCheck: astarPath?.totalDurationSeconds === fastestPath.totalDurationSeconds
    };
  }

  shouldRecalculate(emergencyId, newEtaMinutes, currentEtaMinutes) {
    const lastRecalc = this.recalculationCooldowns.get(emergencyId) || 0;
    const COOLDOWN_MS = 15000;

    if (Date.now() - lastRecalc < COOLDOWN_MS) {
      return { recalculate: false, reason: 'COOLDOWN_ACTIVE' };
    }

    const delta = Math.abs(newEtaMinutes - currentEtaMinutes);
    if (delta >= 2.5) {
      this.recalculationCooldowns.set(emergencyId, Date.now());
      return { recalculate: true, deltaMinutes: delta };
    }

    return { recalculate: false, reason: 'INSIGNIFICANT_DELTA' };
  }
}

module.exports = new RouteOptimizationService();
