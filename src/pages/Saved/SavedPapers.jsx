import { useState, useEffect } from "react";
import { getSavedPapers, removeSavedPaper } from "../../services/savedPaperService";
import { useAuth } from "../../context/AuthContext";
import PaperCard from "../../components/PaperCard/PaperCard";
import { toast } from "react-hot-toast";
import { FiBookmark, FiSearch, FiTrash2 } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const SavedPapers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterField, setFilterField] = useState("");
  const [filterSource, setFilterSource] = useState("");

  useEffect(() => {
    if (user) {
      loadPapers();
    }
  }, [user]);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const data = await getSavedPapers(user.uid);
      setPapers(data);
    } catch (error) {
      console.error("Load error:", error);
      toast.error("Failed to load saved papers");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (paper) => {
    const paperId = paper.paperId || paper.id;
    try {
      await removeSavedPaper(user.uid, paperId);
      setPapers(prev => prev.filter(p => (p.paperId || p.id) !== paperId));
      toast.success("Paper removed from library");
    } catch (error) {
      toast.error("Failed to remove paper");
    }
  };

  const handleCite = (paper) => {
    navigate("/citations", { state: { paper } });
  };

  // Gather unique sources and fields from saved papers
  const allSources = [...new Set(papers.map(p => p.source).filter(Boolean))];
  const allFields = [...new Set(papers.flatMap(p => p.fieldsOfStudy || []).filter(Boolean))];

  // Apply local filters
  let filtered = papers;
  if (filterSource) {
    filtered = filtered.filter(p => p.source === filterSource);
  }
  if (filterField) {
    filtered = filtered.filter(p =>
      (p.fieldsOfStudy || []).some(f => f.toLowerCase().includes(filterField.toLowerCase()))
    );
  }

  return (
    <div className="page-wrapper animate-in">
      <div className="section-header">
        <h1 className="section-title">Saved Papers</h1>
        <p className="section-subtitle">
          Your personal library of curated research materials — persisted across sessions
        </p>
      </div>

      {/* Stats bar */}
      {!loading && papers.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          marginBottom: '24px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.06)',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{papers.length}</strong> paper{papers.length !== 1 ? 's' : ''} saved
            {filtered.length !== papers.length && (
              <> — showing <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> after filters</>
            )}
          </span>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {allSources.length > 1 && (
              <select
                className="input-field btn-sm"
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
              >
                <option value="">All Sources</option>
                {allSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
            {allFields.length > 1 && (
              <select
                className="input-field btn-sm"
                value={filterField}
                onChange={(e) => setFilterField(e.target.value)}
              >
                <option value="">All Fields</option>
                {allFields.slice(0, 20).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-state" style={{ textAlign: 'center', padding: '60px' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Loading your library...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid-2">
          {filtered.map((paper) => (
            <PaperCard 
              key={paper.id || paper.paperId} 
              paper={paper} 
              onSave={() => handleRemove(paper)}
              isSaved={true}
              saveLabel="Remove"
              onCite={() => handleCite(paper)}
            />
          ))}
        </div>
      ) : papers.length > 0 && filtered.length === 0 ? (
        <div className="empty-state">
          <FiSearch />
          <h3>No papers match your filters</h3>
          <p>Try adjusting the source or field filters above.</p>
          <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => { setFilterSource(""); setFilterField(""); }}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="empty-state">
          <FiBookmark />
          <h3>Your library is empty</h3>
          <p>Search for papers and click the <strong>"Save"</strong> button to build your personal library.</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Saved papers are stored in Firestore and persist across all your sessions.
          </p>
          <Link to="/search" className="btn btn-primary" style={{marginTop: '20px'}}>
            <FiSearch /> Browse Papers
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedPapers;
