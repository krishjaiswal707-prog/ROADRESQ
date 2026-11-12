/**
 * Dijkstra's Shortest & Fastest Path Algorithm
 * Operates on generalized nodes and weighted edge maps.
 */
function runDijkstra(nodes, edges, startNodeId, targetNodeId, getEdgeWeight) {
  const distances = {};
  const travelTimes = {};
  const previous = {};
  const unvisited = new Set(Object.keys(nodes));

  for (const nodeId of unvisited) {
    distances[nodeId] = Infinity;
    travelTimes[nodeId] = Infinity;
  }

  distances[startNodeId] = 0;
  travelTimes[startNodeId] = 0;

  while (unvisited.size > 0) {
    let currentNode = null;
    let minTime = Infinity;

    for (const node of unvisited) {
      if (travelTimes[node] < minTime) {
        minTime = travelTimes[node];
        currentNode = node;
      }
    }

    if (!currentNode || currentNode === targetNodeId || travelTimes[currentNode] === Infinity) {
      break;
    }

    unvisited.delete(currentNode);
    const outgoing = edges.filter(e => e.from === currentNode);

    for (const edge of outgoing) {
      const neighbor = edge.to;
      if (!unvisited.has(neighbor)) continue;

      const { weightMinutes, distanceKm } = getEdgeWeight(edge, nodes[currentNode], nodes[neighbor]);
      const altTime = travelTimes[currentNode] + weightMinutes;
      const altDist = distances[currentNode] + distanceKm;

      if (altTime < travelTimes[neighbor]) {
        travelTimes[neighbor] = altTime;
        distances[neighbor] = altDist;
        previous[neighbor] = { fromNode: currentNode, edge };
      }
    }
  }

  const pathNodes = [];
  let curr = targetNodeId;
  while (curr && curr !== startNodeId) {
    pathNodes.unshift(curr);
    curr = previous[curr] ? previous[curr].fromNode : null;
  }

  if (curr === startNodeId) {
    pathNodes.unshift(startNodeId);
  } else {
    return null;
  }

  return {
    pathNodes,
    pathCoordinates: pathNodes.map(id => [nodes[id].lat, nodes[id].lng]),
    totalDistanceKm: +(distances[targetNodeId].toFixed(2)),
    totalMinutes: Math.max(1, Math.round(travelTimes[targetNodeId]))
  };
}

module.exports = { runDijkstra };

