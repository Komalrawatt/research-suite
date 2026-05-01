import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiBook, FiCopy, FiTrash2, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { deleteCitation, getSavedCitations } from "../../services/citationHistoryService";

const SavedCitations = () => {
  const { user } = useAuth();
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadCitations();
  }, [user]);

  const loadCitations = async () => {
    setLoading(true);
    try {
      const data = await getSavedCitations(user.uid);
      setCitations(data);
    } catch (error) {
      toast.error("Failed to load saved citations");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = async (id) => {
    try {
      await deleteCitation(id);
      setCitations((prev) => prev.filter((c) => c.id !== id));
      toast.success("Removed from saved citations");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (!user) return null;

  const formatCitationTime = (value) => {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="page-wrapper animate-in">
      <div className="section-header">
        <h1 className="section-title">Saved Citations</h1>
        <p className="section-subtitle">All your saved citations in one place</p>
      </div>

      <div style={{display: "flex", justifyContent: "flex-start", marginBottom: "24px"}}>
        <Link to="/citations" className="btn btn-secondary btn-sm">
          <FiArrowLeft /> Back to Generator
        </Link>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : citations.length > 0 ? (
        <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          {citations.map((item) => (
            <div key={item.id} className="history-item" style={{padding: "16px", background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)"}}>
              <div style={{display: "flex", justifyContent: "space-between", marginBottom: "8px"}}>
                <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span className="badge badge-accent">{item.style}</span>
                  <span style={{fontSize: "0.75rem", color: "var(--text-muted)"}}>
                    {formatCitationTime(item.createdAt)}
                  </span>
                </div>
                <div style={{display: "flex", gap: "8px"}}>
                  <button className="btn-icon" onClick={() => handleCopy(item.formattedCitation)} title="Copy">
                    <FiCopy size={16} />
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(item.id)} title="Delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <p style={{fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: "1.6"}}>
                {item.formattedCitation}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FiBook />
          <h3>No saved citations yet</h3>
          <p>Generate a citation and save it to build your library.</p>
          <Link to="/citations" className="btn btn-primary" style={{marginTop: "20px"}}>
            Create Citation
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedCitations;
