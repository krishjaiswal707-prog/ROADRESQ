/**
 * Comprehensive Phase 3 Modular Architecture Test Suite
 */
const { SUPPORTED_CITIES } = require('../src/config/cities');
const { runDijkstra } = require('../src/modules/routing/algorithms/dijkstra');
const { runAStar } = require('../src/modules/routing/algorithms/astar');
const AmbulanceSimulator = require('../src/modules/ambulance/ambulance.simulator');
const { createTrafficSnapshot, SOCKET_CHANNELS, formatCoordinate } = require('../src/shared/types/contracts');

let testsPassed = 0;
let testsFailed = 0;

function expect(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    testsFailed++;
  }
}

// 1. Coordinate Validator & Contract
const coord = formatCoordinate(13.0827, 80.2707);
expect(coord.latitude === 13.0827 && coord.longitude === 80.2707, 'Standard coordinate format {latitude, longitude}');

// 2. Traffic Snapshot with strict isSimulated flag
const snapshot = createTrafficSnapshot({
  segmentId: 'SEG_TEST',
  name: 'Anna Salai Express',
  startCoord: { lat: 13.08, lng: 80.27 },
  endCoord: { lat: 13.06, lng: 80.25 },
  congestionLevel: 'High',
  vehicleCount: 30,
  speedKmph: 18,
  isSimulated: true
});
expect(snapshot.isSimulated === true && snapshot.congestionLevel === 'High', 'TrafficSnapshot enforces simulation flag and congestion level');

// 3. Dijkstra Modular Algorithm
const mockNodes = {
  A: { lat: 13.0, lng: 80.0 },
  B: { lat: 13.05, lng: 80.05 },
  C: { lat: 13.1, lng: 80.1 }
};
const mockEdges = [
  { from: 'A', to: 'B' },
  { from: 'B', to: 'C' }
];
const weightFn = () => ({ weightMinutes: 5, distanceKm: 4 });

const dijkstraResult = runDijkstra(mockNodes, mockEdges, 'A', 'C', weightFn);
expect(dijkstraResult && dijkstraResult.pathNodes.length === 3, 'Modular Dijkstra calculates correct optimal path nodes');

// 4. A* Modular Algorithm
const astarResult = runAStar(mockNodes, mockEdges, 'A', 'C', weightFn);
expect(astarResult && astarResult.pathNodes.length === 3, 'Modular A* calculates correct heuristic path');

// 5. Multi-City Room Scoping
expect(SOCKET_CHANNELS.getCityRoom('Chennai') === 'city:chennai', 'Multi-city room correctly generated');
expect(SOCKET_CHANNELS.getCityRoom('Bengaluru') === 'city:bengaluru', 'Bengaluru room correctly generated');

// 6. Ambulance Simulator Independent Lifecycle
const amb = new AmbulanceSimulator('AMB-TEST-88', 'bengaluru');
expect(amb.status === 'AVAILABLE', 'Ambulance simulator initializes independently to AVAILABLE');
expect(amb.isSimulated === true, 'Ambulance simulator guarantees isSimulated flag');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${testsPassed} passed, ${testsFailed} failed.`);
console.log(`========================================\n`);

if (testsFailed > 0) process.exit(1);

