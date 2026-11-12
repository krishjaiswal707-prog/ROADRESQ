/**
 * Phase 4 Traffic Integration & Congestion Classification Test Suite
 */
const congestionEngine = require('../src/modules/traffic/services/congestionEngine');
const trafficDataService = require('../src/modules/traffic/services/trafficData.service');
const { getMonitoredCorridors } = require('../src/config/corridors');

let passed = 0;
let failed = 0;

function test(cond, msg) {
  if (cond) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

// 1. Congestion Classification Thresholds:
// Low: <= 10%, Moderate: 10% - 30%, High: 30% - 60%, Severe: > 60%
const low = congestionEngine.classifyDelay(1000, 1050); // 5% delay
test(low.congestionLevel === 'LOW' && low.delayPercentage === 5.0, 'Low congestion classified (5% delay)');

const mod = congestionEngine.classifyDelay(1000, 1250); // 25% delay
test(mod.congestionLevel === 'MODERATE' && mod.delayPercentage === 25.0, 'Moderate congestion classified (25% delay)');

const high = congestionEngine.classifyDelay(1000, 1450); // 45% delay
test(high.congestionLevel === 'HIGH' && high.delayPercentage === 45.0, 'High congestion classified (45% delay)');

const severe = congestionEngine.classifyDelay(1000, 1750); // 75% delay
test(severe.congestionLevel === 'SEVERE' && severe.delayPercentage === 75.0, 'Severe congestion classified (75% delay)');

// 2. Monitored Corridors per city
const chennaiCorridors = getMonitoredCorridors('chennai');
test(chennaiCorridors.length >= 3, 'Chennai has at least 3 monitored emergency corridors');

const blrCorridors = getMonitoredCorridors('bengaluru');
test(blrCorridors.length >= 2, 'Bengaluru has monitored emergency corridors');

// 3. Traffic observation contract validation
(async () => {
  const obs = await trafficDataService.getCorridorTraffic('chennai', chennaiCorridors[0]);
  test(obs.cityId === 'chennai', 'Observation carries correct cityId');
  test(typeof obs.isSimulated === 'boolean', 'Observation explicitly specifies isSimulated');
  test(obs.source === 'google' || obs.source === 'simulation' || obs.source === 'SIMULATED' || obs.source === 'TOMTOM', 'Observation has valid source attribution');

  console.log(`\n========================================`);
  console.log(`PHASE 4 TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
  process.exit(0);
})();

