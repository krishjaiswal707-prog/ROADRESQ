import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { AmbulanceData } from '../../types';

interface AmbulanceMarkerProps {
  ambulance: AmbulanceData;
}

export function AmbulanceMarker({ ambulance }: AmbulanceMarkerProps) {
  if (!ambulance || !ambulance.currentLocation) return null;

  const lat = ambulance.currentLocation.lat;
  const lng = ambulance.currentLocation.lng;

  const iconHtml = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${ambulance.greenCorridorEnabled ? '#22c55e' : '#38bdf8'}; opacity: 0.35; animation: pulse 1.5s infinite;"></div>
      <div style="width: 28px; height: 28px; border-radius: 50%; background: ${ambulance.greenCorridorEnabled ? '#15803d' : '#0284c7'}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
        🚑
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-ambulance-div-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });

  return (
    <Marker position={[lat, lng]} icon={customIcon}>
      <Popup>
        <div style={{ color: '#0f172a', fontSize: '12px', minWidth: '160px' }}>
          <strong style={{ fontSize: '13px', color: '#0369a1' }}>🚑 {ambulance.id}</strong>
          <div style={{ marginTop: '4px' }}>
            <span>Status: </span>
            <strong style={{ color: ambulance.greenCorridorEnabled ? '#15803d' : '#0284c7' }}>
              {ambulance.greenCorridorEnabled ? 'PRIORITY GREEN CORRIDOR' : ambulance.isActive ? 'EN ROUTE' : 'AVAILABLE'}
            </strong>
          </div>
          {ambulance.speedKmph !== undefined && (
            <div>Speed: <strong>{ambulance.speedKmph} km/h</strong></div>
          )}
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
            Telemetry: <span style={{ color: '#0284c7', fontWeight: 600 }}>Simulated GPS Feed</span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
