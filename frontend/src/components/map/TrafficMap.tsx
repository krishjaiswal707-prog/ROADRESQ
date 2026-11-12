import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { TrafficSignal, AmbulanceData, Hospital } from '../../types';
import { AmbulanceMarker } from './AmbulanceMarker';
import { HospitalMarker } from './HospitalMarker';
import { TrafficSignalMarker } from './TrafficSignalMarker';
import { MapController } from './MapController';

interface TrafficMapProps {
  cityId: string;
  cityCenter: { lat: number; lng: number };
  zoom?: number;
  signals: TrafficSignal[];
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  ambulance: AmbulanceData | null;
  isGreenCorridorActive: boolean;
  routeCoordinates?: [number, number][];
  alternativeRoutes?: Array<{ pathCoordinates: [number, number][] }>;
}

export function TrafficMap({
  cityCenter,
  zoom = 13,
  signals,
  hospitals,
  selectedHospital,
  ambulance,
  isGreenCorridorActive,
  routeCoordinates = [],
  alternativeRoutes = []
}: TrafficMapProps) {
  return (
    <div style={{ flex: 1, position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={[cityCenter.lat, cityCenter.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#090d16' }}
        scrollWheelZoom={true}
      >
        <MapController center={cityCenter} zoom={zoom} routeCoordinates={routeCoordinates} />

        {/* Free-First OpenStreetMap Tiles with Attribution */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Alternative Routes (Orange dashed lines) */}
        {alternativeRoutes.map((alt, index) => (
          alt.pathCoordinates && alt.pathCoordinates.length >= 2 ? (
            <Polyline
              key={`alt-route-${index}`}
              positions={alt.pathCoordinates}
              pathOptions={{
                color: '#f59e0b',
                weight: 4,
                opacity: 0.75,
                dashArray: '6, 6'
              }}
            />
          ) : null
        ))}

        {/* Recommended Emergency Corridor (Vibrant Green Line) */}
        {routeCoordinates && routeCoordinates.length >= 2 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: isGreenCorridorActive ? '#22c55e' : '#38bdf8',
              weight: isGreenCorridorActive ? 6 : 5,
              opacity: 0.95
            }}
          />
        )}

        {/* Traffic Signals */}
        {signals.map((sig) => (
          <TrafficSignalMarker key={sig.signalId} signal={sig} />
        ))}

        {/* Hospitals */}
        {hospitals.map((hosp) => (
          <HospitalMarker
            key={hosp.id}
            hospital={hosp}
            isSelected={selectedHospital?.id === hosp.id}
          />
        ))}

        {/* Active Emergency Ambulance */}
        {ambulance && (
          <AmbulanceMarker ambulance={ambulance} />
        )}
      </MapContainer>

      {/* Map Attribution & Engine Badge */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        padding: '6px 12px',
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(4px)',
        border: '1px solid #334155',
        borderRadius: '6px',
        fontSize: '0.72rem',
        color: '#94a3b8',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>Engine: <strong style={{ color: '#4ade80' }}>React-Leaflet + OpenStreetMap</strong></span>
        <span>•</span>
        <span>Routing: <strong style={{ color: '#38bdf8' }}>OSRM Road-Snapped</strong></span>
      </div>
    </div>
  );
}
