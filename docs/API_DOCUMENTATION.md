# ROAD RESQ AI – API Documentation

All endpoints are hosted at `http://localhost:5000/api`.

### 1. Cities & Health
- `GET /api/health` - Server health status and simulation state.
- `GET /api/cities` - List supported cities (`chennai`, `bengaluru`, `coimbatore`).
- `GET /api/cities/:cityId` - Get city center, hospitals, and signal network.

### 2. Traffic Intelligence
- `GET /api/traffic/live?cityId=chennai` - Monitored corridor congestion and delay ratios.
- `GET /api/traffic/corridors?cityId=chennai` - Configured arterial routes.
- `GET /api/traffic/observations?cityId=chennai` - Historical traffic logs.
- `POST /api/traffic/refresh` - Trigger corridor traffic refresh.

### 3. Emergency & Route Optimization
- `POST /api/routes/optimize` - OSRM road geometry calculation with simulated signal preemption.
- `POST /api/routes/alternatives` - Compare fastest vs shortest vs low-congestion routes.
- `POST /api/emergency/dispatch` - Dispatch ambulance and activate Green Corridor.
- `POST /api/emergency/cancel` - Release green corridor and restore automated signal cycles.
- `GET /api/emergency/available-ambulances?cityId=chennai` - List available units with medical capabilities.

### 4. Crane & Breakdown Recovery
- `GET /api/crane/fleet?cityId=chennai` - List registered hydraulic flatbeds and haulers.
- `GET /api/crane/requests?cityId=chennai` - List roadside recovery requests.
- `POST /api/crane/request` - Create towing request and auto-assign nearest crane.

### 5. Road Hazards & Bridge Patrol
- `GET /api/hazards?cityId=chennai` - List reported potholes, damaged bridges, and flooding.
- `POST /api/hazards` - Citizen hazard reporting.
- `PATCH /api/hazards/:hazardId/verify` - Administrator verification and road blockage toggle.

### 6. Hospital Discovery
- `GET /api/hospitals/discover?cityId=chennai` - OSM Overpass live discovery with verified trauma center fallback.

