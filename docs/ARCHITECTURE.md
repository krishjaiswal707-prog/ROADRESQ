# ROAD RESQ AI – System Architecture

## 1. Overview
**ROAD RESQ AI** is a free-first, intelligent traffic management and multi-agency emergency assistance system supporting Chennai, Bengaluru, and Coimbatore. It eliminates mandatory commercial map dependencies by using OpenStreetMap (OSM), Leaflet, OSRM road geometry, TomTom Traffic Flow API (free tier), and local in-memory/Atlas MongoDB.

```
┌────────────────────────────────────────────────────────────────┐
│                   REACT + TYPESCRIPT DASHBOARD                 │
│   (React-Leaflet · OpenStreetMap Tiles · Lucide Emergency UI)  │
└───────────────────────────────┬────────────────────────────────┘
                                │ HTTP REST / WebSocket (Socket.IO)
┌───────────────────────────────▼────────────────────────────────┐
│                     EXPRESS.JS BACKEND                         │
│  ├── Modules: Traffic, Ambulance, Crane, Hazards, Hospitals    │
│  ├── Routing: Dijkstra & A* Engines + OSRM Integration         │
│  └── Telemetry: City-Scoped Socket Rooms (city:chennai, etc.)  │
└──────┬──────────────────┬──────────────────┬───────────────────┘
       │                  │                  │
┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
│  OSRM API   │    │  TomTom API │    │   MongoDB   │
│ Road Snapped│    │ Traffic Flow│    │ In-Memory / │
│  Geometries │    │  Free Tier  │    │ Mongoose DB │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 2. Key Modules
1. **Smart Traffic & Green Corridor Engine:** Live corridor delay calculation, simulated signal preemption, and dynamic time-savings.
2. **Crowdsourced Ambulance Dispatch:** Emergency severity matching (ALS/BLS), Dijkstra traffic-weighted routing, and real-time movement beacon.
3. **Crane & Vehicle Breakdown Recovery:** Request intake for immobilized vehicles and automated nearest-crane dispatch.
4. **Bridge, Pothole & Road Hazard Patrol:** Citizen hazard reporting, administrator verification, and road blockage rerouting.
5. **Hospital Discovery:** Real hospital search via OpenStreetMap Overpass API with local verified trauma registries.
