import { useState, useMemo } from 'react';
import { Search, Hospital as HospitalIcon, ExternalLink, Phone, MapPin, RefreshCw, Scale } from 'lucide-react';
import type { Hospital as HospitalType } from '../../types';

interface HospitalDirectoryProps {
  hospitals: HospitalType[];
  selectedHospital: HospitalType | null;
  onSelectHospital: (h: HospitalType) => void;
  cityId: string;
  onConfirmDestination?: (h: HospitalType) => void;
}

export function HospitalDirectory({
  hospitals,
  selectedHospital,
  onSelectHospital,
  cityId,
  onConfirmDestination
}: HospitalDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [filterTraumaOnly, setFilterTraumaOnly] = useState(false);
  const [filterEmergencyOnly, setFilterEmergencyOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'trauma' | 'rank'>('rank');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [comparisonList, setComparisonList] = useState<HospitalType[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Collect unique specialties across hospitals
  const allSpecialties = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach(h => {
      h.specialties?.forEach(s => set.add(s));
    });
    return Array.from(set).sort();
  }, [hospitals]);

  // Filtering & Sorting
  const filtered = useMemo(() => {
    return hospitals
      .filter(h => {
        const matchesQuery = 
          h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (h.address && h.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (h.area && h.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (h.specialties && h.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesSpecialty = selectedSpecialty === 'ALL' || 
          (h.specialties && h.specialties.includes(selectedSpecialty));

        const matchesTrauma = !filterTraumaOnly || h.traumaLevel === 1;
        const matchesEmergency = !filterEmergencyOnly || h.hasEmergencyDepartment;

        return matchesQuery && matchesSpecialty && matchesTrauma && matchesEmergency;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return (a.routeDistanceKm || 999) - (b.routeDistanceKm || 999);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'trauma') {
          return a.traumaLevel - b.traumaLevel;
        }
        // Default: Rank score descending
        return (b.suitabilityScore || 0) - (a.suitabilityScore || 0);
      });
  }, [hospitals, searchQuery, selectedSpecialty, filterTraumaOnly, filterEmergencyOnly, sortBy]);

  const toggleComparison = (h: HospitalType) => {
    if (comparisonList.some(item => item.id === h.id)) {
      setComparisonList(comparisonList.filter(item => item.id !== h.id));
    } else {
      if (comparisonList.length >= 3) {
        alert('You can compare a maximum of 3 hospitals simultaneously.');
        return;
      }
      setComparisonList([...comparisonList, h]);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch(`http://localhost:5000/api/hospitals/discover?cityId=${cityId}&refresh=true`);
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', minWidth: 0 }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#151e34',
        padding: '10px 12px',
        borderRadius: '6px',
        border: '1px solid #25355a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px', backgroundColor: 'rgba(13, 148, 136, 0.15)', color: '#2dd4bf', borderRadius: '4px' }}>
            <HospitalIcon size={16} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase' }}>
              Healthcare Directory ({filtered.length} Facilities)
            </h3>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
              {cityId.toUpperCase()} &bull; OpenStreetMap Verified Data
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {comparisonList.length > 0 && (
            <button
              onClick={() => setShowComparisonModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Scale size={12} /> Compare ({comparisonList.length})
            </button>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: '#0f1626',
              color: '#94a3b8',
              border: '1px solid #1e2b48',
              borderRadius: '4px',
              fontSize: '0.7rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search & Specialty Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search hospital, locality (e.g. Adyar, Porur, Indiranagar)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              backgroundColor: '#080c16',
              color: '#f8fafc',
              border: '1px solid #1e2b48',
              borderRadius: '4px',
              fontSize: '0.75rem',
              outline: 'none'
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '8px', color: '#64748b' }} />
        </div>

        {/* Filters and Sorting Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
          <select
            value={selectedSpecialty}
            onChange={e => setSelectedSpecialty(e.target.value)}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '4px 6px',
              backgroundColor: '#080c16',
              color: '#f8fafc',
              border: '1px solid #1e2b48',
              borderRadius: '4px',
              fontSize: '0.68rem'
            }}
          >
            <option value="ALL">All Medical Specialties</option>
            {allSpecialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          <button
            onClick={() => setFilterTraumaOnly(!filterTraumaOnly)}
            style={{
              padding: '4px 8px',
              backgroundColor: filterTraumaOnly ? '#b91c1c' : '#151e34',
              color: filterTraumaOnly ? '#fff' : '#94a3b8',
              border: '1px solid #25355a',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Level 1 Trauma
          </button>

          <button
            onClick={() => setFilterEmergencyOnly(!filterEmergencyOnly)}
            style={{
              padding: '4px 8px',
              backgroundColor: filterEmergencyOnly ? '#059669' : '#151e34',
              color: filterEmergencyOnly ? '#fff' : '#94a3b8',
              border: '1px solid #25355a',
              borderRadius: '4px',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Emergency 24/7
          </button>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            style={{
              padding: '4px 6px',
              backgroundColor: '#080c16',
              color: '#f8fafc',
              border: '1px solid #1e2b48',
              borderRadius: '4px',
              fontSize: '0.68rem'
            }}
          >
            <option value="rank">Sort: Best Match Rank</option>
            <option value="distance">Sort: Road Distance</option>
            <option value="trauma">Sort: Trauma Level</option>
            <option value="name">Sort: Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Hospital Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '420px', overflowY: 'auto' }}>
        {filtered.map((h, idx) => {
          const isSelected = selectedHospital?.id === h.id;
          const isInComparison = comparisonList.some(item => item.id === h.id);

          return (
            <div
              key={h.id}
              onClick={() => onSelectHospital(h)}
              style={{
                backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : '#151e34',
                border: isSelected ? '1.5px solid #3b82f6' : '1px solid #25355a',
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              {/* Title & Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  {h.suitabilityScore ? (
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 5px',
                      borderRadius: '3px',
                      backgroundColor: h.suitabilityScore > 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: h.suitabilityScore > 80 ? '#34d399' : '#60a5fa',
                      border: `1px solid ${h.suitabilityScore > 80 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
                    }}>
                      #{idx + 1} ({h.suitabilityScore}%)
                    </span>
                  ) : null}
                  <strong style={{ fontSize: '0.8rem', color: isSelected ? '#ffffff' : '#f8fafc', lineHeight: 1.3 }}>
                    {h.name}
                  </strong>
                </div>

                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '3px',
                  backgroundColor: h.traumaLevel === 1 ? '#991b1b' : '#0284c7',
                  color: '#fff',
                  whiteSpace: 'nowrap'
                }}>
                  Level {h.traumaLevel} Trauma
                </span>
              </div>

              {/* Area & Address */}
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={11} color="#60a5fa" />
                <span>{h.area || h.address || 'Metropolitan Sector'}</span>
              </div>

              {/* Verified Metrics Strip */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '0.68rem',
                color: '#cbd5e1',
                padding: '4px 6px',
                backgroundColor: '#080c16',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}>
                {h.routeDistanceKm ? (
                  <span>Distance: <b style={{ color: '#38bdf8' }}>{h.routeDistanceKm} km</b></span>
                ) : null}
                {h.estimatedTransitMinutes ? (
                  <span>ETA: <b style={{ color: '#34d399' }}>~{h.estimatedTransitMinutes}m</b></span>
                ) : null}
                <span>Emergency: <b style={{ color: h.hasEmergencyDepartment ? '#34d399' : '#94a3b8' }}>
                  {h.hasEmergencyDepartment ? 'Verified 24/7' : 'Not listed'}
                </b></span>
              </div>

              {/* Specialties Pills */}
              {h.specialties && h.specialties.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {h.specialties.slice(0, 3).map((spec, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: '0.62rem',
                        padding: '1px 5px',
                        backgroundColor: '#1e293b',
                        color: '#94a3b8',
                        borderRadius: '3px'
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                  {h.specialties.length > 3 && (
                    <span style={{ fontSize: '0.62rem', color: '#64748b' }}>
                      +{h.specialties.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Contact and Actions Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #1e2b48' }}>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.68rem', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Phone size={10} /> {h.phone || '108'}
                  </span>
                  {h.website && h.website !== 'Not available' && (
                    <a
                      href={h.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#60a5fa', textDecoration: 'none' }}
                    >
                      <ExternalLink size={10} /> Web
                    </a>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComparison(h);
                    }}
                    style={{
                      padding: '2px 6px',
                      backgroundColor: isInComparison ? '#2563eb' : 'transparent',
                      color: isInComparison ? '#fff' : '#94a3b8',
                      border: '1px solid #334155',
                      borderRadius: '3px',
                      fontSize: '0.65rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isInComparison ? '✓ Compare' : '+ Compare'}
                  </button>

                  {onConfirmDestination && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConfirmDestination(h);
                      }}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '3px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Select Destination
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3-Hospital Comparison Modal */}
      {showComparisonModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0f1626',
            border: '1px solid #1e2b48',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px',
            color: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #1e2b48', paddingBottom: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Scale size={18} color="#60a5fa" /> Hospital Comparative Analysis ({comparisonList.length}/3)
                </h2>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                  Side-by-side evaluation of road distance, trauma tier and verified clinical specialties.
                </p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Comparison Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#151e34', borderBottom: '1px solid #25355a' }}>
                    <th style={{ padding: '10px', color: '#94a3b8', width: '22%' }}>Criteria</th>
                    {comparisonList.map(h => (
                      <th key={h.id} style={{ padding: '10px', color: '#f8fafc', fontWeight: 700 }}>
                        {h.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #1e2b48' }}>
                    <td style={{ padding: '10px', color: '#94a3b8', fontWeight: 600 }}>Trauma Tier</td>
                    {comparisonList.map(h => (
                      <td key={h.id} style={{ padding: '10px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: h.traumaLevel === 1 ? '#991b1b' : '#0284c7',
                          color: '#fff',
                          fontWeight: 700
                        }}>
                          Level {h.traumaLevel}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr style={{ borderBottom: '1px solid #1e2b48' }}>
                    <td style={{ padding: '10px', color: '#94a3b8', fontWeight: 600 }}>Road Distance</td>
                    {comparisonList.map(h => (
                      <td key={h.id} style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>
                        {h.routeDistanceKm ? `${h.routeDistanceKm} km` : 'Calculating...'}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ borderBottom: '1px solid #1e2b48' }}>
                    <td style={{ padding: '10px', color: '#94a3b8', fontWeight: 600 }}>Estimated Transit</td>
                    {comparisonList.map(h => (
                      <td key={h.id} style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                        {h.estimatedTransitMinutes ? `~${h.estimatedTransitMinutes} mins` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ borderBottom: '1px solid #1e2b48' }}>
                    <td style={{ padding: '10px', color: '#94a3b8', fontWeight: 600 }}>Emergency Dept</td>
                    {comparisonList.map(h => (
                      <td key={h.id} style={{ padding: '10px', color: h.hasEmergencyDepartment ? '#34d399' : '#94a3b8' }}>
                        {h.hasEmergencyDepartment ? 'Verified 24/7' : 'Not verified'}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ borderBottom: '1px solid #1e2b48' }}>
                    <td style={{ padding: '10px', color: '#94a3b8', fontWeight: 600 }}>Locality</td>
                    {comparisonList.map(h => (
                      <td key={h.id} style={{ padding: '10px', color: '#cbd5e1' }}>
                        {h.area || h.address || 'Urban Sector'}
                      </td>
                    ))}
                  </tr>

                  <tr style={{ borderBottom: '1px solid #1e2b48' }}>
                    <td style={{ padding: '10px', color: '#94a3b8', fontWeight: 600 }}>Clinical Specialties</td>
                    {comparisonList.map(h => (
                      <td key={h.id} style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {h.specialties?.map((s, i) => (
                            <span key={i} style={{ fontSize: '0.62rem', padding: '1px 4px', backgroundColor: '#1e293b', borderRadius: '2px', color: '#94a3b8' }}>
                              {s}
                            </span>
                          )) || 'General Healthcare'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ padding: '10px', color: '#94a3b8', fontWeight: 600 }}>Dispatch Action</td>
                    {comparisonList.map(h => (
                      <td key={h.id} style={{ padding: '10px' }}>
                        <button
                          onClick={() => {
                            if (onConfirmDestination) onConfirmDestination(h);
                            setShowComparisonModal(false);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#059669',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.72rem'
                          }}
                        >
                          Select This Destination
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
