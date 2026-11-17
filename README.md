# ROAD RESQ AI — Smart Integrated Emergency & Traffic Management System

[![Podman](https://img.shields.io/badge/Containerized-Podman%20OCI-purple.svg)](Containerfile)
[![Node.js](https://img.shields.io/badge/Node.js-20.x%20LTS-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x%20TypeScript-blue.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DO188 Capstone](https://img.shields.io/badge/Red%20Hat-DO188%20Capstone-red.svg)](docs/DO188_MAPPING.md)

**ROAD RESQ AI** is an intelligent, integrated emergency response and smart traffic management system designed for urban emergency clearance. Built with a **100% Free-First Open GIS Architecture** (OpenStreetMap, OSRM, Leaflet) and containerized with **Red Hat Podman**, it eliminates proprietary map licensing fees while delivering automated emergency green corridors, ambulance triage, crane recovery, and hazard avoidance.

---

## Academic Capstone Modules

The system is organized into three logical academic modules fulfilling all requirements of the **Red Hat DO188 Capstone**:

* **Module 1: Traffic and Infrastructure Intelligence**
  * Real-world road geometry snapping via OpenStreetMap OSRM.
  * Dijkstra & A* pathfinding heuristics with dynamic traffic congestion penalties.
  * Automated Green Corridor signal preemption saving ~42% transit time.
  * Road hazard tracking with automatic graph recalculation.
* **Module 2: Emergency and Assistance Management**
  * Triage matching (ALS vs. BLS vehicles based on patient criticality).
  * Real-time GPS movement beacon over WebSockets (`Socket.IO`).
  * Heavy crane & towing dispatch engine for rapid road clearance.
  * Hospital discovery directory querying live OpenStreetMap Overpass data.
* **Module 3: Linux and Podman Container Operations**
  * Multi-stage OCI [`Containerfile`](Containerfile) with rootless non-root runtime (`USER node`).
  * Complete container lifecycle management (`build`, `run`, `stop`, `start`, `inspect`, `logs`, `exec`).
  * Named Podman volume persistence for MongoDB.
  * Automated image versioning (`v1`, `v2`, `latest`) and GitHub Container Registry publishing (`ghcr.io/kj0232-blip/roadresq-backend`).

---

## Architecture Blueprint

```
+-----------------------------------------------------------------------------------+
| ROAD RESQ AI CONTAINER (Podman OCI Image)                                         |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  | Frontend Tier (Port 5173)           |  | Backend Tier (Port 5000)           |  |
|  | - React 19 + TypeScript + Leaflet   |  | - Express REST API & WebSockets    |  |
|  | - City Switcher (Chennai/Bengaluru) |  | - Live Traffic Simulation Loop     |  |
|  +-------------------------------------+  +-----------------+------------------+  |
|                                                             |                     |
|                                            +----------------+------------------+  |
|                                            | Routing Engine Service            |  |
|                                            | - Dijkstra / A* Heuristics        |  |
|                                            | - Green Corridor Preemption       |  |
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

Detailed architectural diagrams and flowcharts are available in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Quick Start (Podman Container)

### 1. Build the Multi-Stage Image
```bash
podman build -t roadresq-backend:v1 -f Containerfile .
```

### 2. Create Network and Persistent Storage Volume
```bash
podman network create roadresq-net
podman volume create roadresq-mongo-data
```

### 3. Launch the Persistent Database
```bash
podman run -d \
  --name roadresq-db \
  --network roadresq-net \
  --restart always \
  -v roadresq-mongo-data:/data/db:Z \
  -p 27017:27017 \
  docker.io/library/mongo:7.0
```

### 4. Launch the ROAD RESQ Application
```bash
podman run -d \
  --name roadresq-app \
  --network roadresq-net \
  -p 5000:5000 \
  -p 5173:5173 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGODB_URI=mongodb://roadresq-db:27017/roadresq \
  -e DEFAULT_CITY_ID=chennai \
  localhost/roadresq-backend:v1
```

Access the application:
- **Interactive Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## Local Development (Without Containers)

### Prerequisites
- Node.js 20+ installed.

### Backend Setup
```bash
cd backend
npm install
npm start
# Server starts at http://localhost:5000 (MongoDB in-memory automatically initializes if no URI provided)
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
# Dashboard available at http://127.0.0.1:5173
```

---

## Detailed Documentation Links

- **Podman CLI Demonstrations:** [`docs/PODMAN_COMMANDS.md`](docs/PODMAN_COMMANDS.md)
- **DO188 Curriculum Mapping:** [`docs/DO188_MAPPING.md`](docs/DO188_MAPPING.md)
- **Engineering Methodology:** [`docs/METHODOLOGY.md`](docs/METHODOLOGY.md)
- **Demonstration Walkthrough:** [`docs/DEMONSTRATION.md`](docs/DEMONSTRATION.md)
- **System Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
