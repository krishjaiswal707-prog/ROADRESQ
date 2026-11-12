const { PriorityQueue } = require('./dijkstraEngine');
const { haversineDistanceKm } = require('../../../algorithms/routeOptimizer');

/**
 * A* Search Algorithm with Admissible Lower-Bound Travel Time Heuristic
 */
function astarShortestPath(nodesMap, edges, startNodeId, targetNodeId, options = {}) {
  const targetNode = nodesMap.get(targetNodeId);
  if (!targetNode) return null;

  // Maximum highway free flow speed: 80 km/h (ensures heuristic never overestimates travel time)
  const MAX_FREE_FLOW_SPEED_KMPH = 80;
  const timeHeuristicSeconds = (node) => {
    const distKm = haversineDistanceKm(node.lat, node.lng, targetNode.lat, targetNode.lng);
    return Math.round((distKm / MAX_FREE_FLOW_SPEED_KMPH) * 3600);
  };

  const gScore = new Map();
  const fScore = new Map();
  const previous = new Map();
  const pq = new PriorityQueue();

  for (const nodeId of nodesMap.keys()) {
    gScore.set(nodeId, Infinity);
    fScore.set(nodeId, Infinity);
  }

  gScore.set(startNodeId, 0);
  const startH = timeHeuristicSeconds(nodesMap.get(startNodeId));
  fScore.set(startNodeId, startH);
  pq.enqueue(startNodeId, startH);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();

    if (current === targetNodeId) {
      const pathNodes = [];
      let curr = targetNodeId;
      while (curr) {
        pathNodes.unshift(curr);
        curr = previous.get(curr);
      }
      return {
        pathNodes,
        pathCoordinates: pathNodes.map(id => [nodesMap.get(id).lat, nodesMap.get(id).lng]),
        totalDurationSeconds: gScore.get(targetNodeId),
        heuristicUsed: 'ADMISSIBLE_LOWER_BOUND_TIME'
      };
    }

    const outgoing = edges.filter(e => e.sourceNode === current && !e.isBlocked);

    for (const edge of outgoing) {
      const neighbor = edge.destinationNode;
      const tentativeG = gScore.get(current) + edge.trafficDurationSeconds;

      if (tentativeG < gScore.get(neighbor)) {
        previous.set(neighbor, current);
        gScore.set(neighbor, tentativeG);
        const neighborNode = nodesMap.get(neighbor);
        const h = timeHeuristicSeconds(neighborNode);
        const f = tentativeG + h;
        fScore.set(neighbor, f);
        pq.enqueue(neighbor, f);
      }
    }
  }

  return null; // Unreachable
}

module.exports = { astarShortestPath };

