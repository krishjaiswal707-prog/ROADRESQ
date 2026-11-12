/**
 * ROAD RESQ AI - Multi-City Road Graph Engine (Step 5.1)
 * Manages city-isolated road networks with dynamic traffic weights & incident blockages.
 */

const { haversineDistanceKm } = require('../../algorithms/routeOptimizer');

class RoadGraphEngine {
  constructor() {
    this.cityGraphs = new Map(); // cityId -> { nodes: Map, edges: Array }
    this.initializeCityNetworks();
  }

  initializeCityNetworks() {
    // 1. Chennai Road Network
    this.initCity('chennai', {
      nodes: {
        'CHN_CENTRAL': { id: 'CHN_CENTRAL', name: 'Chennai Central Hub', lat: 13.0827, lng: 80.2707 },
        'CHN_RGGGH': { id: 'CHN_RGGGH', name: 'Rajiv Gandhi GH (ER)', lat: 13.0805, lng: 80.2778, isHospital: true },
        'CHN_ANNA_FLY': { id: 'CHN_ANNA_FLY', name: 'Anna Flyover (Gemini)', lat: 13.0519, lng: 80.2514 },
        'CHN_APOLLO': { id: 'CHN_APOLLO', name: 'Apollo Greams Rd (ER)', lat: 13.0601, lng: 80.2505, isHospital: true },
        'CHN_T_NAGAR': { id: 'CHN_T_NAGAR', name: 'Panagal Park T.Nagar', lat: 13.0405, lng: 80.2337 },
        'CHN_KATHIPARA': { id: 'CHN_KATHIPARA', name: 'Kathipara Junction', lat: 13.0076, lng: 80.2038 },
        'CHN_MIOT': { id: 'CHN_MIOT', name: 'MIOT International (ER)', lat: 13.0182, lng: 80.1772, isHospital: true }
      },
      edges: [
        { id: 'E_CHN_1', from: 'CHN_CENTRAL', to: 'CHN_RGGGH', bidirectional: true, baseSpeedKmph: 35 },
        { id: 'E_CHN_2', from: 'CHN_CENTRAL', to: 'CHN_ANNA_FLY', bidirectional: true, baseSpeedKmph: 45 },
        { id: 'E_CHN_3', from: 'CHN_ANNA_FLY', to: 'CHN_APOLLO', bidirectional: true, baseSpeedKmph: 30 },
        { id: 'E_CHN_4', from: 'CHN_ANNA_FLY', to: 'CHN_T_NAGAR', bidirectional: true, baseSpeedKmph: 40 },
        { id: 'E_CHN_5', from: 'CHN_T_NAGAR', to: 'CHN_KATHIPARA', bidirectional: true, baseSpeedKmph: 50 },
        { id: 'E_CHN_6', from: 'CHN_KATHIPARA', to: 'CHN_MIOT', bidirectional: true, baseSpeedKmph: 45 },
        { id: 'E_CHN_7', from: 'CHN_CENTRAL', to: 'CHN_T_NAGAR', bidirectional: true, baseSpeedKmph: 38 }
      ]
    });

    // 2. Bengaluru Road Network
    this.initCity('bengaluru', {
      nodes: {
        'BLR_MAJESTIC': { id: 'BLR_MAJESTIC', name: 'Majestic Central', lat: 12.9767, lng: 77.5713 },
        'BLR_VICTORIA': { id: 'BLR_VICTORIA', name: 'Victoria Hospital (ER)', lat: 12.9634, lng: 77.5755, isHospital: true },
        'BLR_MG_ROAD': { id: 'BLR_MG_ROAD', name: 'MG Road Trinity', lat: 12.9734, lng: 77.6205 },
        'BLR_MANIPAL': { id: 'BLR_MANIPAL', name: 'Manipal Hospital (ER)', lat: 12.9592, lng: 77.6444, isHospital: true },
        'BLR_SILK_BOARD': { id: 'BLR_SILK_BOARD', name: 'Silk Board Junction', lat: 12.9176, lng: 77.6238 }
      },
      edges: [
        { id: 'E_BLR_1', from: 'BLR_MAJESTIC', to: 'BLR_VICTORIA', bidirectional: true, baseSpeedKmph: 30 },
        { id: 'E_BLR_2', from: 'BLR_MAJESTIC', to: 'BLR_MG_ROAD', bidirectional: true, baseSpeedKmph: 40 },
        { id: 'E_BLR_3', from: 'BLR_MG_ROAD', to: 'BLR_MANIPAL', bidirectional: true, baseSpeedKmph: 35 },
        { id: 'E_BLR_4', from: 'BLR_MG_ROAD', to: 'BLR_SILK_BOARD', bidirectional: true, baseSpeedKmph: 25 },
        { id: 'E_BLR_5', from: 'BLR_VICTORIA', to: 'BLR_SILK_BOARD', bidirectional: true, baseSpeedKmph: 35 }
      ]
    });

    // 3. Coimbatore Road Network
    this.initCity('coimbatore', {
      nodes: {
        'CBE_GANDHI': { id: 'CBE_GANDHI', name: 'Gandhipuram Signal', lat: 11.0168, lng: 76.9558 },
        'CBE_CMCH': { id: 'CBE_CMCH', name: 'CMCH Hospital (ER)', lat: 11.0028, lng: 76.9669, isHospital: true },
        'CBE_LAKSHMI': { id: 'CBE_LAKSHMI', name: 'Lakshmi Mills Junction', lat: 11.0085, lng: 76.9805 },
        'CBE_KMCH': { id: 'CBE_KMCH', name: 'KMCH Hospital (ER)', lat: 11.0425, lng: 77.0360, isHospital: true }
      },
      edges: [
        { id: 'E_CBE_1', from: 'CBE_GANDHI', to: 'CBE_CMCH', bidirectional: true, baseSpeedKmph: 35 },
        { id: 'E_CBE_2', from: 'CBE_GANDHI', to: 'CBE_LAKSHMI', bidirectional: true, baseSpeedKmph: 45 },
        { id: 'E_CBE_3', from: 'CBE_LAKSHMI', to: 'CBE_KMCH', bidirectional: true, baseSpeedKmph: 55 }
      ]
    });
  }

  initCity(cityId, config) {
    const nodes = new Map(Object.entries(config.nodes));
    const edges = [];

    for (const def of config.edges) {
      const u = nodes.get(def.from);
      const v = nodes.get(def.to);
      if (!u || !v) continue;

      const distKm = haversineDistanceKm(u.lat, u.lng, v.lat, v.lng);
      const distanceMeters = Math.round(distKm * 1000);
      const normalDurationSeconds = Math.round((distKm / def.baseSpeedKmph) * 3600);

      const baseEdge = {
        edgeId: def.id,
        sourceNode: def.from,
        destinationNode: def.to,
        distanceMeters,
        normalDurationSeconds,
        trafficDurationSeconds: normalDurationSeconds,
        congestionLevel: 'LOW',
        isBlocked: false,
        isSimulated: true,
        source: 'ROAD_GRAPH_ENGINE',
        observedAt: new Date().toISOString()
      };

      edges.push(baseEdge);

      if (def.bidirectional) {
        edges.push({
          ...baseEdge,
          edgeId: `${def.id}_REV`,
          sourceNode: def.to,
          destinationNode: def.from
        });
      }
    }

    this.cityGraphs.set(cityId.toLowerCase(), { nodes, edges });
  }

  getCityGraph(cityId) {
    const normalized = (cityId || 'chennai').toLowerCase();
    return this.cityGraphs.get(normalized) || this.cityGraphs.get('chennai');
  }

  updateEdgeTraffic(cityId, edgeId, { trafficDurationSeconds, congestionLevel, isBlocked }) {
    const graph = this.getCityGraph(cityId);
    if (!graph) return;

    for (const edge of graph.edges) {
      if (edge.edgeId === edgeId || edge.edgeId === `${edgeId}_REV`) {
        if (typeof trafficDurationSeconds === 'number') edge.trafficDurationSeconds = trafficDurationSeconds;
        if (congestionLevel) edge.congestionLevel = congestionLevel;
        if (typeof isBlocked === 'boolean') edge.isBlocked = isBlocked;
        edge.observedAt = new Date().toISOString();
      }
    }
  }

  findClosestNode(cityId, lat, lng) {
    const graph = this.getCityGraph(cityId);
    let closest = null;
    let minDist = Infinity;

    for (const node of graph.nodes.values()) {
      const d = haversineDistanceKm(lat, lng, node.lat, node.lng);
      if (d < minDist) {
        minDist = d;
        closest = node;
      }
    }
    return closest;
  }
}

module.exports = new RoadGraphEngine();

