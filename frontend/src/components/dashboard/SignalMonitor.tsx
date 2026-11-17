import type { TrafficSignal, CongestionSegment } from '../../types';
import { Activity, Radio } from 'lucide-react';

interface SignalMonitorProps {
  signals: TrafficSignal[];
  segments: CongestionSegment[];
}

export function SignalMonitor({ signals, segments }: SignalMonitorProps) {
  return (
    <aside style={{
      backgroundColor: '#0f1626',
      borderLeft: '1px solid #1e2b48',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      overflowY: 'auto',
      minWidth: 0,
      width: '100%'
    }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Radio size={16} color="#60a5fa" />
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#f8fafc', letterSpacing: '0.5px' }}>
            Traffic Signals & Preemption
          </h2>
        </div>
        <p style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
          Intersections synced to OSRM corridor grid
        </p>
      </div>

      {/* Signal Status Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {signals.map(s => {
          const isGreen = s.state === 'GREEN';
          const isYellow = s.state === 'YELLOW';
          const isOverridden = s.isGreenCorridorOverridden;

          return (
            <div
              key={s.signalId}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                backgroundColor: isOverridden ? 'rgba(16, 185, 129, 0.08)' : '#151e34',
                border: isOverridden ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #25355a',
                borderRadius: '6px',
                minWidth: 0
              }}
            >
              <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.name}
                </div>
                <div style={{ fontSize: '0.68rem', color: isOverridden ? '#34d399' : '#94a3b8', marginTop: '2px', fontWeight: isOverridden ? 600 : 400 }}>
                  {isOverridden ? '⚡ Green Corridor Override' : 'Automated Signal Cycle'}
                </div>
              </div>

              {/* Status Indicator Badge */}
              <span style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                backgroundColor: isGreen ? 'rgba(16, 185, 129, 0.18)' : isYellow ? 'rgba(245, 158, 11, 0.18)' : 'rgba(239, 68, 68, 0.18)',
                color: isGreen ? '#34d399' : isYellow ? '#fbbf24' : '#f87171',
                border: `1px solid ${isGreen ? 'rgba(16, 185, 129, 0.4)' : isYellow ? 'rgba(245, 158, 11, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                letterSpacing: '0.5px'
              }}>
                {s.state}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live Segment Congestion Telemetry */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="#34d399" />
          <h2 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#f8fafc', letterSpacing: '0.5px' }}>
            Live Segment Flow
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {segments.slice(0, 5).map(seg => {
            const isLow = seg.congestionLevel === 'Low';
            const isMed = seg.congestionLevel === 'Medium';

            return (
              <div
                key={seg.segmentId}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#151e34',
                  border: '1px solid #25355a',
                  borderRadius: '6px',
                  minWidth: 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {seg.name}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: isLow ? '#34d399' : isMed ? '#fbbf24' : '#f87171'
                  }}>
                    {seg.congestionLevel} Congestion
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  <span>Speed: <b style={{ color: '#ffffff' }}>{seg.averageSpeedKmph} km/h</b></span>
                  <span>Density: <b style={{ color: '#ffffff' }}>{seg.vehicleCount} veh</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
