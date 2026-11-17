// --- 1. Basic Coordinates ---
export interface RoadCoordinate {
  latitude: number;
  longitude: number;
}

export type CongestionLevel = 'Low' | 'Medium' | 'High' | 'Severe' | 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';

export interface RoadSegment {
  segmentId: string;
  name: string;
  startPoint: RoadCoordinate;
  endPoint: RoadCoordinate;
  congestionLevel: CongestionLevel;
  vehicleCount: number;
  speedKmph: number;
  isSimulated: boolean;
  source: string;
  timestamp: string;
}

export interface CongestionSegment {
  segmentId: string;
  name: string;
  congestionLevel: CongestionLevel;
  vehicleCount: number;
  averageSpeedKmph: number;
  jamFactor: number;
  isSimulated: boolean;
}

// --- 2. City & Hospitals ---
export interface City {
  cityId: string;
  cityName: string;
  state: string;
  country: string;
  center: { lat: number; lng: number };
  hospitalsCount?: number;
  signalsCount?: number;
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  emergencyBeds?: number;
  traumaLevel: number;
  phone?: string;
  address?: string;
  city?: string;
  area?: string;
  website?: string;
  type?: string;
  specialties?: string[];
  hasEmergencyDepartment?: boolean;
  source?: string;
  lastUpdated?: string;
  routeDistanceKm?: number;
  estimatedTransitMinutes?: number;
  routePolyline?: [number, number][];
  suitabilityScore?: number;
  rankingExplanation?: string;
}

// --- 3. Ambulances & Simulation ---
export type AmbulanceStatus = 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'PAUSED';

export interface AmbulanceData {
  id: string;
  isActive: boolean;
  currentLocation: { lat: number; lng: number };
  destination: { lat: number; lng: number } | null;
  greenCorridorEnabled: boolean;
  speedKmph?: number;
}

// --- 4. Routing ---
export interface RouteOptimizationData {
  distanceKm: number;
  estimatedMinutes: number;
  standardMinutesWithoutCorridor: number;
  timeSavedMinutes: number;
  pathCoordinates: [number, number][];
}

export interface RouteAlternative {
  routeId: string;
  name: string;
  distanceKm: number;
  trafficDurationMinutes: number;
  normalDurationMinutes?: number;
  timeSavedMinutes?: number;
  congestionLevel: string;
  recommendationReason: string;
  pathCoordinates?: [number, number][];
}

// --- 5. Traffic Signals ---
export interface TrafficSignal {
  signalId: string;
  name: string;
  location: { lat: number; lng: number };
  state: 'RED' | 'YELLOW' | 'GREEN';
  isGreenCorridorOverridden: boolean;
  cycleDurationSeconds?: number;
  lastStateChange?: string;
}

// --- 6. Crane & Towing Assistance ---
export interface CraneVehicle {
  id: string;
  cityId: string;
  name: string;
  serviceType: string;
  capacityTons: number;
  phone: string;
  location: { lat: number; lng: number };
  status: 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'BUSY';
}

export interface CraneRequestItem {
  requestId: string;
  cityId: string;
  citizenName: string;
  contactPhone: string;
  vehicleCategory: string;
  breakdownType: string;
  location: { name: string; lat: number; lng: number };
  description: string;
  assignedCraneId: string | null;
  assignedCraneName: string | null;
  status: string;
  etaMinutes: number;
  createdAt: string;
}

// --- 7. Road Hazard & Bridge Management ---
export interface RoadHazardItem {
  hazardId: string;
  cityId: string;
  hazardType: 'POTHOLE' | 'DAMAGED_BRIDGE' | 'ROAD_CRACK' | 'WATERLOGGING' | 'OBSTRUCTION' | 'ACCIDENT_PRONE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: { name: string; lat: number; lng: number };
  description: string;
  reportedBy: string;
  verificationStatus: 'SUBMITTED' | 'VERIFIED' | 'IN_REPAIR' | 'REPAIRED' | 'REJECTED';
  isBlockingTraffic: boolean;
  assignedMaintenanceTeam?: string;
  reportedAt: string;
}
