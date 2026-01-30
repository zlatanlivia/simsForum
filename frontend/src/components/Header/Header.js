import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.username || user?.nickname || (user?.email ? user.email.split('@')[0] : 'utilizator');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">SimsForum</span>
        </Link>
        
        <nav className="nav">
          <Link to="/" className="nav-link">Acasă</Link>
          <Link to="/forum" className="nav-link">Forum</Link>
          
          {isAuthenticated ? (
            <>
              <div className="user-menu">
                {isAdmin && (
                  <Link to="/admin" className="nav-link">Admin</Link>
                )}
                <Link to={`/profile/${user.id}`} className="user-greeting">Bună, {displayName}!</Link>
                <button onClick={handleLogout} className="logout-btn">
                  Ieșire
                </button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Autentificare</Link>
              <Link to="/register" className="nav-link register-btn">
                Înregistrare
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

