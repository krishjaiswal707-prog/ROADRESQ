/**
 * Free-First Stack Automated Test Suite
 * Tests OSRM routing, TomTom fallback, Dijkstra/A* consistency, and multi-city traffic without Google API keys.
 */
const osrmService = require('../src/services/osrmService');
const tomtomTrafficService = require('../src/services/tomtomTrafficService');
const routeOptimizationService = require('../src/modules/routing/services/routeOptimization.service');
const trafficDataService = require('../src/modules/traffic/services/trafficData.service');
const { getMonitoredCorridors } = require('../src/config/corridors');

let passed = 0;
let failed = 0;

function check(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('--- 1. OSRM Service Tests ---');
  // 1. OSRM Route Request (Chennai: Central to Rajiv Gandhi GH)
  const chennaiOrigin = { lat: 13.0827, lng: 80.2707 };
  const chennaiDest = { lat: 13.0805, lng: 80.2778 };

  const osrmRes = await osrmService.getRoute(chennaiOrigin, chennaiDest, { cityId: 'chennai' });
  check(osrmRes.distanceMeters > 0, `OSRM returns valid distance: ${osrmRes.distanceMeters}m`);
  check(osrmRes.pathCoordinates.length >= 2, `OSRM decodes coordinates: ${osrmRes.pathCoordinates.length} points`);
  check(osrmRes.source === 'OPEN_STREET_MAP_OSRM' || osrmRes.source === 'ROAD_GRAPH_ENGINE', `OSRM source is properly attributed: ${osrmRes.source}`);

  // 2. OSRM Invalid Coordinates Handling
  try {
    await osrmService.getRoute({ lat: 'invalid', lng: null }, chennaiDest);
    check(false, 'OSRM throws on invalid coordinates');
  } catch (e) {
    check(true, 'OSRM correctly rejects invalid coordinates');
  }

  // 3. OSRM Service Failure Fallback
  const fallbackRes = osrmService.fallbackGraphRoute(chennaiOrigin, chennaiDest, 'chennai');
  check(fallbackRes.isProviderData === false && fallbackRes.pathCoordinates.length > 0, 'OSRM fallback gracefully uses internal graph engine');

  console.log('\n--- 2. TomTom Traffic Service Tests ---');
  // 4. Missing API key handling
  const noKeyFlow = await tomtomTrafficService.getSegmentFlow(13.0827, 80.2707);
  check(noKeyFlow.available === false, 'TomTom returns available: false when key is not configured');
  check(noKeyFlow.isSimulated === false, 'TomTom does NOT mark missing data as simulated data');
  check(noKeyFlow.reason === 'API_KEY_NOT_CONFIGURED', 'TomTom correctly notes missing key');

  console.log('\n--- 3. Integrated Route Optimization & Fallback ---');
  // 5. Emergency Corridor Optimization with OSRM
  const routeComp = await routeOptimizationService.computeAlternativeRoutes('chennai', chennaiOrigin, chennaiDest, true);
  check(routeComp.recommendedRoute.timeSavedMinutes > 0, `Emergency corridor saves ${routeComp.recommendedRoute.timeSavedMinutes} minutes`);
  check(routeComp.recommendedRoute.pathCoordinates.length > 0, 'Recommended route contains decoded road coordinates');
  check(routeComp.alternativeRoutes.length > 0, 'Alternative routes provided for comparison');
  check(routeComp.astarConsistencyCheck === true, 'A* and Dijkstra cost consistency verified on road network');

  console.log('\n--- 4. Multi-City Corridor Traffic Observations ---');
  // 6. Chennai Corridor Traffic
  const chnCorridors = getMonitoredCorridors('chennai');
  const chnObs = await trafficDataService.getCorridorTraffic('chennai', chnCorridors[0]);
  check(chnObs.cityId === 'chennai', 'Corridor observation generated for Chennai');
  check(typeof chnObs.isSimulated === 'boolean', 'Observation explicitly marks simulation status');
  check(chnObs.source === 'TOMTOM' || chnObs.source === 'SIMULATED', `Observation source is strictly attributed: ${chnObs.source}`);

  // 7. Bengaluru Corridor Traffic
  const blrCorridors = getMonitoredCorridors('bengaluru');
  const blrObs = await trafficDataService.getCorridorTraffic('bengaluru', blrCorridors[0]);
  check(blrObs.cityId === 'bengaluru', 'Corridor observation generated for Bengaluru');

  console.log(`\n========================================`);
  console.log(`FREE STACK TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});

