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
    <div className="map-viewport">
      <MapContainer
        center={[cityCenter.lat, cityCenter.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#080c16' }}
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

        {/* Priority Emergency Green Corridor Polyline (Neon Green glow) */}
        {routeCoordinates.length >= 2 && (
          <Polyline
            positions={routeCoordinates}
            pathOptions={{
              color: isGreenCorridorActive ? '#10b981' : '#3b82f6',
              weight: isGreenCorridorActive ? 6 : 5,
              opacity: 0.95
            }}
          />
        )}

        {/* Live Traffic Signals with Real/Simulated Preemption States */}
        {signals.map(signal => (
          <TrafficSignalMarker
            key={signal.signalId}
            signal={signal}
          />
        ))}

        {/* Discovered Hospitals & Medical Centers */}
        {hospitals.map(hospital => (
          <HospitalMarker
            key={hospital.id}
            hospital={hospital}
            isSelected={selectedHospital?.id === hospital.id}
          />
        ))}

        {/* Live Ambulance Beacon */}
        {ambulance && <AmbulanceMarker ambulance={ambulance} />}
      </MapContainer>

      {/* Compact Tactical Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        zIndex: 1000,
        backgroundColor: 'rgba(8, 12, 22, 0.9)',
        border: '1px solid #1e2b48',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '0.68rem',
        color: '#94a3b8',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none'
      }}>
        <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '2px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
          Tactical Map Legend
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#10b981', display: 'inline-block', borderRadius: '1px' }} />
          <span>Priority Green Corridor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '12px', height: '3px', backgroundColor: '#f59e0b', display: 'inline-block', borderRadius: '1px' }} />
          <span>Alternative Direct Route</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
          <span>Preempted Intersection</span>
        </div>
      </div>
    </div>
  );
}
