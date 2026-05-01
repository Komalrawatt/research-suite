import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FiSearch, FiBookOpen, FiFileText, FiAward, 
  FiCalendar, FiUploadCloud, FiMenu, FiX, 
  FiLogOut, FiUser, FiBookmark, FiChevronDown 
} from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand" onClick={closeMobile}>
          <span className="brand-text">ResearchSuite</span>
        </Link>

        <div className={`navbar-links ${mobileOpen ? "open" : ""}`}>
          <Link to="/search" className={`nav-link ${location.pathname === "/search" ? "active" : ""}`} onClick={closeMobile}>
            <FiSearch /> <span>Search</span>
          </Link>
          
          <div className="nav-dropdown">
            <span className="nav-link">
              <FiBookOpen /> <span>Explore</span> <FiChevronDown className="chevron" />
            </span>
            <div className="dropdown-content">
              <Link to="/resources" onClick={closeMobile}>Academic Resources</Link>
              <Link to="/preprints" onClick={closeMobile}>Preprint Servers</Link>
              <Link to="/ethics" onClick={closeMobile}>Ethics Guide</Link>
            </div>
          </div>

          <div className="nav-dropdown">
            <span className="nav-link">
              <FiFileText /> <span>Tools</span> <FiChevronDown className="chevron" />
            </span>
            <div className="dropdown-content">
              <Link to="/citations" onClick={closeMobile}>Citation Generator</Link>
              <Link to="/journals" onClick={closeMobile}>Journal Selector</Link>
              <Link to="/conferences" onClick={closeMobile}>Conference Finder</Link>
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/saved" className="action-btn" title="Saved Papers"><FiBookmark /></Link>
              <Link to="/profile" className="action-btn" title="Profile"><FiUser /></Link>
              <button onClick={handleLogout} className="action-btn logout" title="Logout"><FiLogOut /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm login-btn">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm login-btn">Sign Up</Link>
            </>
          )}
          <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
