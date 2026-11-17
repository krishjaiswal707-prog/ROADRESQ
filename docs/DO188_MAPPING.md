# Red Hat DO188 Capstone: Curriculum & Chapter Mapping

This document provides the formal mapping between the **Red Hat DO188: Red Hat OpenShift I: Containers & Kubernetes** course objectives and the **ROAD RESQ AI** project implementation.

---

## Academic Alignment Overview

ROAD RESQ AI implements containerized microservices and automated emergency corridor operations organized into three comprehensive capstone modules:

1. **Module 1: Traffic and Infrastructure Intelligence**
   - Core Dijkstra / A* routing optimization engine.
   - OSRM road geometry snapping with zero Google billing.
   - Automated Green Corridor signal preemption.
   - Road hazard identification and dynamic detour calculation.

2. **Module 2: Emergency and Assistance Management**
   - Ambulance triage matching (ALS/BLS vehicle dispatch).
   - Real-time GPS movement beacon via WebSockets (`Socket.IO`).
   - Heavy crane and towing recovery dispatch workflow.
   - OpenStreetMap Overpass hospital discovery & resource directory.

3. **Module 3: Linux and Podman Container Operations**
   - Multi-stage OCI Containerfile development.
   - Rootless container execution and Linux security hardening.
   - Local container lifecycle management and health monitoring.
   - Persistent volume storage and network isolation.
   - GitHub Container Registry (GHCR) package distribution.

---

## Detailed DO188 Course Chapter Mapping

### Chapter 1: Introduction to Container Technologies
- **DO188 Objective:** Describe container architecture, namespaces, cgroups, and comparison with traditional virtual machines.
- **Project Implementation:**
  - Standardized on Open Container Initiative (OCI) image format.
  - Utilizes kernel namespaces for process and network isolation.
  - Implements lightweight base images (`node:20-alpine`) minimizing host attack surface.

### Chapter 2: Creating Container Images
- **DO188 Objective:** Formulate container image definitions, understand Dockerfile/Containerfile directives, and manage image layers.
- **Project Implementation:**
  - File: [`Containerfile`](../Containerfile).
  - Implements 3-stage multi-stage build: `frontend-builder`, `backend-builder`, and minimal production `runner`.
  - Employs `.containerignore` to eliminate build context bloat and prevent secret leakage.

### Chapter 3: Managing Container Images
- **DO188 Objective:** Inspect, tag, export, import, and push container images to remote registries.
- **Project Implementation:**
  - Tags: `roadresq-backend:v1`, `roadresq-backend:v2`, and `latest`.
  - Registry: GitHub Container Registry (`ghcr.io/kj0232-blip/roadresq-backend`).
  - Inspection: OCI labels, exposed ports (`5000`, `5173`), and environmental variables documented in [`PODMAN_COMMANDS.md`](PODMAN_COMMANDS.md).

### Chapter 4: Running Containers with Podman
- **DO188 Objective:** Execute, detach, attach, and monitor containers using the Podman CLI.
- **Project Implementation:**
  - Automated deployment commands: `podman run -d --name roadresq-app -p 5000:5000 -p 5173:5173 ...`.
  - Runtime verification with `podman ps`, `podman logs`, and `podman inspect`.
  - Non-root user execution (`USER node`) enforcing security best practices.

### Chapter 5: Managing Container Storage
- **DO188 Objective:** Attach bind mounts and named persistent volumes to survive container destruction.
- **Project Implementation:**
  - Storage: Named persistent volume `roadresq-mongo-data`.
  - SELinux compatibility: `:Z` flag applied for Red Hat Enterprise Linux / Fedora hosts.
  - Persistence test: Verified database writes survive container removal (`podman rm`) and container recreation.

### Chapter 6: Managing Container Networking
- **DO188 Objective:** Configure container networking, port mapping, DNS resolution, and custom bridge networks.
- **Project Implementation:**
  - Network: Custom bridge network `roadresq-net`.
  - Service Discovery: The application resolves `roadresq-db` over internal container DNS.
  - Ingress: Port 5000 (Backend API & WebSockets) and Port 5173 (Frontend Leaflet Dashboard) published to host.

### Chapter 7: Troubleshooting and Debugging Containers
- **DO188 Objective:** Inspect container logs, access interactive shells, and diagnose container crashes.
- **Project Implementation:**
  - Health check directive (`HEALTHCHECK`) checking `http://localhost:5000/api/health`.
  - Diagnostics via `podman exec -it roadresq-app curl ...` and environment verification.
  - Real-time logging through standard streams (`stdout`/`stderr`).

### Chapter 8: Multi-Container Applications & Deployment Orchestration
- **DO188 Objective:** Deploy multi-tier applications with interconnected database and frontend tiers.
- **Project Implementation:**
  - Multi-tier stack: Frontend Dashboard (React/Leaflet) + Backend Engine (Express/Socket.IO) + Persistent Database (MongoDB).
  - Fallback resilience: Automatic local in-memory MongoDB activation if standalone MongoDB container is offline.
