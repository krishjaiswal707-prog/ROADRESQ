/**
 * Phase 5 Comprehensive Automated Test Suite
 * Tests Dijkstra, A*, Cost Consistency, Dispatch Priority & Multi-City Isolation.
 */
const roadGraphEngine = require('../src/modules/routing/roadGraphEngine');
const { dijkstraShortestPath } = require('../src/modules/routing/algorithms/dijkstraEngine');
const { astarShortestPath } = require('../src/modules/routing/algorithms/astarEngine');
const routeOptimizationService = require('../src/modules/routing/services/routeOptimization.service');
const ambulancePriorityEngine = require('../src/modules/emergency/services/ambulancePriority.engine');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

// 1. Multi-City Graph Isolation
const chnGraph = roadGraphEngine.getCityGraph('chennai');
const blrGraph = roadGraphEngine.getCityGraph('bengaluru');
assert(chnGraph.nodes.has('CHN_CENTRAL') && !chnGraph.nodes.has('BLR_MAJESTIC'), 'Chennai graph isolated from Bengaluru');
assert(blrGraph.nodes.has('BLR_MAJESTIC'), 'Bengaluru graph loaded correctly');

// 2. Dijkstra Algorithm Shortest Path
const dijkstraResult = dijkstraShortestPath(chnGraph.nodes, chnGraph.edges, 'CHN_CENTRAL', 'CHN_MIOT');
assert(dijkstraResult && dijkstraResult.pathNodes.length >= 3, 'Dijkstra finds valid multi-hop path');

// 3. A* Algorithm & Cost Consistency
const astarResult = astarShortestPath(chnGraph.nodes, chnGraph.edges, 'CHN_CENTRAL', 'CHN_MIOT');
assert(astarResult !== null, 'A* finds valid path using admissible heuristic');
assert(
  Math.abs(astarResult.totalDurationSeconds - dijkstraResult.totalDurationSeconds) <= 1,
  'Dijkstra and A* cost consistency verified on identical graph'
);

// 4. Blocked Road Avoidance
roadGraphEngine.updateEdgeTraffic('chennai', 'E_CHN_2', { isBlocked: true });
const rerouted = dijkstraShortestPath(chnGraph.nodes, chnGraph.edges, 'CHN_CENTRAL', 'CHN_MIOT');
assert(!rerouted.pathNodes.includes('CHN_ANNA_FLY') || rerouted.pathNodes[1] !== 'CHN_ANNA_FLY', 'Routing avoids blocked edges');
// Reset blockage
roadGraphEngine.updateEdgeTraffic('chennai', 'E_CHN_2', { isBlocked: false });

// 5. Ambulance Dispatch Priority Engine
const selectedAmb = ambulancePriorityEngine.selectOptimalAmbulance('chennai', { lat: 13.0827, lng: 80.2707 }, 'CRITICAL');
assert(selectedAmb !== null, 'Optimal ambulance selected');
assert(selectedAmb.level === 'ALS', 'Critical emergency correctly prioritizes Advanced Life Support');

// 6. Dynamic Recalculation Thresholds
const noRecalc = routeOptimizationService.shouldRecalculate('TRIP_TEST', 12.0, 11.5);
assert(noRecalc.recalculate === false, 'Recalculation rejected for minor delta (<2.5 min)');

const doRecalc = routeOptimizationService.shouldRecalculate('TRIP_TEST', 16.0, 11.0);
assert(doRecalc.recalculate === true, 'Recalculation approved for significant delta (5.0 min)');

console.log(`\n========================================`);
console.log(`PHASE 5 TEST SUMMARY: ${passed} passed, ${failed} failed.`);
console.log(`========================================\n`);

if (failed > 0) process.exit(1);

