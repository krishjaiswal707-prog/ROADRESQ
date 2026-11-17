import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Loader2 } from 'lucide-react';
import type { TrafficSignal, AmbulanceData, Hospital } from '../../types';
import { AmbulanceMarker } from './AmbulanceMarker';
import { HospitalMarker } from './HospitalMarker';
import { TrafficSignalMarker } from './TrafficSignalMarker';
import { UserLocationMarker } from './UserLocationMarker';
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
  userLocation?: { lat: number; lng: number } | null;
  userAccuracy?: number | null;
  isLocating?: boolean;
  onLocateUser?: () => void;
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
  alternativeRoutes = [],
  userLocation = null,
  userAccuracy = null,
  isLocating = false,
  onLocateUser
}: TrafficMapProps) {
  return (
    <div className="map-viewport">
      <MapContainer
        center={[cityCenter.lat, cityCenter.lng]}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#080c16' }}
        scrollWheelZoom={true}
      >
        <MapController
          center={cityCenter}
          zoom={zoom}
          routeCoordinates={routeCoordinates}
          userLocation={userLocation}
        />

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

        {/* User's Live Physical Location Marker */}
        {userLocation && (
          <UserLocationMarker
            location={userLocation}
            accuracy={userAccuracy}
          />
        )}
      </MapContainer>

      {/* Floating 'Live Location / My GPS' Button */}
      {onLocateUser && (
        <button
          onClick={onLocateUser}
          disabled={isLocating}
          title="Detect My Live Physical Location"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: userLocation ? '#2563eb' : 'rgba(15, 22, 38, 0.92)',
            color: '#f8fafc',
            border: userLocation ? '1px solid #60a5fa' : '1px solid #1e2b48',
            borderRadius: '6px',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: isLocating ? 'wait' : 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease'
          }}
        >
          {isLocating ? (
            <Loader2 size={15} className="animate-spin" color="#38bdf8" />
          ) : (
            <Crosshair size={15} color={userLocation ? '#ffffff' : '#38bdf8'} />
          )}
          <span>{isLocating ? 'Locking GPS...' : userLocation ? 'GPS Locked' : 'Locate Me'}</span>
        </button>
      )}

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
        {userLocation && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'inline-block' }} />
            <span>My Live Location</span>
          </div>
        )}
      </div>
    </div>
  );
}
