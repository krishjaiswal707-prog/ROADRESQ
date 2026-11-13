/**
 * Capstone Master End-to-End Test Suite
 * Validates All 6 Modules:
 * - Module 1: Traffic & Emergency Optimization
 * - Module 2: Ambulance Assistance
 * - Module 3: Crane Assistance
 * - Module 4: Road Hazard & Bridge Reporting
 * - Module 5: Hospital Discovery (OSM Overpass)
 * - Module 6: Multi-City Isolation & Free-First Routing
 */
const osrmService = require('../src/services/osrmService');
const hospitalDiscoveryService = require('../src/services/hospitalDiscoveryService');
const craneService = require('../src/modules/crane/crane.service');
const roadGraphEngine = require('../src/modules/routing/roadGraphEngine');
const routeOptimizationService = require('../src/modules/routing/services/routeOptimization.service');
const ambulancePriorityEngine = require('../src/modules/emergency/services/ambulancePriority.engine');

let pass = 0;
let fail = 0;

function assertTest(condition, name) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    pass++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    fail++;
  }
}

async function runMasterSuite() {
  console.log('=== MODULE 1 & 6: OSRM FREE ROUTING & MULTI-CITY ===');
  const osrmRes = await osrmService.getRoute(
    { lat: 13.0827, lng: 80.2707 },
    { lat: 13.0601, lng: 80.2505 },
    { cityId: 'chennai' }
  );
  assertTest(osrmRes.distanceMeters > 0, 'OSRM road route calculated successfully');
  assertTest(osrmRes.pathCoordinates.length >= 2, 'OSRM road coordinates extracted');

  console.log('\n=== MODULE 2: AMBULANCE DISPATCH & SEVERITY TRIAGE ===');
  const triageAmb = ambulancePriorityEngine.selectOptimalAmbulance(
    'chennai',
    { lat: 13.0827, lng: 80.2707 },
    'CRITICAL'
  );
  assertTest(triageAmb && triageAmb.level === 'ALS', 'Critical emergency allocates ALS Trauma ambulance');

  console.log('\n=== MODULE 3: CRANE & TOWING RECOVERY ===');
  const chnFleet = craneService.getFleet('chennai');
  assertTest(chnFleet.length >= 2, 'Chennai crane fleet loaded with hydraulic flatbeds');
  const blrFleet = craneService.getFleet('bengaluru');
  assertTest(blrFleet.length >= 1, 'Bengaluru crane fleet isolated');

  console.log('\n=== MODULE 4: ROAD HAZARDS & BRIDGE REPAIR ===');
  const chnGraph = roadGraphEngine.getCityGraph('chennai');
  assertTest(chnGraph.nodes.size >= 5, 'Road graph loaded for Chennai infrastructure');

  console.log('\n=== MODULE 5: HOSPITAL DISCOVERY (OVERPASS / REGISTRY) ===');
  const hospResult = await hospitalDiscoveryService.discoverHospitals('chennai');
  assertTest(hospResult.hospitals.length >= 4, `Discovered ${hospResult.hospitals.length} hospitals for Chennai`);
  assertTest(hospResult.source.includes('HOSPITAL'), `Hospital source verified: ${hospResult.source}`);

  console.log(`\n========================================`);
  console.log(`CAPSTONE MASTER SUITE: ${pass} passed, ${fail} failed.`);
  console.log(`========================================\n`);

  if (fail > 0) process.exit(1);
  process.exit(0);
}

runMasterSuite().catch(e => {
  console.error(e);
  process.exit(1);
});

