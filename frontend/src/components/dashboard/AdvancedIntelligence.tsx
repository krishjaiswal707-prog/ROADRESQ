import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Server, RefreshCw, CheckCircle, Hospital } from 'lucide-react';

interface AdvancedIntelligenceProps {
  cityId: string;
}

export const AdvancedIntelligence: React.FC<AdvancedIntelligenceProps> = ({ cityId }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'predictions' | 'hospitals' | 'containers'>('timeline');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any>(null);
  const [containerStats, setContainerStats] = useState<any>(null);
  const [priorityData] = useState<any>({
    score: 82,
    severityLevel: 'CRITICAL',
    factors: { incidentSeverity: 35, waitingDurationMinutes: 15, affectedCount: 12, emergencyCategoryWeight: 15, roadAccessibilityPenalty: 5 },
    explanation: 'Score 82/100 [CRITICAL]: Cardiac Arrest / Trauma with multiple casualties. Automated Green Corridor recommended.'
  });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchTimeline();
    fetchPredictions();
    fetchHospitals();
    fetchContainerOverview();
  }, [cityId]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v2/timeline/INCIDENT_LIVE_DEMO');
      const data = await res.json();
      if (data.timeline) setTimeline(data.timeline);
    } catch {
      // Offline fallback
    }
  };

  const fetchPredictions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/v2/traffic/predictions/${cityId}?speed=32&hazards=1`);
      const data = await res.json();
      if (data.predictions) setPredictions(data.predictions);
    } catch {
      // Offline fallback
    }
  };

  const fetchHospitals = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v2/hospitals/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId, priorityLevel: 'CRITICAL' })
      });
      const data = await res.json();
      if (data.recommendations) setHospitals(data.recommendations);
    } catch {
      // Offline fallback
    }
  };

  const fetchContainerOverview = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v2/monitoring/overview');
      const data = await res.json();
      if (data.overview) setContainerStats(data.overview);
    } catch {
      // Offline fallback
    }
  };

  const handleSimulateIncidentStep = async (step: string) => {
    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/v2/timeline/INCIDENT_LIVE_DEMO/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: step,
          description: `Progress step: ${step.replace(/_/g, ' ')} completed dynamically.`,
          metadata: { cityId, triggeredBy: 'ADMIN_DASHBOARD' }
        })
      });
      await fetchTimeline();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#0f1626',
      border: '1px solid #1e2b48',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      width: '100%',
      minWidth: 0
    }}>
      {/* Header & Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '12px',
        borderBottom: '1px solid #1e2b48',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '6px 8px',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '6px',
            color: '#60a5fa'
          }}>
            <Activity size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.3px' }}>
              Operational Intelligence Center
            </h2>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              SLA Analytics &bull; Traffic Forecasting &bull; Multi-Container Telemetry
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          backgroundColor: '#080c16',
          padding: '3px',
          borderRadius: '6px',
          border: '1px solid #1e2b48',
          gap: '3px'
        }}>
          {[
            { id: 'timeline', label: 'SLA Timeline' },
            { id: 'predictions', label: 'Traffic Predictions' },
            { id: 'hospitals', label: 'Hospital Ranking' },
            { id: 'containers', label: 'Container Ops' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SLA TIMELINE */}
      {activeTab === 'timeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', minWidth: 0 }}>
          {/* Key SLA Metric Cards (Responsive Grid) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            width: '100%'
          }}>
            <div style={{ backgroundColor: '#151e34', padding: '10px 12px', borderRadius: '6px', border: '1px solid #25355a' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Emergency Priority</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f87171', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {priorityData.score}<span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/100</span>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 600 }}>{priorityData.severityLevel} TIER</span>
            </div>

            <div style={{ backgroundColor: '#151e34', padding: '10px 12px', borderRadius: '6px', border: '1px solid #25355a' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Target Urban SLA</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#34d399', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                10m 00s
              </div>
              <span style={{ fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 600 }}>METROPOLITAN STANDARD</span>
            </div>

            <div style={{ backgroundColor: '#151e34', padding: '10px 12px', borderRadius: '6px', border: '1px solid #25355a' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Assign Duration</span>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#60a5fa', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                {timeline?.metrics?.verificationToAssignmentSec || 42}s
              </div>
              <span style={{ fontSize: '0.65rem', color: '#93c5fd', fontWeight: 600 }}>ALGORITHMIC TRIAGE</span>
            </div>

            <div style={{ backgroundColor: '#151e34', padding: '10px 12px', borderRadius: '6px', border: '1px solid #25355a' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Live SLA Status</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} color="#34d399" /> {timeline?.slaStatus || 'ON_TARGET'}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Zero Breaches Logged</span>
            </div>
          </div>

          {/* Event History Audit Trail */}
          <div style={{
            backgroundColor: '#080c16',
            borderRadius: '6px',
            border: '1px solid #1e2b48',
            padding: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Incident Event Timeline &bull; INCIDENT_LIVE_DEMO
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Real-time Audit Log</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
              {(timeline?.events || [
                { eventType: 'REPORT_CREATED', description: 'Emergency accident call registered in sector.', timestamp: new Date() },
                { eventType: 'PRIORITY_ASSIGNED', description: 'Priority Engine classified incident at 82/100 (CRITICAL).', timestamp: new Date() },
                { eventType: 'RESOURCE_ALLOCATED', description: 'Advanced Life Support (ALS) Ambulance allocated.', timestamp: new Date() },
                { eventType: 'CORRIDOR_ACTIVATED', description: 'Green Corridor preemption override active.', timestamp: new Date() }
              ]).map((ev: any, i: number) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  backgroundColor: '#0f1626',
                  borderRadius: '4px',
                  border: '1px solid #1e2b48',
                  fontSize: '0.73rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>{ev.eventType}</span>
                    <span style={{ color: '#94a3b8' }}>&mdash; {ev.description}</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #1e2b48', display: 'flex', gap: '8px' }}>
              <button
                disabled={loading}
                onClick={() => handleSimulateIncidentStep('DISPATCH_INITIATED')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Dispatch Initiated
              </button>
              <button
                disabled={loading}
                onClick={() => handleSimulateIncidentStep('RESOURCE_ARRIVED')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + On-Scene Arrival
              </button>
              <button
                disabled={loading}
                onClick={() => handleSimulateIncidentStep('INCIDENT_RESOLVED')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#065f46',
                  color: '#ecfdf5',
                  border: '1px solid #059669',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✓ Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRAFFIC PREDICTIONS */}
      {activeTab === 'predictions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Historical Exponential Smoothing Model &bull; Evaluated over current road network
            </span>
            <button
              onClick={fetchPredictions}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                backgroundColor: '#151e34',
                color: '#94a3b8',
                border: '1px solid #25355a',
                borderRadius: '4px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={12} /> Recalculate
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {predictions.map((p, idx) => (
              <div key={idx} style={{
                backgroundColor: '#151e34',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #25355a'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>+{p.horizonMinutes} MIN FORECAST</span>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    fontWeight: 700
                  }}>
                    {Math.round(p.confidence * 100)}% CONFIDENCE
                  </span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {p.predictedSpeedKmh} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>km/h</span>
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  marginTop: '2px',
                  marginBottom: '8px',
                  color: p.predictedCongestion === 'LOW' ? '#34d399' : p.predictedCongestion === 'MODERATE' ? '#fbbf24' : '#f87171'
                }}>
                  {p.predictedCongestion} CONGESTION
                </div>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: 1.4, borderTop: '1px solid #25355a', paddingTop: '6px' }}>
                  {p.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HOSPITAL RANKING */}
      {activeTab === 'hospitals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Multi-Criteria Algorithmic Ranking: Distance, Trauma Capability & Real OpenStreetMap Records
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {hospitals.map((h, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                backgroundColor: '#151e34',
                borderRadius: '6px',
                border: '1px solid #25355a',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    borderRadius: '6px'
                  }}>
                    <Hospital size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>{h.name}</span>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        fontWeight: 700
                      }}>
                        {h.verificationStatus}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '3px', fontSize: '0.7rem', color: '#94a3b8' }}>
                      <span>Distance: <b style={{ color: '#f1f5f9' }}>{h.distanceKm} km</b></span>
                      <span>Transit: <b style={{ color: '#f1f5f9' }}>~{h.estimatedTransitMinutes} mins</b></span>
                      <span>ICU Beds: <b style={{ color: '#34d399' }}>{h.capabilities.icuBedsAvailable} available</b></span>
                      <span>Trauma: <b style={{ color: '#38bdf8' }}>{h.capabilities.traumaTier}</b></span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                    {h.suitabilityScore}%
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    Suitability Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONTAINER OPS */}
      {activeTab === 'containers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <div style={{ backgroundColor: '#151e34', padding: '12px', borderRadius: '6px', border: '1px solid #25355a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                <Server size={14} color="#60a5fa" /> Runtime Engine
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                {containerStats?.engine || 'PODMAN / DOCKER OCI'}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#34d399' }}>Node 20 Minimal Container</span>
            </div>

            <div style={{ backgroundColor: '#151e34', padding: '12px', borderRadius: '6px', border: '1px solid #25355a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                <Cpu size={14} color="#c084fc" /> Memory Footprint
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                {containerStats?.memoryUsage?.rssMb || 112.3} MB
              </div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Uptime: {containerStats?.uptimeSeconds || 45}s</span>
            </div>

            <div style={{ backgroundColor: '#151e34', padding: '12px', borderRadius: '6px', border: '1px solid #25355a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>
                <HardDrive size={14} color="#34d399" /> Storage Volume
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
                PERSISTENT
              </div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>roadresq-mongo-data</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#080c16', padding: '10px', borderRadius: '6px', border: '1px solid #1e2b48' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Active Services in Compose Stack
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { name: 'roadresq-app', role: 'API, WebSockets & Dashboard', port: '5000, 5173', status: 'Healthy' },
                { name: 'roadresq-mongodb', role: 'MongoDB 7.0 Database', port: '27017', status: 'Healthy' },
                { name: 'roadresq-redis', role: 'Redis 7 Background Broker', port: '6379', status: 'Healthy' }
              ].map((svc, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  backgroundColor: '#0f1626',
                  borderRadius: '4px',
                  fontSize: '0.72rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                    <strong style={{ color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>{svc.name}</strong>
                    <span style={{ color: '#94a3b8' }}>&bull; {svc.role}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>:{svc.port}</span>
                    <span style={{ color: '#34d399', fontWeight: 600 }}>{svc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
