import type { TrafficSignal, CongestionSegment } from '../../types';

interface SignalMonitorProps {
  signals: TrafficSignal[];
  segments: CongestionSegment[];
}

export function SignalMonitor({ signals, segments }: SignalMonitorProps) {
  return (
    <aside style={{ backgroundColor: '#0f172a', borderLeft: '1px solid #1e293b', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '12px' }}>
          🚦 Traffic Signals & Preemption
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {signals.map(s => (
            <div key={s.signalId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                  {s.isGreenCorridorOverridden ? '⚡ Overridden (Green Corridor)' : 'Normal Automation Cycle'}
                </div>
              </div>
              <span style={{ 
                padding: '3px 8px', 
                borderRadius: '4px', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                backgroundColor: s.state === 'GREEN' ? '#14532d' : s.state === 'YELLOW' ? '#78350f' : '#7f1d1d',
                color: s.state === 'GREEN' ? '#86efac' : s.state === 'YELLOW' ? '#fde68a' : '#fca5a5'
              }}>
                {s.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '1px', marginBottom: '12px' }}>
          📊 Live Segment Congestion
        </h2>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {segments.slice(0, 5).map(seg => (
            <div key={seg.segmentId} style={{ padding: '8px 12px', backgroundColor: '#1e293b', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{seg.name}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700,
                  color: seg.congestionLevel === 'Low' ? '#4ade80' : seg.congestionLevel === 'Medium' ? '#f59e0b' : '#ef4444'
                }}>
                  {seg.congestionLevel}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                <span>Flow Speed: {seg.averageSpeedKmph} km/h</span>
                <span>Density: {seg.vehicleCount} veh</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
