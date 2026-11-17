import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';

interface UserLocationMarkerProps {
  location: { lat: number; lng: number };
  accuracy?: number | null;
}

export function UserLocationMarker({ location, accuracy }: UserLocationMarkerProps) {
  if (!location) return null;

  const iconHtml = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: #3b82f6; opacity: 0.35; animation: pulse 1.5s infinite;"></div>
      <div style="width: 22px; height: 22px; border-radius: 50%; background: #2563eb; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-user-location-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });

  return (
    <Marker position={[location.lat, location.lng]} icon={customIcon}>
      <Popup>
        <div style={{ color: '#0f172a', fontSize: '12px', minWidth: '160px' }}>
          <strong style={{ fontSize: '13px', color: '#1d4ed8' }}>📍 Your Live Physical Location</strong>
          <div style={{ marginTop: '4px', color: '#475569' }}>
            <div>Lat: <strong>{location.lat.toFixed(5)}</strong></div>
            <div>Lng: <strong>{location.lng.toFixed(5)}</strong></div>
            {accuracy && (
              <div style={{ marginTop: '2px', fontSize: '11px', color: '#64748b' }}>
                Accuracy: &plusmn;{Math.round(accuracy)} meters
              </div>
            )}
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#059669', fontWeight: 600 }}>
            Active GPS / Geolocation Lock
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
