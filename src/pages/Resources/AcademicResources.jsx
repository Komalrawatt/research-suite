import { useState, useEffect, useCallback } from "react";
import { FiBook, FiFileText, FiSearch, FiX, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { searchCaseStudiesOpenAlex, searchThesesOpenAlex } from "../../services/academicRepositoryService";

const AcademicResources = () => {
  const [activeTab, setActiveTab] = useState("thesis");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal state for "data not available" popup
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const openModal = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage("");
  };

  const fetchResults = useCallback(async (query, tab) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const data = tab === "thesis"
        ? await searchThesesOpenAlex(query)
        : await searchCaseStudiesOpenAlex(query);

      setResults(data.map((item) => ({
        ...item,
        type: tab,
      })));

      if (data.length === 0) {
        openModal(
          `No ${tab === "thesis" ? "theses or dissertations" : "case studies"} found for "${query}". The data you are looking for is not available at the moment. Please try a different search term.`
        );
      }
    } catch (error) {
      console.error("Academic Repository fetch error:", error);
      setResults([]);
      openModal(
        "This data is not available right now. The API may be temporarily unavailable or the request failed. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load default results on mount
  useEffect(() => {
    fetchResults("research", activeTab);
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) {
      toast.error("Enter a topic to search");
      return;
    }
    fetchResults(trimmed, activeTab);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const query = search.trim() || "research";
    fetchResults(query, tab);
  };

  return (
    <div className="page-wrapper container animate-in">
      <div className="section-header">
        <h1 className="section-title">Academic Repository</h1>
        <p className="section-subtitle">Browse approved theses, dissertations, and real-world case studies</p>
      </div>

      <div className="card" style={{marginBottom: '40px'}}>
        <form onSubmit={handleSearch} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'}}>
          <div className="tab-buttons" style={{display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: 'var(--radius-md)'}}>
            <button 
              className={`btn btn-sm ${activeTab === 'thesis' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleTabChange('thesis')}
              type="button"
            >
              <FiBook /> Theses & Dissertations
            </button>
            <button 
              className={`btn btn-sm ${activeTab === 'case_study' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleTabChange('case_study')}
              type="button"
            >
              <FiFileText /> Case Studies
            </button>
          </div>

          <div style={{position: 'relative', flex: 1, maxWidth: '400px'}}>
            <FiSearch style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
            <input 
              type="text" 
              className="input-field" 
              placeholder={activeTab === "thesis" ? "Search thesis topics..." : "Search case study topics..."}
              style={{paddingLeft: '36px', width: '100%'}}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Fetching academic resources from OpenAlex...</p>
        </div>
      ) : (
        <div className="grid-2">
          {results.map((item, idx) => (
            <div key={item.id || idx} className="card animate-in" style={{animationDelay: `${idx * 0.08}s`, display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                <span className="badge badge-cyan">{item.field}</span>
                <span className="badge badge-accent">{item.year || "N/A"}</span>
              </div>

              <h3 style={{fontSize: '1.15rem', marginBottom: '12px', color: 'var(--text-primary)', lineHeight: 1.4}}>{item.title}</h3>
              
              {item.type === 'thesis' ? (
                <div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px'}}>
                  <p><strong>Author:</strong> {item.authors?.join(", ") || "Unknown"}</p>
                  <p><strong>University:</strong> {item.institution}</p>
                </div>
              ) : (
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px', fontStyle: 'italic', lineHeight: 1.5}}>
                  {item.summary
                    ? item.summary.length > 200
                      ? item.summary.substring(0, 200) + "..."
                      : item.summary
                    : "Summary unavailable."}
                </p>
              )}

              <div style={{marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <button
                  className="btn btn-secondary btn-sm  "
                  onClick={() => item.url && window.open(item.url, "_blank")}
                  disabled={!item.url}
                >
                   Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && hasSearched && (
        <div className="empty-state">
          <FiBook />
          <h3>No records found</h3>
          <p>Try a different search term to discover academic resources.</p>
        </div>
      )}

      {/* Data Not Available Modal Popup */}
      {showModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.25s ease',
          }}
          onClick={closeModal}
        >
          <div
            className="modal-content"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-hover)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px',
              maxWidth: '480px',
              width: '90%',
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px var(--accent-glow)',
              animation: 'fadeInUp 0.3s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <FiX size={20} />
            </button>

            <div style={{textAlign: 'center'}}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FiAlertCircle size={32} style={{color: 'var(--warning)'}} />
              </div>

              <h2 style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '12px',
              }}>
                Data Not Available
              </h2>

              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '28px',
              }}>
                {modalMessage}
              </p>

              <button
                className="btn btn-primary btn-lg"
                onClick={closeModal}
                style={{width: '100%', justifyContent: 'center'}}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicResources;
