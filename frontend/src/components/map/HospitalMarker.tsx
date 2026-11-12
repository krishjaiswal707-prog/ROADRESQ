import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { Hospital } from '../../types';

interface HospitalMarkerProps {
  hospital: Hospital;
  isSelected?: boolean;
}

export function HospitalMarker({ hospital, isSelected }: HospitalMarkerProps) {
  const iconHtml = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
      ${isSelected ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: #ef4444; opacity: 0.35; animation: pulse 1.5s infinite;"></div>' : ''}
      <div style="width: 26px; height: 26px; border-radius: 50%; background: #dc2626; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
        H
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-hospital-div-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });

  return (
    <Marker position={[hospital.lat, hospital.lng]} icon={customIcon}>
      <Popup>
        <div style={{ color: '#0f172a', fontSize: '12px', minWidth: '180px' }}>
          <strong style={{ fontSize: '13px', color: '#b91c1c' }}>🏥 {hospital.name}</strong>
          <div style={{ marginTop: '4px' }}>
            <span>Trauma Level: </span>
            <strong style={{ color: '#0369a1' }}>Level {hospital.traumaLevel}</strong>
          </div>
          <div>
            <span>Emergency Beds: </span>
            <strong style={{ color: '#15803d' }}>{hospital.emergencyBeds} Available</strong>
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
            Location: {hospital.lat.toFixed(4)}, {hospital.lng.toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
