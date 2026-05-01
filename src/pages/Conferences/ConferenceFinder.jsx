import { useState, useEffect } from "react";
import { getConferences, filterConferences, getConferenceFields } from "../../services/conferenceService";
import { FiCalendar, FiMapPin, FiClock, FiSearch, FiExternalLink } from "react-icons/fi";

const ConferenceFinder = () => {
  const [conferences, setConferences] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fieldFilter, setFieldFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");

  useEffect(() => {
    let isActive = true;
    setLoading(true);

    const timer = setTimeout(() => {
      getConferences({ searchQuery: search, field: fieldFilter })
        .then((data) => {
          if (!isActive) return;
          setConferences(data);
          setLoading(false);
        })
        .catch(() => {
          if (!isActive) return;
          setConferences([]);
          setLoading(false);
        });
    }, 400);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [search, fieldFilter]);

  useEffect(() => {
    const result = filterConferences(conferences, {
      field: fieldFilter,
      mode: modeFilter,
      searchQuery: search,
    });
    setFiltered(result);
  }, [search, fieldFilter, modeFilter, conferences]);

  const fields = getConferenceFields(conferences);

  return (
    <div className="page-wrapper animate-in">
      <div className="section-header">
        <h1 className="section-title">Conference Finder</h1>
        <p className="section-subtitle">Discover upcoming academic conferences and submission deadlines</p>
      </div>

      <div className="filter-container card" style={{marginBottom: '40px', padding: '24px'}}>
        <div className="grid-3" style={{alignItems: 'flex-end'}}>
          <div className="input-group">
            <label>Search Conferences</label>
            <div style={{position: 'relative'}}>
              <FiSearch style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Name, city, or topic..." 
                style={{paddingLeft: '36px'}}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Field of Research</label>
            <select className="input-field" value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)}>
              <option value="">All Fields</option>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>Mode</label>
            <select className="input-field" value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}>
              <option value="">All Modes</option>
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map((conf, index) => (
            <div key={conf.id} className="card animate-in" style={{animationDelay: `${index * 0.05}s`}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                <span className="badge badge-accent">{conf.field}</span>
                <span className={`badge ${conf.mode === 'offline' ? 'badge-warning' : 'badge-success'}`}>
                  {conf.mode.toUpperCase()}
                </span>
              </div>

              <h3 style={{fontSize: '1.2rem', marginBottom: '12px', color: 'var(--text-primary)'}}>{conf.name}</h3>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FiMapPin /> <span>{conf.location}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FiCalendar /> <span><strong>Event:</strong> {conf.eventDate}</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)'}}>
                  <FiClock /> <span><strong>Deadline:</strong> {conf.submissionDeadline}</span>
                </div>
              </div>

              <div style={{marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <a href={conf.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  Official Site <FiExternalLink />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FiCalendar />
          <h3>No conferences found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ConferenceFinder;
