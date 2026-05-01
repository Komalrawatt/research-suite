import { useState } from "react";
import { findJournals, getDomains, searchJournalsCrossref } from "../../services/journalService";
import { FiSearch, FiAward, FiInfo, FiExternalLink, FiClock, FiGlobe } from "react-icons/fi";
import { toast } from "react-hot-toast";

const JournalSelector = () => {
  const [inputText, setInputText] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [results, setResults] = useState([]);
  const [apiResults, setApiResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const domains = getDomains();

  const handleFind = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedDomain) {
      toast.error("Please enter keywords or select a domain");
      return;
    }

    setLoading(true);
    try {
      // 1. Get matches from local curated database
      const matches = findJournals(inputText, selectedDomain);
      setResults(matches);

      // 2. Search real-time via Crossref API (Free)
      const searchQuery = inputText || selectedDomain;
      const liveMatches = await searchJournalsCrossref(searchQuery);
      setApiResults(liveMatches);

      if (matches.length === 0 && liveMatches.length === 0) {
        toast.error("No matches found. Try different keywords.");
      }
    } catch (error) {
      toast.error("Error fetching live data. Showing local recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper animate-in">
      <div className="section-header">
        <h1 className="section-title">Journal Selector</h1>
        <p className="section-subtitle">Find the perfect home for your research based on impact factor and scope matching</p>
      </div>

      <div className="card" style={{marginBottom: '40px'}}>
        <form onSubmit={handleFind} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          <div className="input-group">
            <label>Paper Title or Abstract Keywords</label>
            <textarea 
              className="input-field" 
              rows="4" 
              placeholder="machine learning, clinical trials, renewable energy..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            ></textarea>
          </div>

          <div className="grid-2" style={{alignItems: 'flex-end'}}>
            <div className="input-group">
              <label>Research Domain</label>
              <select 
                className="input-field" 
                value={selectedDomain} 
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                <option value="">Select Domain (Optional)</option>
                {domains.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{justifyContent: 'center'}}>
              {loading ? "Analyzing..." : <><FiSearch /> Match Journals</>}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <>
          {results.length > 0 && (
            <div className="results-section" style={{marginBottom: '60px'}}>
              <div className="section-header" style={{marginBottom: '24px'}}>
                <h2 className="section-title" style={{fontSize: '1.5rem'}}>Curated Recommendations</h2>
                <p className="section-subtitle">High-impact journals from our verified database</p>
              </div>

              <div className="grid-2">
                {results.map((journal, index) => (
                  <div key={index} className="card journal-card animate-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                      <span className="badge badge-accent">Score: {journal.score}</span>
                      <span className="badge badge-success">IF: {journal.impactFactor}</span>
                    </div>
                    
                    <h3 style={{fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)'}}>{journal.name}</h3>
                    <p style={{fontSize: '0.9rem', color: 'var(--accent-light)', marginBottom: '16px'}}>{journal.publisher}</p>
                    
                    <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <FiAward /> <span><strong>Domain:</strong> {journal.domain}</span>
                      </div>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <FiClock /> <span><strong>Avg. Review:</strong> {journal.reviewTime}</span>
                      </div>
                    </div>

                    <div style={{marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end'}}>
                      <a href={journal.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                        Visit Website <FiExternalLink />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {apiResults.length > 0 && (
            <div className="results-section">
              <div className="section-header" style={{marginBottom: '24px'}}>
                <h2 className="section-title" style={{fontSize: '1.5rem'}}>Live Results (via Crossref)</h2>
                <p className="section-subtitle">Real-time journal discovery from the global academic database</p>
              </div>

              <div className="grid-3">
                {apiResults.map((journal, index) => (
                  <div key={index} className="card journal-card animate-in" style={{animationDelay: `${index * 0.05}s`}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
                      <span className="badge badge-cyan">ISSN: {journal.issn}</span>
                    </div>
                    
                    <h3 style={{fontSize: '1.05rem', marginBottom: '8px', color: 'var(--text-primary)'}}>{journal.name}</h3>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px'}}>{journal.publisher}</p>
                    
                    {journal.subjects && journal.subjects.length > 0 && (
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                        {journal.subjects.slice(0, 3).map(s => <span key={s} className="badge" style={{fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)'}}>{s}</span>)}
                      </div>
                    )}

                    <div style={{marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end'}}>
                      {journal.website && (
                        <a href={journal.website} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                          <FiGlobe />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {results.length === 0 && apiResults.length === 0 && !loading && (
        <div className="empty-state">
          <FiAward />
          <h3>Find your target journal</h3>
          <p>Enter your research keywords above to see recommendations.</p>
        </div>
      )}
    </div>
  );
};

export default JournalSelector;
