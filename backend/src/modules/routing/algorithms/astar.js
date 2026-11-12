const { haversineDistanceKm } = require('../../../algorithms/routeOptimizer');

/**
 * A* Search Algorithm with Haversine distance heuristic
 */
function runAStar(nodes, edges, startNodeId, targetNodeId, getEdgeWeight) {
  const openSet = new Set([startNodeId]);
  const cameFrom = {};

  const gScore = {};
  const fScore = {};

  for (const nodeId of Object.keys(nodes)) {
    gScore[nodeId] = Infinity;
    fScore[nodeId] = Infinity;
  }

  const targetNode = nodes[targetNodeId];
  const heuristic = (node) => (haversineDistanceKm(node.lat, node.lng, targetNode.lat, targetNode.lng) / 50) * 60; // Estimated minutes

  gScore[startNodeId] = 0;
  fScore[startNodeId] = heuristic(nodes[startNodeId]);

  while (openSet.size > 0) {
    let current = null;
    let lowestF = Infinity;

    for (const node of openSet) {
      if (fScore[node] < lowestF) {
        lowestF = fScore[node];
        current = node;
      }
    }

    if (current === targetNodeId) {
      const pathNodes = [current];
      while (cameFrom[current]) {
        current = cameFrom[current];
        pathNodes.unshift(current);
      }
      return {
        pathNodes,
        pathCoordinates: pathNodes.map(id => [nodes[id].lat, nodes[id].lng]),
        estimatedMinutes: Math.max(1, Math.round(gScore[targetNodeId]))
      };
    }

    openSet.delete(current);
    const outgoing = edges.filter(e => e.from === current);

    for (const edge of outgoing) {
      const neighbor = edge.to;
      const { weightMinutes } = getEdgeWeight(edge, nodes[current], nodes[neighbor]);
      const tentativeG = gScore[current] + weightMinutes;

      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + heuristic(nodes[neighbor]);
        openSet.add(neighbor);
      }
    }
  }

  return null;
}

module.exports = { runAStar };

