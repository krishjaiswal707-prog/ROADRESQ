import { useState, useEffect } from 'react';
import { ShieldAlert, MapPin, Activity } from 'lucide-react';
import type { City, Hospital, RouteOptimizationData } from './types';
import { useCitySocket } from './hooks/useCitySocket';
import { TrafficMap } from './components/map/TrafficMap';
import { EmergencyControls } from './components/dashboard/EmergencyControls';
import { SignalMonitor } from './components/dashboard/SignalMonitor';

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

  // Modular custom socket hook scoped to city room
  const { signals, segments, ambulance } = useCitySocket(selectedCityId);

  // Load available cities
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

  // On city selection change
  useEffect(() => {
    fetch(`http://localhost:5000/api/cities/${selectedCityId}`)
      .then(r => r.json())
      .then(d => {
        if (d.city) {
          setCurrentCity(d.city);
          if (d.city.hospitals) {
            setHospitals(d.city.hospitals);
            setSelectedHospital(d.city.hospitals[0] || null);
          }
        }
      })
      .catch(console.error);

    // Reset active corridor lines for the new city
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
      // Calculate origin relative to city hospital
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
      {/* Header */}
      <header style={{ padding: '14px 24px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#dc2626', color: '#fff', padding: '8px', borderRadius: '8px', display: 'flex' }}>
            <ShieldAlert size={26} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5px' }}>
              ROAD RESQ AI <span style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 500 }}>| Free-First Mapping & Emergency Optimization</span>
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>OpenStreetMap + React-Leaflet + OSRM Priority Routing Engine</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* City Selection Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '6px' }}>
            <MapPin size={16} color="#38bdf8" />
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>City:</span>
            <select 
              value={selectedCityId} 
              onChange={e => setSelectedCityId(e.target.value)}
              style={{ background: 'transparent', color: '#f8fafc', border: 'none', fontWeight: 600, outline: 'none', cursor: 'pointer' }}
            >
              {cities.map(c => (
                <option key={c.cityId} value={c.cityId} style={{ background: '#1e293b' }}>
                  {c.cityName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', borderRadius: '20px', backgroundColor: '#052e16', color: '#4ade80', border: '1px solid #166534' }}>
            <Activity size={14} /> OpenStreetMap Engine Active
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '370px 1fr 340px', flex: 1, overflow: 'hidden' }}>
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

        <main style={{ position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#020617', height: '100%' }}>
          <div style={{ padding: '8px 16px', backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>
              Active Road Network: <span style={{ color: '#f8fafc' }}>{selectedCityId.toUpperCase()} EMERGENCY DISPATCH SECTOR</span>
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
        </main>

        <SignalMonitor signals={signals} segments={segments} />
      </div>
    </div>
  );
}
