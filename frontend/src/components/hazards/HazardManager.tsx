import { useState, useEffect } from 'react';
import { AlertOctagon, PlusCircle, CheckCircle } from 'lucide-react';
import type { RoadHazardItem } from '../../types';

interface HazardManagerProps {
  cityId: string;
}

export function HazardManager({ cityId }: HazardManagerProps) {
  const [hazards, setHazards] = useState<RoadHazardItem[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [hazardType, setHazardType] = useState<'POTHOLE' | 'DAMAGED_BRIDGE' | 'ROAD_CRACK' | 'WATERLOGGING' | 'OBSTRUCTION' | 'ACCIDENT_PRONE'>('POTHOLE');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchHazards = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/hazards?cityId=${cityId}`);
      const data = await res.json();
      if (data.hazards) setHazards(data.hazards);
    } catch (err) {
      console.error('Failed to fetch hazards:', err);
    }
  };

  useEffect(() => {
    fetchHazards();
  }, [cityId]);

  const handleReportHazard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const mockLocation = cityId === 'bengaluru'
        ? { name: 'Old Airport Road Flyover', lat: 12.9592, lng: 77.6444 }
        : cityId === 'coimbatore'
        ? { name: 'Lakshmi Mills Underpass', lat: 11.0085, lng: 76.9805 }
        : { name: 'Kathipara Grade Separator', lat: 13.0076, lng: 80.2038 };

      const res = await fetch('http://localhost:5000/api/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId,
          hazardType,
          severity,
          location: mockLocation,
          description: description || 'Severe road damage posing risks to vehicular transit.',
          reportedBy: 'Citizen Highway Alert'
        })
      });

      const data = await res.json();
      if (data.hazard) {
        setHazards(prev => [data.hazard, ...prev]);
        setShowReportForm(false);
        setDescription('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (hazardId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/hazards/${hazardId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationStatus: 'VERIFIED',
          isBlockingTraffic: true,
          assignedMaintenanceTeam: 'Metro Highways Rapid Repair Squad 4'
        })
      });
      const data = await res.json();
      if (data.hazard) {
        setHazards(prev => prev.map(h => h.hazardId === hazardId ? data.hazard : h));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return { bg: '#7f1d1d', text: '#fca5a5' };
      case 'HIGH':
        return { bg: '#7c2d12', text: '#fed7aa' };
      case 'MEDIUM':
        return { bg: '#78350f', text: '#fde68a' };
      default:
        return { bg: '#1e293b', text: '#cbd5e1' };
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertOctagon size={16} /> Bridge & Road Hazard Control
        </h3>
        <button
          onClick={() => setShowReportForm(!showReportForm)}
          style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <PlusCircle size={13} /> {showReportForm ? 'Close' : 'Report Hazard'}
        </button>
      </div>

      {showReportForm && (
        <form onSubmit={handleReportHazard} style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #334155' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Hazard Classification:</label>
            <select
              value={hazardType}
              onChange={e => setHazardType(e.target.value as any)}
              style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', fontSize: '0.75rem' }}
            >
              <option value="POTHOLE">Deep Crater / Pothole</option>
              <option value="DAMAGED_BRIDGE">Bridge Structural Defect</option>
              <option value="WATERLOGGING">Severe Waterlogging / Flooding</option>
              <option value="OBSTRUCTION">Fallen Tree / Road Obstruction</option>
              <option value="ROAD_CRACK">Fissure / Road Subsidence</option>
            </select>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Severity Level:</label>
            <select
              value={severity}
              onChange={e => setSeverity(e.target.value as any)}
              style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', fontSize: '0.75rem' }}
            >
              <option value="LOW">Low - Minor Slowdown</option>
              <option value="MEDIUM">Medium - Caution Required</option>
              <option value="HIGH">High - Dangerous to Two-Wheelers</option>
              <option value="CRITICAL">Critical - Immediate Road Closure Risk</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Description:</label>
            <input
              type="text"
              placeholder="e.g. 2ft crater in middle lane..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', fontSize: '0.75rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '8px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {submitting ? 'Transmitting Hazard Report...' : 'Submit Hazard to Highway Patrol'}
          </button>
        </form>
      )}

      {/* Hazard List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
        {hazards.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', padding: '12px' }}>
            No unresolved hazards reported in {cityId.toUpperCase()}.
          </div>
        ) : (
          hazards.map(h => {
            const badge = getSeverityBadge(h.severity);
            return (
              <div key={h.hazardId} style={{ backgroundColor: '#0f172a', padding: '10px', borderRadius: '6px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#f8fafc', fontSize: '0.78rem' }}>{h.hazardType.replace('_', ' ')}</strong>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: badge.bg, color: badge.text, padding: '2px 6px', borderRadius: '4px' }}>
                    {h.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{h.location?.name}</div>
                <p style={{ margin: '4px 0', fontSize: '0.7rem', color: '#cbd5e1' }}>{h.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.65rem', color: h.verificationStatus === 'VERIFIED' ? '#4ade80' : '#f59e0b', fontWeight: 600 }}>
                    Status: {h.verificationStatus}
                  </span>
                  {h.verificationStatus === 'SUBMITTED' && (
                    <button
                      onClick={() => handleVerify(h.hazardId)}
                      style={{ background: '#15803d', color: '#fff', border: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                    >
                      <CheckCircle size={11} /> Verify & Reroute
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
