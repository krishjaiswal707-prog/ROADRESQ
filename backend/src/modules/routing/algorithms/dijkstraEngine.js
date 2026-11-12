/**
 * Min-Priority Queue for Dijkstra and A* path finding
 */
class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift()?.item;
  }

  isEmpty() {
    return this.elements.length === 0;
  }
}

/**
 * Dijkstra Shortest Path Algorithm
 * objective: 'TIME' | 'DISTANCE' | 'TRAFFIC_WEIGHTED'
 */
function dijkstraShortestPath(nodesMap, edges, startNodeId, targetNodeId, options = {}) {
  const objective = options.objective || 'TRAFFIC_WEIGHTED';
  const distances = new Map();
  const travelTimes = new Map();
  const previous = new Map();
  const pq = new PriorityQueue();

  for (const nodeId of nodesMap.keys()) {
    distances.set(nodeId, Infinity);
    travelTimes.set(nodeId, Infinity);
  }

  distances.set(startNodeId, 0);
  travelTimes.set(startNodeId, 0);
  pq.enqueue(startNodeId, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue();

    if (current === targetNodeId) break;

    const outgoing = edges.filter(e => e.sourceNode === current && !e.isBlocked);

    for (const edge of outgoing) {
      const neighbor = edge.destinationNode;

      // Select weight based on optimization objective
      let edgeWeight = edge.normalDurationSeconds;
      if (objective === 'DISTANCE') {
        edgeWeight = edge.distanceMeters;
      } else if (objective === 'TRAFFIC_WEIGHTED') {
        edgeWeight = edge.trafficDurationSeconds;
      }

      const newTime = travelTimes.get(current) + edge.trafficDurationSeconds;
      const newDist = distances.get(current) + edge.distanceMeters;
      const costCandidate = objective === 'DISTANCE' ? newDist : newTime;
      const currentCost = objective === 'DISTANCE' ? distances.get(neighbor) : travelTimes.get(neighbor);

      if (costCandidate < currentCost) {
        distances.set(neighbor, newDist);
        travelTimes.set(neighbor, newTime);
        previous.set(neighbor, current);
        pq.enqueue(neighbor, costCandidate);
      }
    }
  }

  if (travelTimes.get(targetNodeId) === Infinity) {
    return null; // Unreachable
  }

  const pathNodes = [];
  let curr = targetNodeId;
  while (curr) {
    pathNodes.unshift(curr);
    curr = previous.get(curr);
  }

  return {
    pathNodes,
    pathCoordinates: pathNodes.map(id => [nodesMap.get(id).lat, nodesMap.get(id).lng]),
    totalDistanceMeters: distances.get(targetNodeId),
    totalDurationSeconds: travelTimes.get(targetNodeId),
    objective
  };
}

module.exports = { dijkstraShortestPath, PriorityQueue };

