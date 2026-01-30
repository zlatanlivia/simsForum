import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authFetch } from '../../context/AuthContext';
import './Home.css';

const API_URL = 'http://localhost:5001/api';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Categorii
      try {
        const catRes = await authFetch(`${API_URL}/categories`);
        const catData = await catRes.json();
        if (catRes.ok && catData.success && Array.isArray(catData.categories)) {
          setCategories(catData.categories);
        }
      } catch (e) {
        // Fără mesaj de eroare la categorii
      }

      // Statistici (membri, subiecte, mesaje) – se actualizează la fiecare încărcare
      try {
        const statsRes = await fetch(`${API_URL}/stats`);
        const statsData = await statsRes.json();
        if (statsRes.ok && statsData.success && statsData.stats) {
          setStats(statsData.stats);
        }
      } catch (e) {
        // Ignorăm eroarea la stats
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayName = user?.nickname || user?.username || (user?.email ? user.email.split('@')[0] : '');

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

            <h1 className="hero-title">Bun venit în comunitatea Sims!</h1>
            <p className="hero-subtitle">Discută, împărtășește și descoperă împreună</p>
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

      {/* Quick Stats - date reale din API */}
      <div className="quick-stats">
        <div className="stat-item">
          <div className="stat-number">{loading ? '—' : (stats?.totalUsers ?? 0)}</div>
          <div className="stat-label">Membri înregistrați</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{loading ? '—' : (stats?.totalTopics ?? 0)}</div>
          <div className="stat-label">Subiecte</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{loading ? '—' : (stats?.totalPosts ?? 0)}</div>
          <div className="stat-label">Mesaje total</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{loading ? '—' : (stats?.postsToday ?? 0)}</div>
          <div className="stat-label">Mesaje azi</div>
        </div>
      </div>

      {/* Secțiuni forum - categorii reale din API */}
      <div className="game-sections">
        <div className="section-header">
          <h2 className="section-title small-title">Explorează secțiunile forumului</h2>
        </div>
        <div className="sections-preview">
          {loading ? (
            <p className="section-preview-text">Se încarcă secțiunile...</p>
          ) : categories.length === 0 ? (
            <p className="section-preview-text">Nicio categorie încă.</p>
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                to={`/forum/category/${category.id}`}
                className="section-preview-card"
              >
                <div className="preview-icon">
                  <img src="/images/sims-plumbob.png" alt="Sims icon" className="preview-image" />
                </div>
                <h3>{category.name}</h3>
                <p className="section-preview-text">
                  {category.topicCount ?? 0} subiecte • {category.postCount ?? 0} mesaje
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
