import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { Hospital } from '../../types';

interface HospitalMarkerProps {
  hospital: Hospital;
  isSelected?: boolean;
}

export function HospitalMarker({ hospital, isSelected }: HospitalMarkerProps) {
  const isLevel1 = hospital.traumaLevel === 1;
  const badgeColor = isLevel1 ? '#dc2626' : '#0284c7';

  const iconHtml = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
      ${isSelected ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${badgeColor}; opacity: 0.45; animation: pulse 1.2s infinite;"></div>` : ''}
      <div style="width: 26px; height: 26px; border-radius: 50%; background: ${badgeColor}; border: 2px solid ${isSelected ? '#38bdf8' : '#ffffff'}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
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
        <div style={{ color: '#0f172a', fontSize: '12px', minWidth: '220px', lineHeight: 1.4 }}>
          <strong style={{ fontSize: '13px', color: badgeColor, display: 'block', marginBottom: '4px' }}>
            🏥 {hospital.name}
          </strong>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span>Trauma Level:</span>
            <strong style={{ color: isLevel1 ? '#b91c1c' : '#0369a1' }}>
              Level {hospital.traumaLevel} {isLevel1 ? '(Apex Center)' : '(Secondary)'}
            </strong>
          </div>

          {hospital.area && (
            <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '3px' }}>
              Sector: {hospital.area}
            </div>
          )}

          {hospital.hasEmergencyDepartment && (
            <div style={{ color: '#16a34a', fontWeight: 600, fontSize: '11px', marginBottom: '3px' }}>
              ✓ Verified 24/7 Emergency Care
            </div>
          )}

          {hospital.phone && (
            <div style={{ color: '#334155', fontSize: '11px', marginBottom: '3px' }}>
              📞 {hospital.phone}
            </div>
          )}

          {hospital.routeDistanceKm && (
            <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
              Road Distance: {hospital.routeDistanceKm} km (~{hospital.estimatedTransitMinutes || Math.round(hospital.routeDistanceKm * 2.2)} mins)
            </div>
          )}

          <div style={{ marginTop: '4px', fontSize: '10px', color: '#94a3b8' }}>
            Source: {hospital.source || 'OpenStreetMap Verified'}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
