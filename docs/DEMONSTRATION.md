# DO188 Capstone: System Demonstration & Evaluation Walkthrough

This document outlines the step-by-step demonstration walkthrough for the **ROAD RESQ AI** platform as required for the DO188 capstone evaluation.

---

## Part 1: Application Architecture & Live Operation

### 1. Verification of Free-First Open GIS Stack
1. Open the interactive dashboard at **http://127.0.0.1:5173**.
2. Verify OpenStreetMap tile rendering (no Google Cloud API keys or billable endpoints).
3. Switch active city between **Chennai** and **Bengaluru** from the top header dropdown:
   - Chennai Road Graph: 12 arterial junctions (Central, Gemini, Guindy, Marina, OMR, etc.).
   - Bengaluru Road Graph: 10 major intersections (Majestic, MG Road, Indiranagar, Koramangala, Whitefield, etc.).

### 2. Green Corridor Signal Preemption Simulation
1. Click **"Dispatch Emergency"** or trigger the Ambulance Green Corridor module.
2. Observe:
   - Green priority polyline snapping directly to authentic road curves via OSRM.
   - Signal indicators along the trajectory switching to green ahead of the vehicle beacon.
   - Computed ~42% travel time savings calculated in comparison to regular traffic.

### 3. Hazard & Towing Recovery Dispatch
1. Open the **"Hazard Management"** panel to view reported road obstructions.
2. Select an incident and click **"Dispatch Recovery Crane"**:
   - Matches nearest recovery unit based on capacity (Light, Medium, Heavy-duty).
   - Dynamically flags road edges as blocked, forcing the routing engine to detour traffic.

---

## Part 2: Podman & Linux Container Demonstrations

### 1. Multi-Stage Container Build
Run the following build command to produce the minimal production image:
```bash
podman build -t roadresq-backend:v1 -f Containerfile .
```
Expected output:
- Stage 1 compiles React frontend assets (`vite build`).
- Stage 2 resolves native backend dependencies.
- Stage 3 copies production artifacts into a hardened `node:20-alpine` runtime running as non-root `USER node`.

### 2. Running the Complete Multi-Tier Stack
```bash
# 1. Create bridge network
podman network create roadresq-net

# 2. Create persistent volume
podman volume create roadresq-mongo-data

# 3. Launch database
podman run -d --name roadresq-db --network roadresq-net -v roadresq-mongo-data:/data/db:Z mongo:7.0

# 4. Launch application
podman run -d --name roadresq-app --network roadresq-net -p 5000:5000 -p 5173:5173 -e MONGODB_URI=mongodb://roadresq-db:27017/roadresq roadresq-backend:v1
```

### 3. Container Inspection & Health Verification
```bash
# Check running status
podman ps

# Verify API health response
curl -i http://localhost:5000/api/health

# Inspect internal container metrics
podman inspect roadresq-app --format '{{.State.Health.Status}}'
```

### 4. Database Persistence Verification
```bash
# Write test record
podman exec -it roadresq-db mongosh roadresq --eval 'db.incidents.insertOne({ id: "CAPSTONE_PERSIST_TEST", status: "VERIFIED" })'

# Restart / Recreate database container
podman stop roadresq-db && podman rm roadresq-db
podman run -d --name roadresq-db --network roadresq-net -v roadresq-mongo-data:/data/db:Z mongo:7.0

# Query test record
podman exec -it roadresq-db mongosh roadresq --eval 'db.incidents.find({ id: "CAPSTONE_PERSIST_TEST" })'
```
The query returns the document, demonstrating complete persistence across container destruction.

---

## Part 3: Versioning and Registry Distribution

```bash
# Image Version 2 Build
podman build -t roadresq-backend:v2 -f Containerfile .

# Tag for GitHub Container Registry
podman tag roadresq-backend:v2 ghcr.io/kj0232-blip/roadresq-backend:v2
podman tag roadresq-backend:v2 ghcr.io/kj0232-blip/roadresq-backend:latest

# Push to GHCR (requires user token authentication)
podman push ghcr.io/kj0232-blip/roadresq-backend:v2
```
