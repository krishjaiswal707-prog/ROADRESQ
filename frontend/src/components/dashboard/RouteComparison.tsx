import { Navigation } from 'lucide-react';

export interface RouteAlternative {
  routeId: string;
  name: string;
  distanceKm: number;
  trafficDurationMinutes: number;
  normalDurationMinutes?: number;
  timeSavedMinutes?: number;
  congestionLevel: string;
  recommendationReason: string;
}

interface RouteComparisonProps {
  recommended: RouteAlternative | null;
  alternatives: RouteAlternative[];
  onSelectRoute?: (route: RouteAlternative) => void;
}

export function RouteComparison({ recommended, alternatives }: RouteComparisonProps) {
  if (!recommended) return null;

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155', marginTop: '14px' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
        <Navigation size={15} /> Emergency Route Evaluation
      </h3>

      {/* Recommended Priority Corridor (Green) */}
      <div style={{ backgroundColor: '#052e16', padding: '12px', borderRadius: '6px', border: '1px solid #16a34a', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <strong style={{ color: '#86efac', fontSize: '0.85rem' }}>★ RECOMMENDED CORRIDOR</strong>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80' }}>
            {recommended.trafficDurationMinutes} min ETA
          </span>
        </div>
        <p style={{ margin: '0 0 6px 0', fontSize: '0.75rem', color: '#bbf7d0' }}>
          {recommended.name} ({recommended.distanceKm} km)
        </p>
        <p style={{ margin: 0, fontSize: '0.7rem', color: '#86efac', fontStyle: 'italic' }}>
          💡 {recommended.recommendationReason}
        </p>
      </div>

      {/* Alternative Routes (Orange / Neutral) */}
      {alternatives.map(alt => (
        <div key={alt.routeId} style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #334155', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}>{alt.name}</span>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>
              {alt.trafficDurationMinutes} min ETA
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
            <span>Distance: {alt.distanceKm} km</span>
            <span>Congestion: <strong style={{ color: '#ef4444' }}>{alt.congestionLevel}</strong></span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.7rem', color: '#94a3b8' }}>
            {alt.recommendationReason}
          </p>
        </div>
      ))}
    </div>
  );
}
