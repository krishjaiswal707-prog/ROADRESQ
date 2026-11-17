import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
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
          }
        })
      });

      const data = await res.json();
      if (data.routeOptimization) {
        setRouteInfo(data.routeOptimization);
        setAlternativeRoutes(data.routeOptimization.alternatives || []);
        setDispatchStatus('GREEN_CORRIDOR_ACTIVE');
      } else {
        setDispatchStatus('IDLE');
      }
    } catch (err) {
      console.error(err);
      setDispatchStatus('IDLE');
    }
  };

  const handleCancel = async () => {
    try {
      await fetch('http://localhost:5000/api/emergency/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityId: selectedCityId })
      });
      setRouteInfo(null);
      setAlternativeRoutes([]);
      setDispatchStatus('IDLE');
    } catch (err) {
      console.error(err);
    }
  };

  const defaultCenter = currentCity?.center || { lat: 13.0827, lng: 80.2707 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--bg-app)' }}>
      {/* Top Header Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: '56px',
        backgroundColor: '#0f1626',
        borderBottom: '1px solid #1e2b48',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '6px', backgroundColor: '#dc2626', borderRadius: '6px', color: '#fff', display: 'flex' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.5px' }}>
                ROAD RESQ AI <span style={{ color: '#38bdf8' }}>2.0</span>
              </h1>
              <span style={{ fontSize: '0.65rem', padding: '1px 6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '4px', fontWeight: 700, border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                DO188 CAPSTONE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8' }}>
              Integrated Emergency Traffic Clearing &amp; Green Corridor Operations
            </p>
          </div>
        </div>

        {/* City Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <MapPin size={14} color="#60a5fa" /> Urban Sector:
          </label>
          <select
            value={selectedCityId}
            onChange={e => setSelectedCityId(e.target.value)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#151e34',
              color: '#f8fafc',
              border: '1px solid #25355a',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.78rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {cities.map(c => (
              <option key={c.cityId} value={c.cityId}>
                {c.cityName.toUpperCase()} ({c.state})
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Module Navigation Tabs */}
      <nav style={{
        display: 'flex',
        gap: '6px',
        padding: '8px 20px',
        backgroundColor: '#080c16',
        borderBottom: '1px solid #1e2b48',
        flexShrink: 0
      }}>
        {[
          { id: 'EMERGENCY', label: 'Smart Traffic & Green Corridor', icon: Flame, color: '#2563eb' },
          { id: 'CRANE', label: 'Crane & Towing Service', icon: Truck, color: '#d97706' },
          { id: 'HAZARDS', label: 'Road Hazards & Bridges', icon: AlertTriangle, color: '#dc2626' },
          { id: 'HOSPITALS', label: 'Hospital Directory', icon: HospitalIcon, color: '#0d9488' }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '6px 14px',
                backgroundColor: isActive ? tab.color : '#0f1626',
                color: isActive ? '#ffffff' : '#94a3b8',
                border: isActive ? 'none' : '1px solid #1e2b48',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Main Responsive Grid Layout */}
      <div className="dashboard-layout">
        {/* Left Column: Interactive Dispatch & Operational Control */}
        <aside style={{
          overflowY: 'auto',
          backgroundColor: '#0f1626',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          minWidth: 0,
          borderRight: '1px solid #1e2b48'
        }}>
          {activeTab === 'EMERGENCY' && (
            <EmergencyControls
              cityId={selectedCityId}
              hospitals={hospitals}
              selectedHospital={selectedHospital}
              onSelectHospital={setSelectedHospital}
              dispatchStatus={dispatchStatus}
              onDispatch={handleDispatch}
              onCancel={handleCancel}
              routeInfo={routeInfo}
              trendPrediction={trendPrediction}
              alternativeRoutes={alternativeRoutes}
              onOpenHospitalDirectory={() => setActiveTab('HOSPITALS')}
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
              onConfirmDestination={(h) => {
                setSelectedHospital(h);
                setActiveTab('EMERGENCY');
              }}
            />
          )}
        </aside>

        {/* Center Column: Leaflet Map & Operational Intelligence Dashboard */}
        <main className="center-workspace">
          <div style={{
            padding: '8px 16px',
            backgroundColor: '#0f1626',
            borderBottom: '1px solid #1e2b48',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>
              Interactive Sector: <span style={{ color: '#f8fafc' }}>{selectedCityId.toUpperCase()} DISPATCH GRID</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              Lat: {defaultCenter.lat.toFixed(4)}, Lng: {defaultCenter.lng.toFixed(4)}
            </span>
          </div>

          {/* Leaflet Map with responsive height */}
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

          {/* Operational Intelligence (SLA Timeline, Predictions, Hospital Ranking, Container Ops) */}
          <div className="intelligence-section">
            <AdvancedIntelligence cityId={selectedCityId} />
          </div>
        </main>

        {/* Right Column: Traffic Telemetry & Preemption Monitor */}
        <SignalMonitor signals={signals} segments={segments} />
      </div>
    </div>
  );
}
