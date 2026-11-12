/**
 * City-Specific Monitored Key Corridors
 * Prevents scanning all roads; limits API calls to critical emergency arterial routes.
 */

const MONITORED_CORRIDORS = {
  chennai: [
    {
      routeId: 'CORR_CHN_ANNA_SALAI',
      name: 'Anna Salai Central Arterial',
      origin: { lat: 13.0827, lng: 80.2707 }, // Central Station
      destination: { lat: 13.0519, lng: 80.2514 } // Anna Flyover / Gemini
    },
    {
      routeId: 'CORR_CHN_KATHIPARA_EXP',
      name: 'Kathipara Junction Trunk',
      origin: { lat: 13.0519, lng: 80.2514 },
      destination: { lat: 13.0076, lng: 80.2038 } // Kathipara
    },
    {
      routeId: 'CORR_CHN_POONAMALLEE',
      name: 'Poonamallee High Road ER Way',
      origin: { lat: 13.0805, lng: 80.2778 }, // Rajiv Gandhi GH
      destination: { lat: 13.0732, lng: 80.2210 }
    }
  ],
  bengaluru: [
    {
      routeId: 'CORR_BLR_SILK_BOARD',
      name: 'Hosur Road - Silk Board Junction',
      origin: { lat: 12.9716, lng: 77.5946 },
      destination: { lat: 12.9176, lng: 77.6238 }
    },
    {
      routeId: 'CORR_BLR_OLD_AIRPORT',
      name: 'Old Airport Road Trauma Link',
      origin: { lat: 12.9734, lng: 77.6205 },
      destination: { lat: 12.9592, lng: 77.6444 } // Manipal Hospital
    }
  ],
  coimbatore: [
    {
      routeId: 'CORR_CBE_AVINASHI_RD',
      name: 'Avinashi Road Express Link',
      origin: { lat: 11.0168, lng: 76.9558 }, // Gandhipuram
      destination: { lat: 11.0425, lng: 77.0360 } // KMCH
    }
  ]
};

function getMonitoredCorridors(cityId) {
  const normalized = (cityId || 'chennai').toLowerCase().trim();
  return MONITORED_CORRIDORS[normalized] || MONITORED_CORRIDORS.chennai;
}

module.exports = {
  MONITORED_CORRIDORS,
  getMonitoredCorridors
};

