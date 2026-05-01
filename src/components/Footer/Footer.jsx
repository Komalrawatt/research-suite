import { Link } from "react-router-dom";
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from "react-icons/fi";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand-section">
          <Link to="/" className="footer-brand">
           
            <span className="brand-text">ResearchSuite</span>
          </Link>
          <p className="footer-tagline">
            Empowering PhD scholars and researchers with a unified platform for academic excellence.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="#" aria-label="GitHub"><FiGithub /></a>
            <a href="#" aria-label="Email"><FiMail /></a>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>Research</h4>
            <Link to="/search">Paper Search</Link>
            <Link to="/resources">Academic Resources</Link>
            <Link to="/preprints">Preprint Servers</Link>
          </div>
          <div className="footer-column">
            <h4>Tools</h4>
            <Link to="/citations">Citation Generator</Link>
            <Link to="/journals">Journal Selector</Link>
            <Link to="/conferences">Conference Finder</Link>
          </div>
          <div className="footer-column">
            <h4>Support</h4>
            <Link to="/ethics">Ethics Guide</Link>
            <Link to="/profile">My Account</Link>
            <Link to="/saved">Saved Papers</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} ResearchSuite. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
