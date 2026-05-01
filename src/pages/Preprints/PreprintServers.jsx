import { useEffect, useState } from "react";
import { API_CONFIG } from "../../config/apiConfig";
import { searchArXiv } from "../../services/paperService";
import { savePaper, getSavedPapers, removeSavedPaper } from "../../services/savedPaperService";
import { addActivity } from "../../services/activityService";
import { useAuth } from "../../context/AuthContext";
import PaperCard from "../../components/PaperCard/PaperCard";
import { FiUploadCloud, FiExternalLink, FiSearch, FiLoader, FiAlertCircle, FiX, FiGlobe } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PreprintServers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [servers, setServers] = useState([]);
  const [serversLoading, setServersLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");

  const suggestedQueries = [
    "Quantum computing",
    "Graph neural networks",
    "COVID-19",
    "Renewable energy",
    "Computer vision",
    "Climate change",
  ];

  // Load saved paper IDs for bookmark state
  useEffect(() => {
    if (user) {
      getSavedPapers(user.uid)
        .then((saved) => setSavedIds(new Set(saved.map((p) => p.paperId || p.id))))
        .catch(() => {});
    }
  }, [user]);

  // Load preprint servers: try OSF API, fallback to static list from apiConfig
  useEffect(() => {
    const majorProviderIds = new Set([
      "osf", "psyarxiv", "socarxiv", "edarxiv", "engrxiv",
      "eartharxiv", "lawarxiv", "marxiv", "paleorxiv", "arabixiv",
    ]);

    const loadProviders = async () => {
      setServersLoading(true);
      try {
        const url = `${API_CONFIG.OSF.BASE_URL}${API_CONFIG.OSF.PREPRINT_PROVIDERS}?page[size]=100`;

        let data = null;

        const fetchWithTimeout = async (targetUrl, ms = 6000) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), ms);
          try {
            const res = await fetch(targetUrl, { signal: controller.signal });
            clearTimeout(timer);
            return res;
          } catch (e) {
            clearTimeout(timer);
            throw e;
          }
        };

        // Try direct first
        try {
          const directResponse = await fetchWithTimeout(url);
          if (directResponse.ok) {
            data = await directResponse.json();
          }
        } catch {
          // Direct failed, try proxy
        }

        if (!data) {
          try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const proxyResponse = await fetchWithTimeout(proxyUrl);
            if (proxyResponse.ok) {
              data = await proxyResponse.json();
            }
          } catch {
            // Proxy also failed
          }
        }

        if (data && data.data && data.data.length > 0) {
          const providers = (data.data || [])
            .filter((provider) => majorProviderIds.has(provider.id))
            .map((provider) => normalizeProvider(provider))
            .filter((provider) => provider.name);
          setServers(providers.length > 0 ? providers : getStaticServers());
        } else {
          setServers(getStaticServers());
        }
      } catch (error) {
        console.error("Failed to load OSF providers:", error);
        setServers(getStaticServers());
      } finally {
        setServersLoading(false);
      }
    };

    loadProviders();
  }, []);

  const getStaticServers = () => {
    return (API_CONFIG.PREPRINT_SERVERS || []).map((s) => ({
      name: s.name,
      url: s.url,
      field: s.field,
      description: s.description,
    }));
  };

  const normalizeProvider = (provider) => {
    const attrs = provider.attributes || {};
    const rawSubjects = Array.isArray(attrs.subjects) ? attrs.subjects : [];
    const subject = rawSubjects[0]?.text || rawSubjects[0] || "Multidisciplinary";
    const url = attrs.domain || attrs.share_url || provider.links?.html || "";
    return {
      name: attrs.name || provider.id || "",
      url,
      field: subject,
      description: attrs.description
        ? attrs.description.replace(/<[^>]+>/g, "").substring(0, 200)
        : "Preprint server hosted on OSF Preprints.",
    };
  };

  const runSearch = async (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Enter a topic to search preprints");
      return;
    }

    setLoading(true);
    setSearchedQuery(trimmed);
    try {
      const data = await searchArXiv(trimmed, 12);
      setResults(data.papers || []);
      if ((data.papers || []).length === 0) {
        setModalMessage(
          `No preprints found for "${trimmed}". This data is not available at the moment. Try a different search term or check back later.`
        );
        setShowModal(true);
      }
    } catch (error) {
      console.error("Preprint search error:", error);
      setResults([]);
      setModalMessage(
        "Failed to fetch preprints from ArXiv. The service may be temporarily unavailable. Please try again later."
      );
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await runSearch(query);
  };

  const logActivity = async (payload) => {
    if (!user) return;
    try {
      await addActivity(user.uid, payload);
    } catch (error) {
      console.error("Activity log failed:", error);
    }
  };

  const handleSave = async (paper) => {
    if (!user) {
      toast.error("Please sign in to save papers");
      return;
    }
    const paperId = paper.id;
    try {
      if (savedIds.has(paperId)) {
        await removeSavedPaper(user.uid, paperId);
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(paperId);
          return next;
        });
        toast.success("Removed from bookmarks");
        logActivity({ type: "remove", title: "Removed preprint", detail: paper.title });
      } else {
        await savePaper(user.uid, paper);
        setSavedIds((prev) => new Set(prev).add(paperId));
        toast.success("Preprint bookmarked!");
        logActivity({ type: "save", title: "Saved preprint", detail: paper.title });
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const handleCite = (paper) => {
    navigate("/citations", { state: { paper } });
  };

  return (
    <div className="page-wrapper container animate-in">
      <div className="section-header">
        <h1 className="section-title">Preprint Search & Servers</h1>
        <p className="section-subtitle">Search the latest preprints from ArXiv and discover specialized research servers</p>
      </div>

      {/* Search Section */}
      <div className="card" style={{marginBottom: '40px'}}>
        <form onSubmit={handleSearch} className="search-bar">
          <div style={{flex: 1, position: 'relative'}}>
            <FiSearch style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Try: Quantum computing, COVID-19, graph neural networks..."
              style={{paddingLeft: '44px', width: '100%'}}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><FiLoader className="spin" /> Searching...</> : "Search Preprints"}
          </button>
        </form>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px'}}>
          {suggestedQueries.map((item) => (
            <button
              key={item}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setQuery(item);
                runSearch(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Querying ArXiv API...</p>
        </div>
      ) : results.length > 0 ? (
        <div style={{marginBottom: '60px'}}>
          <h2 style={{fontSize: '1.25rem', marginBottom: '24px', color: 'var(--text-primary)'}}>
            Latest Preprints for "{searchedQuery}"
          </h2>
          <div className="grid-2">
            {results.map((paper) => (
              <PaperCard 
                key={paper.id} 
                paper={paper} 
                onSave={handleSave}
                isSaved={savedIds.has(paper.id)}
                onCite={handleCite}
              />
            ))}
          </div>
        </div>
      ) : null}

      {/* Preprint Servers Section */}
      <div className="section-header" style={{marginTop: '60px'}}>
        <h2 className="section-title" style={{fontSize: '1.5rem'}}>Specialized Preprint Servers</h2>
        <p className="section-subtitle">Browse dedicated platforms for specific research fields</p>
      </div>

      {serversLoading ? (
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Loading preprint servers...</p>
        </div>
      ) : servers.length > 0 ? (
        <div className="grid-2">
          {servers.map((server, index) => (
            <div key={server.name} className="card animate-in" style={{animationDelay: `${index * 0.08}s`, display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                <h3 style={{fontSize: '1.3rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FiGlobe color="var(--accent-light)" /> {server.name}
                </h3>
                <span className="badge badge-accent">{server.field}</span>
              </div>
              
              <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6', flex: 1}}>
                {server.description}
              </p>

              <div style={{marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600'}}>
                </div>
                <a href={server.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                  Visit {server.name} <FiExternalLink />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FiGlobe />
          <h3>No servers loaded</h3>
          <p>Could not load preprint server data.</p>
        </div>
      )}

      {/* Data Not Available Modal */}
      {showModal && (
        <div
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
          onClick={() => setShowModal(false)}
        >
          <div
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
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: '14px', right: '14px',
                background: 'none', border: 'none', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '4px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <FiX size={20} />
            </button>
            <div style={{textAlign: 'center'}}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <FiAlertCircle size={32} style={{color: 'var(--warning)'}} />
              </div>
              <h2 style={{fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px'}}>
                Data Not Available
              </h2>
              <p style={{color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '28px'}}>
                {modalMessage}
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => setShowModal(false)} style={{width: '100%', justifyContent: 'center'}}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreprintServers;
