import { useState, useEffect } from 'react';
import { RefreshCw, Clock } from 'lucide-react';

export interface TrafficObservation {
  routeId: string;
  routeName: string;
  congestionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  normalDurationSeconds: number;
  trafficDurationSeconds: number;
  delaySeconds: number;
  delayPercentage: number;
  isSimulated: boolean;
  source: string;
  observedAt: string;
}

interface TrafficStatusProps {
  cityId: string;
}

export function TrafficStatus({ cityId }: TrafficStatusProps) {
  const [observations, setObservations] = useState<TrafficObservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchTraffic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/traffic/live?cityId=${cityId}`);
      const data = await res.json();
      if (data.observations) {
        setObservations(data.observations);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTraffic();
  }, [cityId]);

  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'LOW':
        return { bg: '#14532d', color: '#86efac', border: '#166534' };
      case 'MODERATE':
        return { bg: '#78350f', color: '#fde68a', border: '#854d0e' };
      case 'HIGH':
        return { bg: '#7c2d12', color: '#fed7aa', border: '#9a3412' };
      case 'SEVERE':
        return { bg: '#7f1d1d', color: '#fca5a5', border: '#991b1b' };
      default:
        return { bg: '#1e293b', color: '#cbd5e1', border: '#334155' };
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🚦 Monitored Corridors ({cityId.toUpperCase()})
        </h3>
        <button
          onClick={fetchTraffic}
          disabled={loading}
          style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
        >
          <RefreshCw size={12} className={loading ? 'spin' : ''} /> {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {observations.map((obs) => {
          const badge = getBadgeStyle(obs.congestionLevel);
          return (
            <div key={obs.routeId} style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>{obs.routeName}</span>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                  {obs.congestionLevel} (+{obs.delayPercentage}%)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                <span>Free Flow: {Math.round(obs.normalDurationSeconds / 60)} min</span>
                <span>Current ETA: <strong style={{ color: '#f8fafc' }}>{Math.round(obs.trafficDurationSeconds / 60)} min</strong></span>
              </div>

              <div style={{ marginTop: '6px', fontSize: '0.65rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>Source: {obs.source} ({obs.isSimulated ? 'Simulated Model' : 'TomTom Live Flow'})</span>
                <span>+{Math.round(obs.delaySeconds / 60)} min delay</span>
              </div>
            </div>
          );
        })}
      </div>

      {lastUpdated && (
        <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={11} /> Last Synced: {lastUpdated}
        </div>
      )}
    </div>
  );
}
