import { useState } from "react";
import { FiBookmark, FiExternalLink, FiFileText, FiCalendar, FiUsers, FiDatabase, FiCheck, FiLoader } from "react-icons/fi";

const PaperCard = ({ paper, onSave, isSaved, onCite, saveLabel }) => {
  const [saving, setSaving] = useState(false);

  const resolvedLabel = saveLabel || (isSaved ? "Saved" : "Save");
  const resolvedIcon = isSaved ? <FiCheck /> : <FiBookmark />;

  const handleSaveClick = async () => {
    if (!onSave || saving) return;
    setSaving(true);
    try {
      await onSave(paper);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card paper-card animate-in" style={{display: 'flex', flexDirection: 'column'}}>
      <div className="paper-header">
        <div className="paper-meta" style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px'}}>
          {paper.year && (
            <span className="badge badge-accent"><FiCalendar /> {paper.year}</span>
          )}
          {paper.source && (
            <span className="badge badge-cyan"><FiDatabase /> {paper.source}</span>
          )}
          {paper.citationCount > 0 && (
            <span className="badge badge-success">Cited: {paper.citationCount.toLocaleString()}</span>
          )}
        </div>
      </div>

      <h3 className="paper-title" style={{fontSize: '1.1rem', marginBottom: '10px', color: 'var(--text-primary)', lineHeight: 1.4}}>
        {paper.title}
      </h3>

      {paper.authors && paper.authors.length > 0 && (
        <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>
          <FiUsers size={14} />
          {paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 ? ` +${paper.authors.length - 3} more` : ""}
        </p>
      )}

      {paper.abstract && (
        <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5}}>
          {paper.abstract.length > 200 ? paper.abstract.substring(0, 200) + "..." : paper.abstract}
        </p>
      )}

      {paper.journal && (
        <p style={{fontSize: '0.8rem', color: 'var(--accent-light)', marginBottom: '12px'}}>
          <FiFileText style={{verticalAlign: 'middle', marginRight: '4px'}} size={13} />
          {paper.journal}
        </p>
      )}

      {paper.fieldsOfStudy && paper.fieldsOfStudy.length > 0 && (
        <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px'}}>
          {paper.fieldsOfStudy.slice(0, 3).map((f, i) => (
            <span key={i} style={{
              fontSize: '0.72rem',
              padding: '3px 10px',
              borderRadius: '999px',
              background: 'rgba(139, 92, 246, 0.12)',
              color: 'var(--accent-light)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}>{f}</span>
          ))}
        </div>
      )}
      
      <div className="paper-footer" style={{marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px'}}>
        <div className="paper-actions" style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
          {onSave && (
            <button
              className={`btn btn-sm ${isSaved ? 'btn-accent' : 'btn-secondary'}`}
              onClick={handleSaveClick}
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                ...(isSaved ? {
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                } : {})
              }}
            >
              {saving ? <FiLoader className="spin" /> : resolvedIcon} {resolvedLabel}
            </button>
          )}
          {onCite && (
            <button className="btn btn-secondary btn-sm" onClick={() => onCite(paper)}>
              <FiFileText /> Cite
            </button>
          )}
          {paper.url && (
            <a href={paper.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              <FiExternalLink /> View
            </a>
          )}
          {paper.openAccessPdf && paper.openAccessPdf !== paper.url && (
            <a href={paper.openAccessPdf} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{color: '#10b981'}}>
              PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaperCard;
