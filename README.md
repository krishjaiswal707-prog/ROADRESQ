# 🚦 ROAD RESQ AI
> **Smart Integrated Traffic & Emergency Assistance Management System**
>
> College Capstone Project · Multi-City Free-First Emergency Operations & Dynamic Green Corridor System

---

## 📌 Executive Summary
**ROAD RESQ AI** is an intelligent, free-first emergency response and traffic management platform built for Indian metropolitan cities (**Chennai**, **Bengaluru**, and **Coimbatore**). The system eliminates mandatory commercial map dependencies by combining:
- **Interactive Street Mapping:** React-Leaflet + OpenStreetMap standard tiles (100% free with compliant attribution).
- **Road Routing & Snapping:** Open Source Routing Machine (OSRM) for high-fidelity road geometries and driving distances.
- **Traffic Telemetry:** TomTom Traffic Flow API (free tier) + internal deterministic congestion engine.
- **Priority Routing Algorithms:** Dijkstra and A* search engines for traffic-weighted corridor computation and signal preemption.
- **Multi-Agency Support:** Ambulance Green Corridors, Towing & Crane Assistance, Bridge & Road Hazard Patrol, and Overpass Hospital Discovery.

---

## ✨ System Modules & Features

| Module | Core Functionality | Technologies Used |
|---|---|---|
| 🚑 **Ambulance Green Corridor** | Emergency dispatch, triage severity matching (ALS/BLS), simulated signal preemption, and real-time GPS movement. | OSRM, Dijkstra, A*, Socket.IO |
| 🗺️ **Free-First Street Mapping** | Real city street rendering, smooth fly-to city switching, custom DivIcon markers for hospitals, signals, and ambulances. | React-Leaflet, OpenStreetMap |
| 🚦 **Traffic Congestion Intelligence** | Monitored arterial corridors, delay ratio classification (`LOW`, `MODERATE`, `HIGH`, `SEVERE`), and incident tracking. | TomTom API, Mongoose, Socket.IO |
| 🏗️ **Crane & Towing Assistance** | Citizen breakdown intake, automated nearest-crane matching, and dispatch lifecycle management. | Express REST, Mongoose |
| 🚧 **Road Hazard & Bridge Patrol** | Citizen reporting of potholes, structural defects, and waterlogging with admin verification and routing blockage influence. | Leaflet, Express REST |
| 🏥 **Hospital Discovery** | Real hospital queries around city coordinates with bed tracking and trauma level filters. | OpenStreetMap Overpass API |

---

## 🛠️ Technology Stack
- **Frontend:** React 19, TypeScript, Vite, React-Leaflet, Leaflet, Lucide React, Socket.IO Client.
- **Backend:** Node.js, Express.js, MongoDB (Embedded In-Memory Server & Atlas Mongoose support), Socket.IO.
- **APIs & Free Engines:** OpenStreetMap Tiles, OSRM Route API, TomTom Traffic Flow API (Free tier), OpenStreetMap Overpass API.

---

## 🚀 Quick Startup Guide

### Prerequisites
- Node.js (v18+ recommended)
- PowerShell or any standard terminal

### 1. Start the Backend Server
```powershell
cd backend
npm install
node src/server.js
```
*Note: The backend automatically spins up an In-Memory MongoDB server out-of-the-box if no cloud URI is provided.*

### 2. Start the Frontend Application
```powershell
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Testing & Verification
All test suites can be executed with 0 paid external dependencies:
```powershell
cd backend
node test/master_capstone_test.js
node test/free_stack_test.js
node test/phase4_test.js
node test/phase5_test.js
```

---

## 📖 Detailed Documentation
- [System Architecture](file:///C:/Users/krish/Downloads/roadresq/docs/ARCHITECTURE.md)
- [API Documentation](file:///C:/Users/krish/Downloads/roadresq/docs/API_DOCUMENTATION.md)
- [Viva & Demo Walkthrough Guide](file:///C:/Users/krish/Downloads/roadresq/docs/DEMO_GUIDE.md)

---
*ROAD RESQ AI — Built for Capstone Project Evaluation and Viva Demonstration.*
