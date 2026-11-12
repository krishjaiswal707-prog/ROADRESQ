# ROAD RESQ AI – Step-by-Step Viva & Capstone Demonstration Guide

## 1. Project Launch
Ensure backend and frontend are running:
```powershell
# Terminal 1:
cd C:\Users\krish\Downloads\roadresq\backend
node src/server.js

# Terminal 2:
cd C:\Users\krish\Downloads\roadresq\frontend
npm run dev
```
Open **`http://localhost:5173`** in Chrome/Edge.

---

## 2. Interactive Capstone Demonstration Walkthrough

### Step 1: Multi-City Isolation & Street Map Loading
1. Observe the live **OpenStreetMap** street view with attribution.
2. In the top-right header, switch between **Chennai**, **Bengaluru**, and **Coimbatore**.
3. Notice how the map smoothly flies to each city's center, loading city-specific signals, hospitals, and corridor feeds.

### Step 2: Emergency Green Corridor & Ambulance Dispatch
1. Switch to **Chennai**.
2. On the left panel under **Ambulance Green Corridor**, choose **Apollo Hospitals Greams Road** (or Rajiv Gandhi GH).
3. Click **"Dispatch Ambulance (Green Corridor)"**.
4. **Observe:**
   - A bright green road-snapped corridor appears along real city streets.
   - The route comparison stats update, demonstrating estimated **time saved**.
   - The ambulance marker (`🚑`) appears and begins moving along the corridor.
   - Traffic signals along the corridor turn **GREEN** with an active preemption ring.
5. Click **"Cancel & Release Corridor"** to demonstrate manual override release.

### Step 3: Crane & Breakdown Assistance
1. Click the **"Crane & Towing Service"** tab in the top navigation bar.
2. Review the registered heavy-duty flatbed fleet for the selected city.
3. Click **"Request Tow"**, pick vehicle category (e.g., *SUV / 4x4*), select incident (*Collision / Tow Recovery*), and submit.
4. Observe the system immediately calculate the nearest crane unit, assign it, and output an ETA.

### Step 4: Road Hazard & Bridge Structural Reporting
1. Click the **"Road Hazards & Bridges"** tab.
2. Click **"Report Hazard"**, select **Deep Crater / Pothole** with **Critical** severity, and submit.
3. Review the newly submitted hazard report.
4. Click **"Verify & Reroute"** to simulate highway department verification and automatic traffic avoidance.

### Step 5: Overpass Live Hospital Discovery
1. Click the **"Hospital Directory"** tab.
2. Notice the real discovered hospital facilities loaded from OpenStreetMap Overpass.
3. Type in the search box (e.g. *"Apollo"* or *"General"*) or click **"Level 1 Only"** to filter facilities.
4. Click any hospital in the list to inspect bed availability and view it highlighted on the map.
