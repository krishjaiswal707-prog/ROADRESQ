import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Radio,
  Flame,
  Truck,
  AlertTriangle,
  Hospital as HospitalIcon
} from 'lucide-react';
import type { City, Hospital, RouteOptimizationData } from './types';
import { useCitySocket } from './hooks/useCitySocket';
import { TrafficMap } from './components/map/TrafficMap';
import { EmergencyControls } from './components/dashboard/EmergencyControls';
import { SignalMonitor } from './components/dashboard/SignalMonitor';
import { CraneAssistant } from './components/crane/CraneAssistant';
import { HazardManager } from './components/hazards/HazardManager';
import { HospitalDirectory } from './components/hospitals/HospitalDirectory';
import { AdvancedIntelligence } from './components/dashboard/AdvancedIntelligence';

export default function App() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('chennai');
  const [currentCity, setCurrentCity] = useState<City | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string>('IDLE');
  const [routeInfo, setRouteInfo] = useState<RouteOptimizationData | null>(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState<any[]>([]);
  const [trendPrediction, setTrendPrediction] = useState<any>(null);

  // Active Control Panel Tab: 'EMERGENCY' | 'CRANE' | 'HAZARDS' | 'HOSPITALS'
  const [activeTab, setActiveTab] = useState<'EMERGENCY' | 'CRANE' | 'HAZARDS' | 'HOSPITALS'>('EMERGENCY');

  // City-scoped Socket.IO connection hook
  const { signals, segments, ambulance } = useCitySocket(selectedCityId);

  // 1. Load supported cities
  useEffect(() => {
    fetch('http://localhost:5000/api/cities')
      .then(r => r.json())
      .then(d => {
        if (d.cities) {
          setCities(d.cities);
          const initial = d.cities.find((c: City) => c.cityId === 'chennai') || d.cities[0];
          setCurrentCity(initial);
        }
      })
      .catch(console.error);
  }, []);

  // 2. Load city configuration & discovered hospitals
  useEffect(() => {
    fetch(`http://localhost:5000/api/hospitals/discover?cityId=${selectedCityId}`)
      .then(r => r.json())
      .then(d => {
        if (d.hospitals) {
          setHospitals(d.hospitals);
          setSelectedHospital(d.hospitals[0] || null);
        }
      })
      .catch(console.error);

    fetch(`http://localhost:5000/api/cities/${selectedCityId}`)
      .then(r => r.json())
      .then(d => {
        if (d.city) setCurrentCity(d.city);
      })
      .catch(console.error);

    setRouteInfo(null);
    setAlternativeRoutes([]);
    setDispatchStatus('IDLE');

    fetch('http://localhost:5000/api/traffic/predict')
      .then(r => r.json())
      .then(setTrendPrediction)
      .catch(console.error);
  }, [selectedCityId]);

  const handleDispatch = async () => {
    if (!selectedHospital || !currentCity) return;
    setDispatchStatus('DISPATCHING');

    try {
      const origin = {
        name: `${selectedCityId.toUpperCase()} Emergency Site Alpha`,
        lat: selectedHospital.lat + 0.012,
        lng: selectedHospital.lng - 0.015
      };

      const res = await fetch('http://localhost:5000/api/emergency/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: selectedCityId,
          origin,
          destination: {
            name: selectedHospital.name,
            lat: selectedHospital.lat,
            lng: selectedHospital.lng
          },
          ambulanceId: 'AMB-RESQ-108'
        })
      });

      const data = await res.json();
      if (data.trip) {
        setRouteInfo(data.trip.selectedRoute);
        setAlternativeRoutes(data.trip.alternativeRoutes || []);
        setDispatchStatus('GREEN_CORRIDOR_ACTIVE');
      }
    } catch (err) {
      console.error(err);
      setDispatchStatus('IDLE');
    }
  };

  const handleCancel = async () => {
    await fetch('http://localhost:5000/api/emergency/cancel', { method: 'POST' });
    setDispatchStatus('IDLE');
    setRouteInfo(null);
    setAlternativeRoutes([]);
  };

  const defaultCenter = currentCity?.center || { lat: 13.0827, lng: 80.2707 };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#0b1120', color: '#e2e8f0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header style={{ padding: '12px 24px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#dc2626', color: '#fff', padding: '8px', borderRadius: '8px', display: 'flex', boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.5px' }}>
              ROAD RESQ AI <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>| Integrated Traffic & Emergency Management</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
              Multi-City Ambulance Corridor • Towing Assistance • Road Hazard Patrol • Hospital Discovery
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Multi-City Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '6px', border: '1px solid #334155' }}>
            <MapPin size={15} color="#38bdf8" />
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>City:</span>
            <select 
              value={selectedCityId} 
              onChange={e => setSelectedCityId(e.target.value)}
              style={{ background: 'transparent', color: '#f8fafc', border: 'none', fontWeight: 700, outline: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              {cities.map(c => (
                <option key={c.cityId} value={c.cityId} style={{ background: '#1e293b' }}>
                  {c.cityName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '6px 12px', borderRadius: '20px', backgroundColor: '#052e16', color: '#4ade80', border: '1px solid #166534' }}>
            <Radio size={13} className="spin" /> Free-First OSM Live
          </div>
        </div>
      </header>

      {/* Module Navigation Tabs */}
      <nav style={{ backgroundColor: '#090d16', borderBottom: '1px solid #1e293b', padding: '6px 24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('EMERGENCY')}
          style={{
            padding: '6px 14px',
            backgroundColor: activeTab === 'EMERGENCY' ? '#0284c7' : '#1e293b',
            color: activeTab === 'EMERGENCY' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Flame size={14} /> Ambulance Green Corridor
        </button>

        <button
          onClick={() => setActiveTab('CRANE')}
          style={{
            padding: '6px 14px',
            backgroundColor: activeTab === 'CRANE' ? '#d97706' : '#1e293b',
            color: activeTab === 'CRANE' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Truck size={14} /> Crane & Towing Service
        </button>

        <button
          onClick={() => setActiveTab('HAZARDS')}
          style={{
            padding: '6px 14px',
            backgroundColor: activeTab === 'HAZARDS' ? '#dc2626' : '#1e293b',
            color: activeTab === 'HAZARDS' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AlertTriangle size={14} /> Road Hazards & Bridges
        </button>

        <button
          onClick={() => setActiveTab('HOSPITALS')}
          style={{
            padding: '6px 14px',
            backgroundColor: activeTab === 'HOSPITALS' ? '#0d9488' : '#1e293b',
            color: activeTab === 'HOSPITALS' ? '#ffffff' : '#94a3b8',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.78rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <HospitalIcon size={14} /> Hospital Directory
        </button>
      </nav>

      {/* Main Grid Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr 340px', flex: 1, overflow: 'hidden' }}>
        {/* Left Interactive Control Panel based on selected tab */}
        <div style={{ overflowY: 'auto', backgroundColor: '#0f172a', borderRight: '1px solid #1e293b', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'EMERGENCY' && (
            <EmergencyControls
              hospitals={hospitals}
              selectedHospital={selectedHospital}
              onSelectHospital={setSelectedHospital}
              dispatchStatus={dispatchStatus}
              onDispatch={handleDispatch}
              onCancel={handleCancel}
              routeInfo={routeInfo}
              trendPrediction={trendPrediction}
              alternativeRoutes={alternativeRoutes}
            />
          )}

          {activeTab === 'CRANE' && (
            <CraneAssistant cityId={selectedCityId} />
          )}

          {activeTab === 'HAZARDS' && (
            <HazardManager cityId={selectedCityId} />
          )}

          {activeTab === 'HOSPITALS' && (
            <HospitalDirectory
              hospitals={hospitals}
              selectedHospital={selectedHospital}
              onSelectHospital={setSelectedHospital}
              cityId={selectedCityId}
            />
          )}
        </div>

        {/* Center: Leaflet OpenStreetMap Viewport */}
        <main style={{ position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#020617', height: '100%' }}>
          <div style={{ padding: '8px 16px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
              Interactive Sector: <span style={{ color: '#f8fafc' }}>{selectedCityId.toUpperCase()} DISPATCH GRID</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Lat: {defaultCenter.lat.toFixed(4)}, Lng: {defaultCenter.lng.toFixed(4)}
            </span>
          </div>

          <TrafficMap
            cityId={selectedCityId}
            cityCenter={defaultCenter}
            signals={signals}
            hospitals={hospitals}
            selectedHospital={selectedHospital}
            ambulance={ambulance}
            isGreenCorridorActive={dispatchStatus === 'GREEN_CORRIDOR_ACTIVE'}
            routeCoordinates={routeInfo?.pathCoordinates || []}
            alternativeRoutes={alternativeRoutes}
          />
          <div style={{ padding: '0 16px 16px 16px', overflowY: 'auto' }}>
            <AdvancedIntelligence cityId={selectedCityId} />
          </div>
        </main>

        {/* Right: Live Traffic Telemetry & Preemption Monitor */}
        <SignalMonitor signals={signals} segments={segments} />
      </div>
    </div>
  );
}
