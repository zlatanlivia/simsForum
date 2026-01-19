import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home">
      {/* Hero Section cu Logo și Imagine */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-left">
            <div className="sims-logo-container">
              <img 
                src="/images/sims-logo.png" 
                alt="The Sims 4 Official Logo" 
                className="sims-logo-image"
                onError={(e) => {
                  // Fallback dacă logo-ul nu există - afișăm text
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'block';
                  }
                }}
              />
              <div className="sims-logo" style={{ display: 'none' }}>
                <span className="sims-logo-text">THE</span>
                <span className="sims-logo-main">SIMS</span>
                <span className="sims-logo-number">4</span>
              </div>
              <p className="logo-tagline">Official Community Forum</p>
            </div>
            
            <h1 className="hero-title">
              Bun venit în comunitatea Sims!
            </h1>
            <p className="hero-subtitle">
              Discută, împărtășește și descoperă împreună
            </p>
            <p className="hero-description">
              Alătură-te fanilor Sims din toată lumea! Participă la discuții despre gameplay, 
              construiește case uimitoare, descoperă trucuri și câștigă achievements în timpul 
              explorării lumii Sims.
            </p>
            
            {!isAuthenticated ? (
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary">
                  <span>Alătură-te acum</span>
                  <span className="btn-icon">🎮</span>
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Autentifică-te
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                <Link to="/forum" className="btn btn-primary">
                  <span>Vezi Forum-ul</span>
                  <span className="btn-icon">💬</span>
                </Link>
                <Link to={`/profile/${user.id}`} className="btn btn-secondary">
                  Profilul meu
                </Link>
              </div>
            )}
          </div>
          
          <div className="hero-right">
            <div className="hero-image-container">
              <div className="hero-image">
                <img 
                  src="/images/sims-screenshot.jpg" 
                  alt="Sims 4 Gameplay - Peisaj din joc cu oraș, grădini și clădiri colorate" 
                  className="sims-screenshot"
                  onError={(e) => {
                    // Fallback dacă imaginea nu există încă
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="image-placeholder" style={{ display: 'none' }}>
                  <span className="image-icon">🏠</span>
                  <p className="image-text">Sims 4 Screenshot</p>
                  <p className="image-hint">
                    Adaugă imaginea în:<br />
                    frontend/public/images/sims-screenshot.jpg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-number">127</div>
          <div className="stat-label">Membri activi</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">89</div>
          <div className="stat-label">Subiecte active</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">543</div>
          <div className="stat-label">Mesaje azi</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">23</div>
          <div className="stat-label">Online acum</div>
        </div>
      </div>

      {/* Game Sections Preview */}
      <div className="game-sections">
        <div className="section-header">
          <h2 className="section-title small-title">Explorează secțiunile forumului</h2>
        </div>
        <div className="sections-preview">
          <Link to="/register" className="section-preview-card">
            <div className="preview-icon">
              <img src="/images/sims-plumbob.png" alt="Sims icon" className="preview-image" />
            </div>
            <h3>Sims 4 - Discuții generale</h3>
            <p className="section-preview-text">24 subiecte • 156 mesaje</p>
          </Link>
          <Link to="/register" className="section-preview-card">
            <div className="preview-icon">
              <img src="/images/sims-plumbob.png" alt="Sims icon" className="preview-image" />
            </div>
            <h3>Building & Design</h3>
            <p className="section-preview-text">32 subiecte • 201 mesaje</p>
          </Link>
          <Link to="/register" className="section-preview-card">
            <div className="preview-icon">
              <img src="/images/sims-plumbob.png" alt="Sims icon" className="preview-image" />
            </div>
            <h3>Mods și Custom Content</h3>
            <p className="section-preview-text">42 subiecte • 289 mesaje</p>
          </Link>
          <Link to="/register" className="section-preview-card">
            <div className="preview-icon">
              <img src="/images/sims-plumbob.png" alt="Sims icon" className="preview-image" />
            </div>
            <h3>Galerie creații & Screenshots</h3>
            <p className="section-preview-text">15 subiecte • 98 mesaje</p>
          </Link>
          <Link to="/register" className="section-preview-card">
            <div className="preview-icon">
              <img src="/images/sims-plumbob.png" alt="Sims icon" className="preview-image" />
            </div>
            <h3>Întrebări & Ajutor tehnic</h3>
            <p className="section-preview-text">18 subiecte • 120 mesaje</p>
          </Link>
          <Link to="/register" className="section-preview-card">
            <div className="preview-icon">
              <img src="/images/sims-plumbob.png" alt="Sims icon" className="preview-image" />
            </div>
            <h3>Off-topic & Comunitate</h3>
            <p className="section-preview-text">10 subiecte • 76 mesaje</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;

