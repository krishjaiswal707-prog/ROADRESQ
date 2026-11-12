import { useState } from 'react';
import { Search, Hospital } from 'lucide-react';
import type { Hospital as HospitalType } from '../../types';

interface HospitalDirectoryProps {
  hospitals: HospitalType[];
  selectedHospital: HospitalType | null;
  onSelectHospital: (h: HospitalType) => void;
  cityId: string;
}

export function HospitalDirectory({
  hospitals,
  selectedHospital,
  onSelectHospital,
  cityId
}: HospitalDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTraumaOnly, setFilterTraumaOnly] = useState(false);

  const filtered = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.address && h.address.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTrauma = filterTraumaOnly ? h.traumaLevel === 1 : true;
    return matchesSearch && matchesTrauma;
  });

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Hospital size={16} /> Discovered Hospitals ({filtered.length})
        </h3>
        <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
          {cityId.toUpperCase()} OVERPASS FEED
        </span>
      </div>

      {/* Search & Trauma Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search hospital or specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '6px 8px 6px 28px', backgroundColor: '#0f172a', color: '#f8fafc', border: '1px solid #334155', borderRadius: '4px', fontSize: '0.75rem', boxSizing: 'border-box' }}
          />
          <Search size={13} style={{ position: 'absolute', left: '8px', top: '8px', color: '#64748b' }} />
        </div>
        <button
          onClick={() => setFilterTraumaOnly(!filterTraumaOnly)}
          style={{
            padding: '4px 8px',
            backgroundColor: filterTraumaOnly ? '#0284c7' : '#0f172a',
            color: filterTraumaOnly ? '#fff' : '#94a3b8',
            border: '1px solid #334155',
            borderRadius: '4px',
            fontSize: '0.7rem',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {filterTraumaOnly ? 'Level 1 Active' : 'Level 1 Only'}
        </button>
      </div>

      {/* Hospital List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '190px', overflowY: 'auto' }}>
        {filtered.map(h => {
          const isSelected = selectedHospital?.id === h.id;
          return (
            <div
              key={h.id}
              onClick={() => onSelectHospital(h)}
              style={{
                backgroundColor: isSelected ? '#0c4a6e' : '#0f172a',
                border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                padding: '10px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <strong style={{ fontSize: '0.78rem', color: isSelected ? '#ffffff' : '#f8fafc' }}>
                  {h.name}
                </strong>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 5px', borderRadius: '3px', backgroundColor: h.traumaLevel === 1 ? '#15803d' : '#0284c7', color: '#fff' }}>
                  Level {h.traumaLevel}
                </span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Beds: <strong style={{ color: '#4ade80' }}>{h.emergencyBeds} Available</strong></span>
                <span>{h.phone || 'Emergency Desk'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
