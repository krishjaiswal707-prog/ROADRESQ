/**
 * Multi-City Registry for ROAD RESQ AI
 * Each city configures coordinates, zoom levels, emergency hospitals, and traffic providers.
 */

const SUPPORTED_CITIES = {
  chennai: {
    cityId: 'chennai',
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    timeZone: 'Asia/Kolkata',
    center: { lat: 13.0827, lng: 80.2707 },
    defaultZoom: 13,
    trafficProvider: 'GOOGLE_TRAFFIC',
    trafficDataAvailable: true,
    hospitals: [
      { id: 'HOSP_CHN_1', name: 'Rajiv Gandhi Government General Hospital', lat: 13.0805, lng: 80.2778, emergencyBeds: 45, traumaLevel: 1 },
      { id: 'HOSP_CHN_2', name: 'Apollo Hospitals Greams Road', lat: 13.0601, lng: 80.2505, emergencyBeds: 28, traumaLevel: 1 },
      { id: 'HOSP_CHN_3', name: 'Fortis Malar Hospital Adyar', lat: 13.0067, lng: 80.2570, emergencyBeds: 18, traumaLevel: 2 },
      { id: 'HOSP_CHN_4', name: 'MIOT International Manapakkam', lat: 13.0182, lng: 80.1772, emergencyBeds: 35, traumaLevel: 1 }
    ],
    keySignals: [
      { signalId: 'SIG_CHN_CENTRAL', name: 'Chennai Central Junction', location: { lat: 13.0827, lng: 80.2755 } },
      { signalId: 'SIG_CHN_ANNA_FLY', name: 'Anna Flyover (Gemini) Signal', location: { lat: 13.0519, lng: 80.2514 } },
      { signalId: 'SIG_CHN_KATHIPARA', name: 'Kathipara Grade Separator', location: { lat: 13.0076, lng: 80.2038 } },
      { signalId: 'SIG_CHN_T_NAGAR', name: 'Panagal Park Intersection', location: { lat: 13.0405, lng: 80.2337 } }
    ]
  },
  bengaluru: {
    cityId: 'bengaluru',
    cityName: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    timeZone: 'Asia/Kolkata',
    center: { lat: 12.9716, lng: 77.5946 },
    defaultZoom: 13,
    trafficProvider: 'GOOGLE_TRAFFIC',
    trafficDataAvailable: true,
    hospitals: [
      { id: 'HOSP_BLR_1', name: 'Victoria Hospital Emergency Center', lat: 12.9634, lng: 77.5755, emergencyBeds: 50, traumaLevel: 1 },
      { id: 'HOSP_BLR_2', name: 'Manipal Hospital Old Airport Rd', lat: 12.9592, lng: 77.6444, emergencyBeds: 30, traumaLevel: 1 },
      { id: 'HOSP_BLR_3', name: 'Narayana Health City Bommasandra', lat: 12.8093, lng: 77.6946, emergencyBeds: 40, traumaLevel: 1 }
    ],
    keySignals: [
      { signalId: 'SIG_BLR_SILK_BOARD', name: 'Central Silk Board Junction', location: { lat: 12.9176, lng: 77.6238 } },
      { signalId: 'SIG_BLR_MG_ROAD', name: 'MG Road Trinity Circle', location: { lat: 12.9734, lng: 77.6205 } },
      { signalId: 'SIG_BLR_HEBBAL', name: 'Hebbal Flyover Junction', location: { lat: 13.0358, lng: 77.5970 } }
    ]
  },
  coimbatore: {
    cityId: 'coimbatore',
    cityName: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    timeZone: 'Asia/Kolkata',
    center: { lat: 11.0168, lng: 76.9558 },
    defaultZoom: 14,
    trafficProvider: 'GOOGLE_TRAFFIC',
    trafficDataAvailable: true,
    hospitals: [
      { id: 'HOSP_CBE_1', name: 'Coimbatore Medical College Hospital (CMCH)', lat: 11.0028, lng: 76.9669, emergencyBeds: 40, traumaLevel: 1 },
      { id: 'HOSP_CBE_2', name: 'KMCH Avinashi Road', lat: 11.0425, lng: 77.0360, emergencyBeds: 35, traumaLevel: 1 }
    ],
    keySignals: [
      { signalId: 'SIG_CBE_GANDHI', name: 'Gandhipuram Signal', location: { lat: 11.0168, lng: 76.9558 } },
      { signalId: 'SIG_CBE_LAKSHMI', name: 'Lakshmi Mills Junction', location: { lat: 11.0085, lng: 76.9805 } }
    ]
  }
};

function getCityConfig(cityId) {
  const normalized = (cityId || 'chennai').toLowerCase();
  return SUPPORTED_CITIES[normalized] || SUPPORTED_CITIES.chennai;
}

function listAvailableCities() {
  return Object.values(SUPPORTED_CITIES).map(c => ({
    cityId: c.cityId,
    cityName: c.cityName,
    state: c.state,
    country: c.country,
    center: c.center,
    hospitalsCount: c.hospitals.length,
    signalsCount: c.keySignals.length
  }));
}

module.exports = {
  SUPPORTED_CITIES,
  getCityConfig,
  listAvailableCities
};

