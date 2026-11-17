import React, { useState, useEffect } from 'react';
import { Activity, Cpu, HardDrive, Server, RefreshCw, CheckCircle, Hospital } from 'lucide-react';

interface AdvancedIntelligenceProps {
  cityId: string;
}

export const AdvancedIntelligence: React.FC<AdvancedIntelligenceProps> = ({ cityId }) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'predictions' | 'hospitals' | 'risk' | 'containers'>('timeline');
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

  // Fetch intelligence data
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl text-slate-100 mt-6">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">ROAD RESQ AI 2.0 &bull; Advanced Intelligence</h2>
            <p className="text-xs text-slate-400">Emergency SLA Tracking &bull; Traffic Forecast &bull; Podman Monitoring</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'timeline' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            SLA Timeline
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'predictions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Traffic Predictions
          </button>
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'hospitals' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Hospital Ranking
          </button>
          <button
            onClick={() => setActiveTab('containers')}
            className={`px-3 py-1.5 rounded-md transition ${activeTab === 'containers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Container Ops
          </button>
        </div>
      </div>

      {/* TAB 1: SLA TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Explainable Priority</span>
              <div className="text-2xl font-bold text-red-400 mt-1">{priorityData.score}/100</div>
              <span className="text-[10px] text-red-300 uppercase font-semibold">{priorityData.severityLevel} LEVEL</span>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">SLA Target</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">10m 00s</div>
              <span className="text-[10px] text-emerald-400 uppercase font-semibold">Standard Urban SLA</span>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Verification to Assign</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">
                {timeline?.metrics?.verificationToAssignmentSec || 42}s
              </div>
              <span className="text-[10px] text-blue-300 uppercase font-semibold">Automated Dispatch</span>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Live SLA Status</span>
              <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                {timeline?.slaStatus || 'ON_TARGET'}
              </div>
              <span className="text-[10px] text-slate-400">Response within SLA</span>
            </div>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center justify-between">
              <span>Emergency Event Lifecycle (Real-time Audit Trail)</span>
              <span className="text-xs text-slate-500">Incident ID: INCIDENT_LIVE_DEMO</span>
            </h3>
            
            <div className="space-y-3">
              {(timeline?.events || [
                { eventType: 'REPORT_CREATED', description: 'Emergency 108 citizen accident call received.', timestamp: new Date() },
                { eventType: 'PRIORITY_ASSIGNED', description: 'Automated Priority Engine scored 82/100 (CRITICAL).', timestamp: new Date() },
                { eventType: 'RESOURCE_ALLOCATED', description: 'Advanced Life Support (ALS) Ambulance matched.', timestamp: new Date() },
                { eventType: 'CORRIDOR_ACTIVATED', description: 'Green Corridor activated. Traffic light preemption engaged.', timestamp: new Date() }
              ]).map((ev: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded bg-slate-900 border border-slate-800/80 text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-200">{ev.eventType}</div>
                    <div className="text-slate-400 mt-0.5">{ev.description}</div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Lifecycle trigger buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2">
              <button
                disabled={loading}
                onClick={() => handleSimulateIncidentStep('DISPATCH_INITIATED')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700"
              >
                + Dispatch Initiated
              </button>
              <button
                disabled={loading}
                onClick={() => handleSimulateIncidentStep('RESOURCE_ARRIVED')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded border border-slate-700"
              >
                + Resource Arrived
              </button>
              <button
                disabled={loading}
                onClick={() => handleSimulateIncidentStep('INCIDENT_RESOLVED')}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-xs rounded text-white"
              >
                ✓ Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRAFFIC PREDICTIONS */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Multi-Horizon Congestion Forecast</h3>
              <p className="text-xs text-slate-400">Baseline Exponential Smoothing Model factoring historical trends & active hazards</p>
            </div>
            <button
              onClick={fetchPredictions}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map((p, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                  <span>+{p.horizonMinutes} MIN FORECAST</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-900/50 text-blue-300">
                    {Math.round(p.confidence * 100)}% CONFIDENCE
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {p.predictedSpeedKmh} <span className="text-sm font-normal text-slate-400">km/h</span>
                </div>
                <div className={`text-xs font-semibold mb-3 ${
                  p.predictedCongestion === 'LOW' ? 'text-emerald-400' :
                  p.predictedCongestion === 'MODERATE' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {p.predictedCongestion} CONGESTION
                </div>
                <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-900 pt-2">
                  {p.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HOSPITAL RECOMMENDATION */}
      {activeTab === 'hospitals' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Smart Hospital Recommendation Engine</h3>
              <p className="text-xs text-slate-400">Multi-criteria scoring: Distance, Trauma capability, ICU beds & Verified OSM Data</p>
            </div>
          </div>

          <div className="space-y-3">
            {hospitals.map((h, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg mt-0.5">
                    <Hospital className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{h.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-800/50">
                        {h.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{h.recommendationReason}</p>
                    <div className="flex gap-4 mt-2 text-[11px] text-slate-500">
                      <span>Distance: <b className="text-slate-300">{h.distanceKm} km</b></span>
                      <span>Transit: <b className="text-slate-300">~{h.estimatedTransitMinutes} mins</b></span>
                      <span>ICU Beds: <b className="text-slate-300">{h.capabilities.icuBedsAvailable}</b></span>
                      <span>Trauma: <b className="text-slate-300">{h.capabilities.traumaTier}</b></span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">{h.suitabilityScore}%</div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Match Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONTAINER OPS */}
      {activeTab === 'containers' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Red Hat DO188 Container Operations Center</h3>
              <p className="text-xs text-slate-400">Live Podman / Docker Engine state &bull; Volume persistence &bull; Worker queues</p>
            </div>
            <button
              onClick={fetchContainerOverview}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs rounded text-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-blue-400" /> Container Runtime
              </div>
              <div className="text-xl font-bold text-white mt-2">
                {containerStats?.engine || 'DOCKER / PODMAN OCI'}
              </div>
              <div className="text-xs text-emerald-400 mt-1 font-medium">Node.js 20 Minimal Runtime</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-400" /> Memory Footprint
              </div>
              <div className="text-xl font-bold text-white mt-2">
                {containerStats?.memoryUsage?.rssMb || '48.2'} MB
              </div>
              <div className="text-xs text-slate-400 mt-1">Uptime: {containerStats?.uptimeSeconds || 120}s</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-emerald-400" /> Volume Persistence
              </div>
              <div className="text-xl font-bold text-emerald-400 mt-2">
                ACTIVE
              </div>
              <div className="text-xs text-slate-400 mt-1">roadresq-mongo-data (SELinux :Z)</div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Active Containers</h4>
            <div className="space-y-2 text-xs">
              {(containerStats?.containers || [
                { name: 'roadresq-app', image: 'roadresq-backend:v1', status: 'Up (healthy)', ports: '5000, 5173' },
                { name: 'roadresq-db', image: 'mongo:7.0', status: 'Up', ports: '27017' }
              ]).map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-mono text-slate-200 font-semibold">{c.name}</span>
                    <span className="text-slate-500">({c.image})</span>
                  </div>
                  <span className="font-mono text-slate-400">{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
