import type { Hospital, RouteOptimizationData } from '../../types';
import { Ambulance, Zap, RotateCcw, Hospital as HospitalIcon, MapPin, Crosshair, Loader2 } from 'lucide-react';
import { TrafficStatus } from '../traffic/TrafficStatus';
import { RouteComparison } from './RouteComparison';

interface EmergencyControlsProps {
  cityId: string;
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (h: Hospital) => void;
  dispatchStatus: string;
  onDispatch: () => void;
  onCancel: () => void;
  routeInfo: RouteOptimizationData | null;
  trendPrediction: any;
  alternativeRoutes?: any[];
  onOpenHospitalDirectory?: () => void;
  userLocation?: { lat: number; lng: number } | null;
  isLocating?: boolean;
  onLocateUser?: () => void;
  useLiveLocationForOrigin?: boolean;
  onToggleUseLiveLocation?: (enabled: boolean) => void;
}

export function EmergencyControls({
  cityId,
  hospitals,
  selectedHospital,
  onSelectHospital,
  dispatchStatus,
  onDispatch,
  onCancel,
  routeInfo,
  alternativeRoutes = [],
  onOpenHospitalDirectory,
  userLocation,
  isLocating = false,
  onLocateUser,
  useLiveLocationForOrigin = false,
  onToggleUseLiveLocation
}: EmergencyControlsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
      {/* Origin / Live Location Selector */}
      <div style={{ backgroundColor: '#151e34', padding: '12px', borderRadius: '6px', border: '1px solid #25355a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} color="#38bdf8" /> Incident Origin Point:
          </label>
          {onLocateUser && (
            <button
              onClick={onLocateUser}
              disabled={isLocating}
              style={{
                background: userLocation ? 'rgba(37, 99, 235, 0.2)' : 'none',
                border: userLocation ? '1px solid #3b82f6' : 'none',
                borderRadius: '4px',
                color: userLocation ? '#60a5fa' : '#38bdf8',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: isLocating ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px'
              }}
            >
              {isLocating ? <Loader2 size={11} className="animate-spin" /> : <Crosshair size={11} />}
              {isLocating ? 'Locking...' : userLocation ? 'GPS Acquired' : 'Use My GPS'}
            </button>
          )}
        </div>

        {userLocation ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '4px',
            fontSize: '0.74rem'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#93c5fd' }}>📍 My Real-Time Physical Location</div>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
              </div>
            </div>
            {onToggleUseLiveLocation && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#cbd5e1', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useLiveLocationForOrigin}
                  onChange={e => onToggleUseLiveLocation(e.target.checked)}
                  style={{ accentColor: '#2563eb', cursor: 'pointer' }}
                />
                Route From Me
              </label>
            )}
          </div>
        ) : (
          <div style={{
            padding: '8px 10px',
            backgroundColor: '#080c16',
            border: '1px solid #1e2b48',
            borderRadius: '4px',
            fontSize: '0.72rem',
            color: '#94a3b8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Simulated Sector Incident Site</span>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Default Origin</span>
          </div>
        )}
      </div>

      {/* Target Destination Selector with Recommendation Shortcut */}
      <div style={{ backgroundColor: '#151e34', padding: '12px', borderRadius: '6px', border: '1px solid #25355a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
            Destination Facility (OSM Verified):
          </label>
          {onOpenHospitalDirectory && (
            <button
              onClick={onOpenHospitalDirectory}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                fontSize: '0.68rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                padding: 0
              }}
            >
              <HospitalIcon size={11} /> Browse Directory
            </button>
          )}
        </div>

        <select
          value={selectedHospital?.id || ''}
          onChange={e => {
            const found = hospitals.find(h => h.id === e.target.value);
            if (found) onSelectHospital(found);
          }}
          style={{
            width: '100%',
            padding: '7px 10px',
            backgroundColor: '#080c16',
            color: '#f8fafc',
            border: '1px solid #1e2b48',
            borderRadius: '4px',
            fontSize: '0.78rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {hospitals.map(h => (
            <option key={h.id} value={h.id}>
              {h.name} (Trauma L{h.traumaLevel})
            </option>
          ))}
        </select>

        {selectedHospital && (
          <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
            <span>Sector: <strong style={{ color: '#f1f5f9' }}>{selectedHospital.area || selectedHospital.city || 'Urban Core'}</strong></span>
            <span>Trauma Level: <strong style={{ color: selectedHospital.traumaLevel === 1 ? '#ef4444' : '#60a5fa' }}>
              Level {selectedHospital.traumaLevel} {selectedHospital.traumaLevel === 1 ? '(Apex)' : ''}
            </strong></span>
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      {dispatchStatus === 'GREEN_CORRIDOR_ACTIVE' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{
            padding: '10px 12px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Zap size={20} color="#34d399" />
            <div>
              <strong style={{ color: '#34d399', fontSize: '0.8rem', display: 'block' }}>GREEN CORRIDOR ACTIVE</strong>
              <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8' }}>Signal override & automated preemption engaged.</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '9px',
              backgroundColor: '#b91c1c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <RotateCcw size={14} /> Release Emergency Corridor
          </button>
        </div>
      ) : (
        <button
          onClick={onDispatch}
          disabled={dispatchStatus === 'DISPATCHING'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: dispatchStatus === 'DISPATCHING' ? 'not-allowed' : 'pointer',
            opacity: dispatchStatus === 'DISPATCHING' ? 0.7 : 1,
            transition: 'background 0.15s ease'
          }}
        >
          <Ambulance size={16} />
          {dispatchStatus === 'DISPATCHING' ? 'Computing OSRM Trajectory...' : 'Dispatch Emergency Corridor'}
        </button>
      )}

      {/* Real-time Traffic Status */}
      <TrafficStatus cityId={cityId} />

      {/* Multi-Route Dijkstra vs OSRM Comparison */}
      {routeInfo && (
        <RouteComparison
          recommended={{
            routeId: 'ROUTE_RECOMMENDED_PRIORITY',
            name: 'Priority Emergency Corridor (OSRM Snapped)',
            distanceKm: routeInfo.distanceKm,
            trafficDurationMinutes: routeInfo.estimatedMinutes,
            normalDurationMinutes: routeInfo.standardMinutesWithoutCorridor,
            timeSavedMinutes: routeInfo.timeSavedMinutes,
            congestionLevel: 'LOW',
            recommendationReason: `OSRM road-snapped corridor with automated signal preemption. Saves ~${routeInfo.timeSavedMinutes} min.`
          }}
          alternatives={alternativeRoutes as any}
        />
      )}
    </div>
  );
}
