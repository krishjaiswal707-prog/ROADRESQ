# Architecture: ROAD RESQ AI System Design

This document details the software architecture, communications flow, and container networking topology for the **ROAD RESQ AI** platform.

---

## 1. High-Level System Architecture

ROAD RESQ AI integrates three logical academic modules designed for emergency vehicle clearance and traffic operations:

```
[ User Browser / Traffic Controller ]
                |
                v  (HTTP :5173 / WebSocket :5000)
+-----------------------------------------------------------------------------------+
| ROAD RESQ AI CONTAINER (Podman OCI Image)                                         |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  | Frontend Tier (Port 5173)           |  | Backend Tier (Port 5000)           |  |
|  | - React 19 + TypeScript + Vite      |  | - Express.js REST API              |  |
|  | - Leaflet Real-time Map GIS         |  | - Socket.IO Real-time Server       |  |
|  | - City Switcher (Chennai/Bengaluru) |  | - Live Traffic Simulation Loop     |  |
|  +-------------------------------------+  +-----------------+------------------+  |
|                                                             |                     |
|                                            +----------------+------------------+  |
|                                            | Routing Engine Service            |  |
|                                            | - Dijkstra / A* Heuristics        |  |
|                                            | - Dynamic Traffic Weighting       |  |
|                                            | - Green Corridor Preemption       |  |
|                                            +----------------+------------------+  |
|                                                             |                     |
|                                            +----------------+------------------+  |
|                                            | Module Subsystems                 |  |
|                                            | - Ambulance Triage (ALS/BLS)      |  |
|                                            | - Crane Recovery Dispatch         |  |
|                                            | - Road Hazard Monitoring          |  |
|                                            | - Hospital Directory (Overpass)   |  |
|                                            +----------------+------------------+  |
+-------------------------------------------------------------|---------------------+
                                                              v
+-----------------------------------------------------------------------------------+
| PERSISTENT DATABASE TIER                                                          |
|  - MongoDB Container (Port 27017)                                                 |
|  - Backed by Podman Persistent Volume: roadresq-mongo-data                        |
|  - Auto-fallback to MongoMemoryServer when offline                                |
+-----------------------------------------------------------------------------------+
```

---

## 2. Capstone Module Breakdown

### Module 1: Traffic and Infrastructure Intelligence
- **Dijkstra & A\* Engine:** Multi-attribute path cost calculation incorporating live speed drops.
- **Green Corridor Signal Synchronization:** Preempts upcoming traffic light cycles along the calculated emergency path.
- **Road Hazard Patrol:** Tracks structural damage, waterlogging, or blocked lanes, modifying graph adjacency weights dynamically.

### Module 2: Emergency and Assistance Management
- **Ambulance Triage Matching:** Matches patient urgency (`Critical / High / Moderate`) with vehicle telemetry (`ALS / BLS`).
- **Heavy Towing & Crane Dispatch:** Distance-scored crane allocation to rapidly clear obstructions.
- **Hospital Directory:** Real-time lookup of nearest trauma centers, ICU capacity, and oxygen facilities using OpenStreetMap data.

### Module 3: Linux and Podman Container Operations
- **Containerfile Architecture:** Multi-stage build separating compile-time dependencies from the production runtime.
- **Container Networking:** Custom bridge network providing DNS resolution between containers (`roadresq-net`).
- **Storage Management:** Volume mounting with SELinux `:Z` flag preserving state across container lifecycle operations.
- **Image Distribution:** Tagged and packaged for GitHub Container Registry (`ghcr.io/kj0232-blip/roadresq-backend`).
