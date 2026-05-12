import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { safeGetUser } from '../utils/storage';

const Navbar = () => {
  const user = safeGetUser();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isAdmin = user.role === 'admin';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="logo">
            <span className="logo-icon"> </span>
            <span className="logo-text">Signature Numérique</span>
          </Link>
        </div>
        
        <div className="nav-center">
          {!isAdmin && (
            <>
              <Link to="/dashboard" className="nav-link">
                <span className="link-icon">📄</span>
                <span className="link-text">Mes Documents</span>
              </Link>
              <Link to="/workflows" className="nav-link">
                <span className="link-icon">🔄</span>
                <span className="link-text">Mes Workflows</span>
              </Link>
            </>
          )}
          {isAdmin && (
            <>
              <Link to="/admin/stats" className="nav-link admin-link">
                <span className="link-icon"> </span>
                <span className="link-text">Admin</span>
              </Link>
              <Link to="/admin/documents" className="nav-link admin-link">
                <span className="link-icon"> </span>
                <span className="link-text">Mes Documents</span>
              </Link>
              <Link to="/admin/users" className="nav-link admin-link">
                <span className="link-icon"> </span>
                <span className="link-text">Utilisateurs</span>
              </Link>
            </>
          )}
        </div>
        
        <div className="nav-right">
          <div className="user-menu">
            <div className="user-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-dropdown">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                {isAdmin && <span className="admin-badge"> Admin</span>}
              </div>
              <button onClick={logout} className="logout-btn">
                <span className="logout-icon">🚪</span>
                <span className="logout-text">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button 
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" className="mobile-nav-link">
          <span className="link-icon">📄</span>
          Mes Documents
        </Link>
        <Link to="/workflows" className="mobile-nav-link">
          <span className="link-icon">🔄</span>
          Mes Workflows
        </Link>
        {isAdmin && (
          <>
            <Link to="/admin" className="mobile-nav-link admin-link">
              <span className="link-icon"> </span>
              Admin
            </Link>
            <Link to="/admin/users" className="mobile-nav-link admin-link">
              <span className="link-icon">👥</span>
              Utilisateurs
            </Link>
          </>
        )}
        <div className="mobile-user-section">
          <div className="mobile-user-info">
            <span className="user-name">{user.name}</span>
            {isAdmin && <span className="admin-badge"> Admin</span>}
          </div>
          <button onClick={logout} className="mobile-logout-btn">
            <span className="logout-icon">🚪</span>
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
