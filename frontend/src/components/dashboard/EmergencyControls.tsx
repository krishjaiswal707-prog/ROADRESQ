import type { Hospital, RouteOptimizationData } from '../../types';
import { Ambulance, Zap, RotateCcw } from 'lucide-react';
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
  alternativeRoutes = []
}: EmergencyControlsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
      {/* Target Destination Selector */}
      <div style={{ backgroundColor: '#151e34', padding: '12px', borderRadius: '6px', border: '1px solid #25355a' }}>
        <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
          Destination Facility (OSM Verified):
        </label>
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
          <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
            <span>Emergency Beds: <strong style={{ color: '#34d399' }}>{selectedHospital.emergencyBeds} available</strong></span>
            <span>Trauma Level: <strong style={{ color: '#60a5fa' }}>Level {selectedHospital.traumaLevel}</strong></span>
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
