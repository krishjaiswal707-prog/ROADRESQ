import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { TrafficSignal } from '../../types';

interface TrafficSignalMarkerProps {
  signal: TrafficSignal;
}

export function TrafficSignalMarker({ signal }: TrafficSignalMarkerProps) {
  const isGreen = signal.state === 'GREEN';
  const isYellow = signal.state === 'YELLOW';
  const color = isGreen ? '#22c55e' : isYellow ? '#f59e0b' : '#ef4444';

  const iconHtml = `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
      ${signal.isGreenCorridorOverridden ? '<div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #22c55e; opacity: 0.4; animation: pulse 1s infinite;"></div>' : ''}
      <div style="width: 20px; height: 20px; border-radius: 50%; background: #0f172a; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.5);">
        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
      </div>
    </div>
  `;

  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-signal-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });

  return (
    <Marker position={[signal.location.lat, signal.location.lng]} icon={customIcon}>
      <Popup>
        <div style={{ color: '#0f172a', fontSize: '12px', minWidth: '170px' }}>
          <strong style={{ fontSize: '13px' }}>🚦 {signal.name}</strong>
          <div style={{ marginTop: '4px' }}>
            <span>Signal State: </span>
            <strong style={{ color }}>{signal.state}</strong>
          </div>
          <div>
            <span>Corridor Override: </span>
            <strong style={{ color: signal.isGreenCorridorOverridden ? '#15803d' : '#64748b' }}>
              {signal.isGreenCorridorOverridden ? '⚡ ACTIVE (GREEN CORRIDOR)' : 'Standard Automated Cycle'}
            </strong>
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
            Signal ID: {signal.signalId}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
