# DO188 Capstone: Complete Podman Command Demonstrations

This document provides exact, tested Podman CLI workflows fulfilling all requirements of Red Hat DO188 container administration.

---

## 1. Container Image Build (`podman build`)

Build the multi-stage OCI container image using [`Containerfile`](../Containerfile):

```bash
# Build Version 1 (v1)
podman build -t roadresq-backend:v1 -f Containerfile .

# Build Version 2 (v2 with updated production metadata & layer optimizations)
podman build -t roadresq-backend:v2 -f Containerfile .
```

---

## 2. Image Inspection & List (`podman images`, `podman inspect`)

List all container images present in local storage:

```bash
# List local images
podman images

# Filter for ROAD RESQ images
podman images | grep roadresq

# Inspect image architecture, layers, labels, and exposed ports
podman inspect roadresq-backend:v1 --format '{{json .Config}}'
```

---

## 3. Dedicated Container Network & Volume Creation (DO188 Storage)

Create an isolated bridge network and persistent volume for MongoDB:

```bash
# Create dedicated bridge network
podman network create roadresq-net

# Create named persistent volume for database data
podman volume create roadresq-mongo-data

# Verify volume creation and storage path
podman volume ls
podman volume inspect roadresq-mongo-data
```

---

## 4. Run Persistent Database Container

Run the persistent database container attached to the shared bridge network:

```bash
podman run -d \
  --name roadresq-db \
  --network roadresq-net \
  --restart always \
  -v roadresq-mongo-data:/data/db:Z \
  -p 27017:27017 \
  docker.io/library/mongo:7.0
```

*Note: The `:Z` flag configures SELinux labeling on Red Hat Enterprise Linux / Fedora.*

---

## 5. Run Application Container (`podman run`)

Launch the ROAD RESQ AI multi-stage container attached to the same network:

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

---

## 6. Container Lifecycle Management

```bash
# List active running containers
podman ps

# List all containers (including stopped)
podman ps -a

# View real-time container log output
podman logs roadresq-app
podman logs -f roadresq-app --tail 50

# Stop container
podman stop roadresq-app

# Start container
podman start roadresq-app

# Restart container
podman restart roadresq-app

# Execute interactive / diagnostic commands inside container
podman exec -it roadresq-app curl -s http://localhost:5000/api/health
podman exec -it roadresq-app sh -c "env | grep -E 'NODE_ENV|PORT|MONGODB_URI'"

# Inspect container runtime state and IP address
podman inspect roadresq-app --format '{{.NetworkSettings.IPAddress}}'
podman inspect roadresq-app --format '{{.State.Status}}'

# Remove container
podman stop roadresq-app
podman rm roadresq-app
```

---

## 7. Database Persistence Verification Test

Demonstrates that MongoDB data survives container destruction and recreation:

```bash
# Step 1: Insert verification record into roadresq database
podman exec -it roadresq-db mongosh roadresq --eval 'db.incidents.insertOne({ id: "TEST_INCIDENT_1", title: "Persistence Verification", timestamp: new Date() })'

# Step 2: Query the inserted record
podman exec -it roadresq-db mongosh roadresq --eval 'db.incidents.find({ id: "TEST_INCIDENT_1" })'

# Step 3: Destroy the database container (simulate server failure)
podman stop roadresq-db
podman rm roadresq-db

# Step 4: Recreate database container mounting the EXACT SAME persistent volume
podman run -d \
  --name roadresq-db \
  --network roadresq-net \
  --restart always \
  -v roadresq-mongo-data:/data/db:Z \
  -p 27017:27017 \
  docker.io/library/mongo:7.0

# Step 5: Verify data persisted across container destruction
podman exec -it roadresq-db mongosh roadresq --eval 'db.incidents.find({ id: "TEST_INCIDENT_1" })'
# Output proves persistence: { id: 'TEST_INCIDENT_1', title: 'Persistence Verification', ... }
```

---

## 8. GitHub Container Registry (GHCR) Publishing Workflow

```bash
# Step 1: Authenticate to GitHub Container Registry
# (Generate GitHub Personal Access Token (PAT) with write:packages permission)
echo $CR_PAT | podman login ghcr.io -u kj0232-blip --password-stdin

# Step 2: Tag images for GHCR
podman tag roadresq-backend:v1 ghcr.io/kj0232-blip/roadresq-backend:v1
podman tag roadresq-backend:v2 ghcr.io/kj0232-blip/roadresq-backend:v2
podman tag roadresq-backend:v2 ghcr.io/kj0232-blip/roadresq-backend:latest

# Step 3: Push images to remote registry
podman push ghcr.io/kj0232-blip/roadresq-backend:v1
podman push ghcr.io/kj0232-blip/roadresq-backend:v2
podman push ghcr.io/kj0232-blip/roadresq-backend:latest

# Step 4: Pull image on a fresh host or testing machine
podman pull ghcr.io/kj0232-blip/roadresq-backend:v2
```
