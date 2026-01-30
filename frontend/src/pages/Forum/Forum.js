import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authFetch } from '../../context/AuthContext';
import './Forum.css';

const API_URL = 'http://localhost:5001/api';

const Forum = () => {
  useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await authFetch(`${API_URL}/categories`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Eroare la încărcarea categoriilor.');
          return;
        }
        setCategories(data.categories || []);
      } catch (e) {
        setError('Eroare de conexiune la server.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Acum câteva minute';
    if (hours < 24) return `Acum ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
    const days = Math.floor(hours / 24);
    return `Acum ${days} ${days === 1 ? 'zi' : 'zile'}`;
  };

  if (loading) {
    return (
      <div className="forum">
        <div className="forum-header">
          <h1>Forum Sims</h1>
          <p>Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forum">
        <div className="forum-header">
          <h1>Forum Sims</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="forum">
      <div className="forum-header">
        <h1>Forum Sims</h1>
        <p>Explorează secțiunile și alătură-te discuțiilor</p>
      </div>

      <div className="categories-list">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/forum/category/${category.id}`}
            className="category-card"
          >
            <div className="category-icon">{category.icon || '📁'}</div>
            <div className="category-content">
              <h2 className="category-name">{category.name}</h2>
              <p className="category-description">{category.description}</p>
              <div className="category-stats">
                <span>{category.topicCount ?? 0} subiecte</span>
                <span>•</span>
                <span>{category.postCount ?? 0} mesaje</span>
              </div>
            </div>
            <div className="category-meta">
              <div className="last-activity">
                Ultima activitate: {formatDate(category.lastActivity)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Forum;
