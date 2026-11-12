/**
 * Phase 3 Architecture & Contract Verification Test
 */
const { SUPPORTED_CITIES, getCityConfig } = require('../src/config/cities');
const { RouteOptimizer } = require('../src/algorithms/routeOptimizer');
const { classifyCongestion } = require('../src/algorithms/trafficPredictor');
const { SOCKET_EVENTS, getCityRoom } = require('../src/shared/types/contracts');
const AmbulanceSimulator = require('../src/modules/ambulance/ambulance.simulator');

let failures = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failures++;
  }
}

// 1. Multi-City separation
assert(SUPPORTED_CITIES.chennai && SUPPORTED_CITIES.bengaluru && SUPPORTED_CITIES.coimbatore, 'Multi-city registry loaded');
assert(getCityRoom('chennai') === 'city:chennai', 'Socket room contract matches');

// 2. Congestion classification contract
assert(classifyCongestion(45, 10) === 'Severe', 'Severe congestion correctly classified');
assert(classifyCongestion(5, 45) === 'Low', 'Low congestion correctly classified');

// 3. Routing engine contract
const optimizer = new RouteOptimizer();
const testRoute = optimizer.calculateCorridorComparison(
  { lat: 11.0168, lng: 76.9558 },
  { lat: 11.0055, lng: 76.9840 }
);
assert(testRoute.recommendedRoute && testRoute.recommendedRoute.timeSavedMinutes > 0, 'Dijkstra corridor comparison returns time savings');

// 4. Ambulance Simulator independence
const simulator = new AmbulanceSimulator('AMB-TEST-01', 'chennai');
assert(simulator.status === 'AVAILABLE', 'Ambulance simulator initializes to AVAILABLE');
assert(simulator.isSimulated === true, 'Ambulance is strictly tagged as simulated');

if (failures === 0) {
  console.log('\n🎉 ALL 4 PHASE 3 CONTRACT VERIFICATION TESTS PASSED.');
  process.exit(0);
} else {
  console.error(`\n⚠️ ${failures} tests failed.`);
  process.exit(1);
}

