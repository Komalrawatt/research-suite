import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { searchCrossref, searchOpenAlex, searchCORE, FIELDS_OF_STUDY } from "../../services/paperService";
import { savePaper, getSavedPapers, removeSavedPaper } from "../../services/savedPaperService";
import { addActivity } from "../../services/activityService";
import { useAuth } from "../../context/AuthContext";
import PaperCard from "../../components/PaperCard/PaperCard";
import { toast } from "react-hot-toast";
import { FiSearch, FiFilter, FiLoader, FiBookmark, FiRefreshCw } from "react-icons/fi";
import "./Search.css";

// Must match the sanitization logic in savedPaperService
const sanitizeId = (id) => {
  if (!id) return "";
  return String(id).replace(/https?:\/\//g, "").replace(/\//g, "_").replace(/\./g, "-").substring(0, 200);
};

const SOURCES = [
  { value: "OpenAlex", label: "OpenAlex", desc: "Broad academic coverage" },
  { value: "Crossref", label: "Crossref", desc: "DOI & journal metadata" },
  { value: "CORE", label: "CORE (Institutional)", desc: "Open-access repositories" },
];

const PaperSearch = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [papers, setPapers] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({
    year: "",
    field: "",
  });
  const [source, setSource] = useState("OpenAlex");
  const [resultInfo, setResultInfo] = useState(null);

  const logActivity = useCallback(async (payload) => {
    if (!user) return;
    try {
      await addActivity(user.uid, payload);
    } catch (error) {
      console.error("Activity log failed:", error);
    }
  }, [user]);

  // Fetch saved papers to show bookmark state (match on originalId which maps to search result id)
  useEffect(() => {
    if (user) {
      getSavedPapers(user.uid)
        .then(saved => {
          // Build a set of sanitized IDs for comparison
          const ids = new Set();
          saved.forEach(p => {
            if (p.originalId) ids.add(p.originalId);
            if (p.paperId) ids.add(p.paperId);
          });
          setSavedIds(ids);
        })
        .catch(() => {
          // Firestore may not be set up yet
        });
    }
  }, [user]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setLoading(true);
    setSearched(true);
    setResultInfo(null);

    try {
      let result;
      const yearFilter = filters.year || null;
      const fieldFilter = filters.field || null;

      switch (source) {
        case "Crossref":
          result = await searchCrossref(query, 0, 15, yearFilter, fieldFilter);
          break;
        case "OpenAlex":
          result = await searchOpenAlex(query, 1, 15, yearFilter, fieldFilter);
          break;
        case "CORE":
          result = await searchCORE(query, 15, yearFilter, fieldFilter);
          break;
        default:
          result = await searchOpenAlex(query, 1, 15, yearFilter, fieldFilter);
      }

      setPapers(result.papers);
      setResultInfo({
        total: result.total,
        shown: result.papers.length,
        source,
        query: query.trim(),
        year: yearFilter,
        field: fieldFilter,
      });

      logActivity({
        type: "search",
        title: "Searched papers",
        detail: `${query.trim()} via ${source}${yearFilter ? ` (${yearFilter})` : ""}${fieldFilter ? ` [${fieldFilter}]` : ""}`,
      });

      if (result.papers.length === 0) {
        toast.error("No papers found. Try different keywords or filters.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(`Search failed using ${source}. ${error.message || "Please try another source."}`);
    } finally {
      setLoading(false);
    }
  };

  // Check if a paper is in saved set (using both raw and sanitized IDs)
  const isPaperSaved = (paper) => {
    const rawId = paper.id || paper.paperId;
    const safeId = sanitizeId(rawId);
    return savedIds.has(rawId) || savedIds.has(safeId);
  };

  const handleSave = async (paper) => {
    if (!user) {
      toast.error("Please sign in to save papers");
      navigate("/login");
      return;
    }

    const rawId = paper.id || paper.paperId;
    const safeId = sanitizeId(rawId);
    try {
      if (isPaperSaved(paper)) {
        await removeSavedPaper(user.uid, rawId);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(rawId);
          next.delete(safeId);
          return next;
        });
        toast.success("Removed from saved papers");
        logActivity({
          type: "remove",
          title: "Removed saved paper",
          detail: paper.title || "Untitled paper",
        });
      } else {
        await savePaper(user.uid, paper);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.add(rawId);
          next.add(safeId);
          return next;
        });
        toast.success("Paper saved to your library!");
        logActivity({
          type: "save",
          title: "Saved paper",
          detail: paper.title || "Untitled paper",
        });
      }
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("Failed to save paper. Check your connection.");
    }
  };

  const handleCite = (paper) => {
    navigate("/citations", { state: { paper } });
  };

  const handleReset = () => {
    setFilters({ year: "", field: "" });
    setSource("OpenAlex");
  };

  return (
    <div className="page-wrapper animate-in">
      <div className="section-header">
        <h1 className="section-title">Research Paper Search</h1>
        <p className="section-subtitle">
          Search millions of academic publications with accurate year, domain & source filtering
        </p>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch} className="search-box">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              className="input-field search-input" 
              placeholder="Search by topic, author, DOI or keywords..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <FiLoader className="spin" /> : "Search"}
          </button>
        </form>

        <div className="filter-bar">
          <div className="filter-item">
            <FiFilter /> <span>Filters:</span>
          </div>

          {/* Year Filter */}
          <select 
            className="input-field btn-sm" 
            value={filters.year} 
            onChange={(e) => setFilters({...filters, year: e.target.value})}
          >
            <option value="">Any Year</option>
            {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Domain/Field Filter */}
          <select 
            className="input-field btn-sm" 
            value={filters.field} 
            onChange={(e) => setFilters({...filters, field: e.target.value})}
          >
            <option value="">Any Domain</option>
            {FIELDS_OF_STUDY.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Source Selector */}
          <div className="filter-item" style={{marginLeft: 'auto'}}>
            <span>Source:</span>
          </div>
          <select 
            className="input-field btn-sm" 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
          >
            {SOURCES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleReset}
            title="Reset all filters"
          >
            <FiRefreshCw /> Reset
          </button>
        </div>

        {/* Active filter chips */}
        {(filters.year || filters.field) && (
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '4px 0' }}>
              Active filters:
            </span>
            {filters.year && (
              <span className="badge badge-accent" style={{ cursor: 'pointer' }} onClick={() => setFilters({ ...filters, year: "" })}>
                Year: {filters.year} ✕
              </span>
            )}
            {filters.field && (
              <span className="badge badge-cyan" style={{ cursor: 'pointer' }} onClick={() => setFilters({ ...filters, field: "" })}>
                Domain: {filters.field} ✕
              </span>
            )}
          </div>
        )}
      </div>

      {/* Result info bar */}
      {resultInfo && !loading && papers.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          marginBottom: '24px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(99, 102, 241, 0.06)',
          border: '1px solid rgba(99, 102, 241, 0.12)',
          fontSize: '0.88rem',
          color: 'var(--text-secondary)',
        }}>
          <span>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{resultInfo.shown}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{resultInfo.total.toLocaleString()}</strong>{' '}
            results for "<em>{resultInfo.query}</em>" via <strong>{resultInfo.source}</strong>
            {resultInfo.year && <> &bull; Year: <strong>{resultInfo.year}</strong></>}
            {resultInfo.field && <> &bull; Domain: <strong>{resultInfo.field}</strong></>}
          </span>
          {user && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-light)' }}>
              <FiBookmark size={14} /> Click "Save" to bookmark papers
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching {SOURCES.find(s => s.value === source)?.label || source} database...</p>
        </div>
      ) : papers.length > 0 ? (
        <div className="grid-2">
          {papers.map((paper) => (
            <PaperCard 
              key={paper.id} 
              paper={paper} 
              onSave={handleSave}
              isSaved={isPaperSaved(paper)}
              onCite={handleCite}
            />
          ))}
        </div>
      ) : searched ? (
        <div className="empty-state">
          <FiSearch />
          <h3>No papers found</h3>
          <p>Try different keywords, remove filters, or switch to another source.</p>
        </div>
      ) : (
        <div className="empty-state">
          <FiSearch />
          <h3>Start your literature review</h3>
          <p>Enter keywords above and use year/domain filters for precise results.</p>
          <div style={{ marginTop: '24px', color: 'var(--text-muted)', maxWidth: '600px' }}>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperSearch;
