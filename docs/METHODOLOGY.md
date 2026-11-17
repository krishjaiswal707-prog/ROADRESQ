# Methodology: ROAD RESQ AI Engineering & DO188 Design

This document details the engineering methodology, design rationale, and container operational lifecycle for the **ROAD RESQ AI** platform.

---

## 1. System Design Rationale

Modern emergency vehicle navigation frequently suffers from two critical flaws:
1. **Commercial Vendor Lock-in & Billing Overhead:** Heavy dependency on proprietary APIs (e.g., Google Maps Platform) leads to unsustainable costs and restrictive terms of service.
2. **Disconnected Traffic Signaling:** Standard navigation platforms inform drivers of traffic but cannot proactively mitigate congestion or clear upcoming signals.

**ROAD RESQ AI** addresses these challenges through a three-tier architecture:
- **Free-First GIS Engine:** OpenStreetMap road geometry via OSRM and Overpass API with local heuristic fallbacks.
- **Dynamic Heuristic Optimization:** Multi-attribute Dijkstra and A* pathfinding incorporating live road segment delays.
- **Containerized Operational Blueprint:** Hardened, reproducible deployment on Red Hat Enterprise Linux and Podman adhering to Open Container Initiative (OCI) standards.

---

## 2. Multi-Stage Container Strategy

To optimize image size, build security, and operational compliance, the container architecture employs a **3-stage build pipeline**:

```
+-------------------------------------------------------------+
| STAGE 1: frontend-builder (Node.js 20 Alpine)               |
| -> Installs frontend dependencies (npm ci)                  |
| -> Compiles React + Vite + TypeScript assets to /dist       |
+-------------------------------------------------------------+
                              |
                              v  (Artifacts: /frontend/dist)
+-------------------------------------------------------------+
| STAGE 2: backend-builder (Node.js 20 Alpine)                |
| -> Installs native toolchain (python3, make, g++)           |
| -> Compiles native dependencies                             |
+-------------------------------------------------------------+
                              |
                              v  (Production node_modules)
+-------------------------------------------------------------+
| STAGE 3: Production Runtime (Node.js 20 Alpine Minimal)     |
| -> Unprivileged non-root user (USER node)                   |
| -> Hardened healthcheck probe (/api/health)                 |
| -> Runs backend API (5000) & static dashboard (5173)        |
+-------------------------------------------------------------+
```

### Key Security & Performance Benefits
1. **Minimal Attack Surface:** Build tools (Python, make, gcc) are discarded before the final production image is generated.
2. **Rootless Operation:** Enforces `USER node` to prevent root privilege escalation inside container namespaces.
3. **Layer Caching:** Package manifests are copied and resolved independently of source code changes.

---

## 3. Database Persistence & Resilience Engineering

ROAD RESQ AI provides dual-mode data persistence:

1. **Production Mode (Named Podman Volume):**
   - Connects to an external or containerized MongoDB instance via `MONGODB_URI=mongodb://roadresq-db:27017/roadresq`.
   - Attaches a named volume `roadresq-mongo-data` mounted at `/data/db:Z` with SELinux labeling.
   - Guarantees zero data loss across container teardown, system reboot, or image upgrades.

2. **Autonomous Cold-Start Fallback (In-Memory Engine):**
   - If no external database URI is detected, the server automatically instantiates an embedded in-memory MongoDB server (`mongodb-memory-server`).
   - Ensures seamless local testing, continuous integration checks, and offline development without external database prerequisites.
