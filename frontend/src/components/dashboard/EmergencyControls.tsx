import type { Hospital, RouteOptimizationData } from '../../types';
import { Ambulance, Zap, RotateCcw, Navigation } from 'lucide-react';
import { TrafficStatus } from '../traffic/TrafficStatus';
import { RouteComparison } from './RouteComparison';

interface EmergencyControlsProps {
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
  hospitals,
  selectedHospital,
  onSelectHospital,
  dispatchStatus,
  onDispatch,
  onCancel,
  routeInfo,
  trendPrediction,
  alternativeRoutes = []
}: EmergencyControlsProps) {
  return (
    <aside style={{ backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '12px' }}>
          🚑 Emergency Dispatch Control
        </h2>

        <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px', marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Target Destination Hospital:</label>
          <select
            value={selectedHospital?.id || ''}
            onChange={e => {
              const found = hospitals.find(h => h.id === e.target.value);
              if (found) onSelectHospital(found);
            }}
            style={{ width: '100%', padding: '8px 10px', backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: '6px' }}
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} (Trauma Level {h.traumaLevel})
              </option>
            ))}
          </select>

          {selectedHospital && (
            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
              <span>ICU/Trauma Beds: <strong style={{ color: '#4ade80' }}>{selectedHospital.emergencyBeds}</strong></span>
              <span>Trauma Level: <strong style={{ color: '#38bdf8' }}>Level {selectedHospital.traumaLevel}</strong></span>
            </div>
          )}
        </div>

        {dispatchStatus === 'GREEN_CORRIDOR_ACTIVE' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: '#14532d', border: '1px solid #22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={22} color="#4ade80" />
              <div>
                <strong style={{ color: '#86efac', fontSize: '0.85rem' }}>GREEN CORRIDOR ACTIVE</strong>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#dcfce7' }}>Traffic signals automatically preempted to GREEN.</p>
              </div>
            </div>

            <button
              onClick={onCancel}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
            >
              <RotateCcw size={16} /> Cancel & Release Corridor
            </button>
          </div>
        ) : (
          <button
            onClick={onDispatch}
            disabled={!selectedHospital || dispatchStatus === 'DISPATCHING'}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}
          >
            <Ambulance size={18} />
            {dispatchStatus === 'DISPATCHING' ? 'Dispatching...' : 'Dispatch Ambulance (Green Corridor)'}
          </button>
        )}
      </div>

      {routeInfo && (
        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Navigation size={16} /> Priority Optimization Stats
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Standard ETA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ef4444' }}>{routeInfo.standardMinutesWithoutCorridor} min</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Priority ETA</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>{routeInfo.estimatedMinutes} min</div>
            </div>
          </div>
          <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#052e16', borderRadius: '6px', textAlign: 'center', color: '#86efac', fontSize: '0.8rem', fontWeight: 600 }}>
            ⚡ Time Saved: {routeInfo.timeSavedMinutes} Minutes
          </div>
        </div>
      )}

      <TrafficStatus cityId={hospitals[0]?.name ? (hospitals[0].id.includes('BLR') ? 'bengaluru' : hospitals[0].id.includes('CBE') ? 'coimbatore' : 'chennai') : 'chennai'} />

      {routeInfo && (
        <RouteComparison
          recommended={{
            routeId: 'REC',
            name: 'Priority Emergency Corridor',
            distanceKm: routeInfo.distanceKm,
            trafficDurationMinutes: routeInfo.estimatedMinutes,
            normalDurationMinutes: routeInfo.standardMinutesWithoutCorridor,
            timeSavedMinutes: routeInfo.timeSavedMinutes,
            congestionLevel: 'LOW',
            recommendationReason: `Green Corridor preempts upcoming signals. Saves ~${routeInfo.timeSavedMinutes} min.`
          }}
          alternatives={alternativeRoutes}
        />
      )}

      <div style={{ backgroundColor: '#1e293b', padding: '14px', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>
          📈 15-Minute Congestion Trend
        </h3>
        {trendPrediction ? (
          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Forecast Trend:</span>
              <strong style={{ color: trendPrediction.trend === 'IMPROVING' ? '#4ade80' : '#f59e0b' }}>
                {trendPrediction.trend}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Projected Status:</span>
              <strong>{trendPrediction.predictedCongestion}</strong>
            </div>
          </div>
        ) : (
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Analyzing live flow patterns...</span>
        )}
      </div>
    </aside>
  );
}
