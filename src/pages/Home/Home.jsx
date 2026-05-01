import { Link } from "react-router-dom";
import { FiSearch, FiFileText, FiAward, FiCalendar, FiShield, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { isAuthenticated } = useAuth();

  const handleRegisterClick = (event) => {
    if (!isAuthenticated) {
      return;
    }

    event.preventDefault();
    toast.success("You are already logged in.");
  };

  return (
    <div className="home-page animate-in">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            The Ultimate <span className="text-gradient">Research Suite</span> for Scholars
          </h1>
          <p className="hero-subtitle">
            A centralized platform to support your complete research journey — from literature review to final publication.
          </p>
          <div className="hero-actions">
            <Link to="/search" className="btn btn-primary btn-lg">
              Start Researching <FiArrowRight />
            </Link>
            <Link to="/ethics" className="btn btn-secondary btn-lg">
              Ethics Guide
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card main-card">
            <div className="card-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <div className="card-body">
              <div className="skeleton line-long"></div>
              <div className="skeleton line-med"></div>
              <div className="skeleton line-short"></div>
              <div className="visual-stats">
                <div className="stat-circle"></div>
                <div className="stat-bars">
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '40%'}}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="visual-card floating-card-1">
            <FiSearch /> <span>Paper Search</span>
          </div>
          <div className="visual-card floating-card-2">
            <FiAward /> <span>Impact Factor: 24.3</span>
          </div>
        </div>
      </section>

      <section className="features-grid">
        <div className="section-header">
          <h2 className="section-title">Core Research Features</h2>
          <p className="section-subtitle">Everything a researcher needs in one place</p>
        </div>
        
        <div className="grid-3">
          <div className="feature-card card">
            <div className="feature-icon"><FiSearch /></div>
            <h3>Paper Search</h3>
            <p>Access millions of academic papers with advanced filters for year and field of study.</p>
            <Link to="/search" className="feature-link">Explore <FiArrowRight /></Link>
          </div>

          <div className="feature-card card">
            <div className="feature-icon"><FiFileText /></div>
            <h3>Citation Generator</h3>
            <p>Automatically generate properly formatted references in APA, MLA, IEEE, and more styles.</p>
            <Link to="/citations" className="feature-link">Generate <FiArrowRight /></Link>
          </div>

          <div className="feature-card card">
            <div className="feature-icon"><FiAward /></div>
            <h3>Journal Selector</h3>
            <p>Find the most suitable journals for your research based on impact factor and domain.</p>
            <Link to="/journals" className="feature-link">Find Journal <FiArrowRight /></Link>
          </div>

          <div className="feature-card card">
            <div className="feature-icon"><FiCalendar /></div>
            <h3>Conference Finder</h3>
            <p>Stay updated with upcoming academic conferences and submission deadlines.</p>
            <Link to="/conferences" className="feature-link">View List <FiArrowRight /></Link>
          </div>

          <div className="feature-card card">
            <div className="feature-icon"><FiShield /></div>
            <h3>Ethics Guide</h3>
            <p>Learn about plagiarism prevention, research ethics, and responsible academic practices.</p>
            <Link to="/ethics" className="feature-link">Learn More <FiArrowRight /></Link>
          </div>

          <div className="feature-card card">
            <div className="feature-icon"><FiSearch /></div>
            <h3>Thesis Samples</h3>
            <p>Browse approved thesis and dissertation samples to understand academic writing standards.</p>
            <Link to="/search" className="feature-link">Browse <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card">
          <h2>Create your ResearchSuite account</h2>
          <p>Sign up to save papers, manage citations, and access the full research toolkit.</p>
          <Link to="/register" className="btn btn-primary btn-lg" onClick={handleRegisterClick}>Create Account</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
