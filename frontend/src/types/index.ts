// 1. Traffic Contracts
export interface RoadCoordinate {
  latitude: number;
  longitude: number;
}

export type CongestionLevel = 'Low' | 'Medium' | 'High' | 'Severe';

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

// Legacy alias for existing dashboard widgets
export interface CongestionSegment {
  segmentId: string;
  name: string;
  congestionLevel: CongestionLevel;
  vehicleCount: number;
  averageSpeedKmph: number;
  jamFactor: number;
  isSimulated: boolean;
}

// 2. City & Hospital Contracts
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
  emergencyBeds: number;
  traumaLevel: number;
}

// 3. Ambulance Contracts
export type AmbulanceStatus = 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'ARRIVED' | 'PAUSED';

export interface AmbulanceData {
  id: string;
  isActive: boolean;
  currentLocation: { lat: number; lng: number };
  destination: { lat: number; lng: number } | null;
  greenCorridorEnabled: boolean;
  speedKmph?: number;
}

export interface Ambulance {
  ambulanceId: string;
  cityId: string;
  status: AmbulanceStatus;
  currentLocation: RoadCoordinate;
  destination: RoadCoordinate | null;
  greenCorridorActive: boolean;
  speedKmph: number;
  isSimulated: boolean;
}

// 4. Routing Contracts
export interface RouteOptimizationData {
  distanceKm: number;
  estimatedMinutes: number;
  standardMinutesWithoutCorridor: number;
  timeSavedMinutes: number;
  pathCoordinates: [number, number][];
}

// 5. Signals & Corridor
export interface TrafficSignal {
  signalId: string;
  name: string;
  location: { lat: number; lng: number };
  state: 'RED' | 'YELLOW' | 'GREEN';
  isGreenCorridorOverridden: boolean;
  cycleDurationSeconds?: number;
  lastStateChange?: string;
}
