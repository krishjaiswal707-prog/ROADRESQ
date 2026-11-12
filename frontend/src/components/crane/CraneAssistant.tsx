import { useState, useEffect } from 'react';
import { Truck, PlusCircle, Clock } from 'lucide-react';
import type { CraneVehicle, CraneRequestItem } from '../../types';

interface CraneAssistantProps {
  cityId: string;
}

export function CraneAssistant({ cityId }: CraneAssistantProps) {
  const [fleet, setFleet] = useState<CraneVehicle[]>([]);
  const [requests, setRequests] = useState<CraneRequestItem[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [vehicleCategory, setVehicleCategory] = useState('SEDAN_HATCHBACK');
  const [breakdownType, setBreakdownType] = useState('ENGINE_FAILURE');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCraneData = async () => {
    try {
      const [fRes, rRes] = await Promise.all([
        fetch(`http://localhost:5000/api/crane/fleet?cityId=${cityId}`),
        fetch(`http://localhost:5000/api/crane/requests?cityId=${cityId}`)
      ]);
      const fData = await fRes.json();
      const rData = await rRes.json();
      if (fData.fleet) setFleet(fData.fleet);
      if (rData.requests) setRequests(rData.requests);
    } catch (err) {
      console.error('Failed to fetch crane data:', err);
    }
  };

  useEffect(() => {
    fetchCraneData();
  }, [cityId]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Mock roadside incident location in city
      const mockLocation = cityId === 'bengaluru'
        ? { name: 'MG Road Junction', lat: 12.9734, lng: 77.6205 }
        : cityId === 'coimbatore'
        ? { name: 'Cross Cut Road', lat: 11.0145, lng: 76.9601 }
        : { name: 'Anna Salai Near Gemini', lat: 13.0519, lng: 80.2514 };

      const res = await fetch('http://localhost:5000/api/crane/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId,
          citizenName: 'Stranded Motorist',
          contactPhone: '+91 98401 22334',
          vehicleCategory,
          breakdownType,
          location: mockLocation,
          description: description || 'Vehicle immobilized due to breakdown.'
        })
      });

      const data = await res.json();
      if (data.request) {
        setRequests(prev => [data.request, ...prev]);
        setShowRequestForm(false);
        setDescription('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Truck size={16} /> Towing & Crane Assistance
        </h3>
        <button
          onClick={() => setShowRequestForm(!showRequestForm)}
          style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <PlusCircle size={13} /> {showRequestForm ? 'Close' : 'Request Tow'}
        </button>
      </div>

      {showRequestForm && (
        <form onSubmit={handleCreateRequest} style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #334155' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Vehicle Class:</label>
            <select
              value={vehicleCategory}
              onChange={e => setVehicleCategory(e.target.value)}
              style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', fontSize: '0.75rem' }}
            >
              <option value="TWO_WHEELER">Two Wheeler / Bike</option>
              <option value="SEDAN_HATCHBACK">Sedan / Hatchback</option>
              <option value="SUV_4X4">SUV / 4x4 Off-roader</option>
              <option value="HEAVY_COMMERCIAL">Commercial Truck / Bus</option>
            </select>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Incident Type:</label>
            <select
              value={breakdownType}
              onChange={e => setBreakdownType(e.target.value)}
              style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', fontSize: '0.75rem' }}
            >
              <option value="ENGINE_FAILURE">Engine Stalled / Overheating</option>
              <option value="ACCIDENT_TOW">Collision / Tow Recovery</option>
              <option value="TIRE_BURST">Tire Puncture / Burst</option>
              <option value="BATTERY_DEAD">Battery Dead / Jumpstart</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Description:</label>
            <input
              type="text"
              placeholder="e.g. Car won't start in fast lane..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ width: '100%', padding: '6px', backgroundColor: '#1e293b', color: '#f8fafc', border: '1px solid #475569', borderRadius: '4px', fontSize: '0.75rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ width: '100%', padding: '8px', backgroundColor: '#d97706', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
          >
            {submitting ? 'Dispatching Tow Unit...' : 'Confirm Tow Assistance Dispatch'}
          </button>
        </form>
      )}

      {/* Available Fleet in City */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>Registered Fleet ({fleet.length} Units):</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {fleet.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '8px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>
              <div>
                <strong style={{ color: '#f8fafc' }}>{c.name}</strong>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{c.serviceType} • {c.capacityTons} Ton • {c.phone}</div>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c.status === 'AVAILABLE' ? '#4ade80' : '#f59e0b', backgroundColor: c.status === 'AVAILABLE' ? '#14532d' : '#78350f', padding: '2px 6px', borderRadius: '4px' }}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active Requests */}
      {requests.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>Active Tow Requests:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
            {requests.map(r => (
              <div key={r.requestId} style={{ backgroundColor: '#0f172a', padding: '8px 10px', borderRadius: '4px', fontSize: '0.75rem', borderLeft: '3px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#f8fafc' }}>{r.vehicleCategory} ({r.breakdownType})</strong>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{r.status}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                  Location: {r.location?.name || 'Roadside'} • Assigned: <strong style={{ color: '#38bdf8' }}>{r.assignedCraneName || 'Pending'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                  <Clock size={10} /> ETA: ~{r.etaMinutes} min
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
