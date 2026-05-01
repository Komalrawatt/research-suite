import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { generateCitation, CITATION_STYLES } from "../../services/citationService";
import { saveCitation, getSavedCitations, deleteCitation } from "../../services/citationHistoryService";
import { addActivity } from "../../services/activityService";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { FiFileText, FiCopy, FiTrash2, FiPlus, FiBook } from "react-icons/fi";

const CitationTool = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    year: "",
    journal: "",
    doi: "",
    url: "",
  });
  const [selectedStyle, setSelectedStyle] = useState("APA");
  const [generated, setGenerated] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const previewLimit = 4;

  const logActivity = async (payload) => {
    if (!user) return;
    try {
      await addActivity(user.uid, payload);
    } catch (error) {
      console.error("Activity log failed:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, location.pathname]);

  useEffect(() => {
    if (!location.state?.paper) return;
    const p = location.state.paper;
    const initialData = {
      title: p.title || "",
      authors: p.authors ? p.authors.join(", ") : "",
      year: p.year || "",
      journal: p.journal || "",
      doi: p.doi || "",
      url: p.url || "",
    };
    setFormData(initialData);

    const citation = generateCitation({
      ...initialData,
      authors: p.authors || [],
    }, "APA");
    setGenerated(citation);
  }, [location.state]);

  const loadHistory = async () => {
    try {
      const data = await getSavedCitations(user.uid);
      setHistory(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("At least a title is required");
      return;
    }

    const paperData = {
      ...formData,
      authors: formData.authors.split(",").map(a => a.trim()).filter(a => a),
    };

    const citation = generateCitation(paperData, selectedStyle);
    setGenerated(citation);
    logActivity({
      type: "citation",
      title: "Generated citation",
      detail: formData.title || "Untitled paper",
    });
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save citations");
      return;
    }
    
    if (!generated) return;
    setLoading(true);
    const optimisticId = `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const optimisticEntry = {
      id: optimisticId,
      style: selectedStyle,
      formattedCitation: generated,
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [optimisticEntry, ...prev]);
    try {
      const paperData = {
        ...formData,
        authors: formData.authors.split(",").map(a => a.trim()).filter(a => a),
        style: selectedStyle,
        formattedCitation: generated,
      };
      await saveCitation(user.uid, paperData);
      toast.success("Citation saved to your cloud history");
      logActivity({
        type: "citation",
        title: "Saved citation",
        detail: formData.title || "Untitled paper",
      });
      loadHistory();
    } catch (error) {
      setHistory((prev) => prev.filter((item) => item.id !== optimisticId));
      toast.error("Failed to save citation. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const formatCitationTime = (value) => {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (id) => {
    try {
      await deleteCitation(id);
      setHistory(history.filter(h => h.id !== id));
      toast.success("Removed from history");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="page-wrapper animate-in">
      <div className="section-header">
        <h1 className="section-title">Citation Generator</h1>
        <p className="section-subtitle">Automatically format references in APA, MLA, Chicago, or IEEE styles</p>
      </div>

      <div className="grid-2" style={{alignItems: 'start'}}>
        <div className="card">
          <h2 style={{fontSize: '1.25rem', marginBottom: '24px'}}>New Citation</h2>
          <form onSubmit={handleGenerate} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div className="input-group">
              <label>Paper Title *</label>
              <input 
                className="input-field" 
                placeholder="The Impact of AI on Modern Research"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label>Authors (comma separated)</label>
              <input 
                className="input-field" 
                placeholder="John Doe, Jane Smith"
                value={formData.authors}
                onChange={(e) => setFormData({...formData, authors: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label>Journal Name</label>
              <input 
                className="input-field" 
                placeholder="e.g. Nature, IEEE Transactions, or Book Publisher"
                value={formData.journal}
                onChange={(e) => setFormData({...formData, journal: e.target.value})}
              />
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label>Year of Publication</label>
                <input 
                  className="input-field" 
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label>DOI or URL</label>
                <input 
                  className="input-field" 
                  placeholder="10.1038/s41467-024-..."
                  value={formData.doi}
                  onChange={(e) => setFormData({...formData, doi: e.target.value})}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Citation Style</label>
              <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                {CITATION_STYLES.map(style => (
                  <button 
                    key={style}
                    type="button"
                    className={`btn btn-sm ${selectedStyle === style ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedStyle(style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{justifyContent: 'center', marginTop: '8px'}}>
              <FiPlus /> Generate Citation
            </button>
          </form>

          {generated && (
            <div className="animate-in" style={{marginTop: '32px', padding: '20px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--accent)'}}>
              <p style={{fontStyle: 'italic', marginBottom: '16px', lineHeight: '1.6', wordBreak: 'break-all'}} dangerouslySetInnerHTML={{__html: generated}}></p>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="btn btn-primary btn-sm" onClick={() => handleCopy(generated)}>
                  <FiCopy /> Copy
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleSave}>
                  <FiPlus /> Save
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px'}}>
            <h2 style={{fontSize: '1.25rem'}}>Saved Citations</h2>
            {history.length > previewLimit && (
              <Link to="/citations/saved" className="btn btn-secondary btn-sm">
                View All
              </Link>
            )}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {history.length > 0 ? history.slice(0, previewLimit).map((item) => (
              <div key={item.id} className="history-item" style={{padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                    <span className="badge badge-accent">{item.style}</span>
                    <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                      {formatCitationTime(item.createdAt)}
                    </span>
                  </div>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button className="btn-icon" onClick={() => handleCopy(item.formattedCitation)} title="Copy"><FiCopy size={16} /></button>
                    <button className="btn-icon" onClick={() => handleDelete(item.id)} title="Delete"><FiTrash2 size={16} /></button>
                  </div>
                </div>
                <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.5'}}>{item.formattedCitation}</p>
              </div>
            )) : (
              <div style={{textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)'}}>
                <FiBook size={40} style={{opacity: 0.3, marginBottom: '12px'}} />
                <p>No saved citations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitationTool;
