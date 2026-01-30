import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authFetch } from '../../context/AuthContext';
import './Category.css';

const API_URL = 'http://localhost:5001/api';

const Category = () => {
  const { categoryId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await authFetch(`${API_URL}/categories/${categoryId}/topics`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || 'Eroare la încărcarea subiectelor.');
          return;
        }
        setCategory(data.category);
        setTopics(data.topics || []);
      } catch (e) {
        setError('Eroare de conexiune la server.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Acum câteva minute';
    if (hours < 24) return `Acum ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Acum ${days} ${days === 1 ? 'zi' : 'zile'}`;
    return date.toLocaleDateString('ro-RO');
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      alert('Te rugăm să completezi titlul și conținutul subiectului');
      return;
    }
    setSubmitting(true);
    try {
      const response = await authFetch(`${API_URL}/categories/${categoryId}/topics`, {
        method: 'POST',
        body: JSON.stringify({ title: newTopicTitle.trim(), content: newTopicContent.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Eroare la crearea subiectului.');
        return;
      }
      setNewTopicTitle('');
      setNewTopicContent('');
      setShowNewTopicForm(false);
      navigate(`/forum/topic/${data.topic.id}`);
    } catch (e) {
      alert('Eroare de conexiune.');
    } finally {
      setSubmitting(false);
    }
  };

  const pinnedTopics = topics.filter((t) => t.pinned);
  const normalTopics = topics.filter((t) => !t.pinned);
  const categoryName = category?.name || `Categoria ${categoryId}`;

  if (loading) {
    return (
      <div className="category-page">
        <div className="category-header">
          <Link to="/forum" className="back-link">← Înapoi la forum</Link>
          <h1>Se încarcă...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="category-header">
          <Link to="/forum" className="back-link">← Înapoi la forum</Link>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <Link to="/forum" className="back-link">← Înapoi la forum</Link>
        <div className="category-header-row">
          <h1>{categoryName}</h1>
          {isAuthenticated && (
            <button
              onClick={() => setShowNewTopicForm(!showNewTopicForm)}
              className="btn btn-primary"
            >
              {showNewTopicForm ? 'Anulează' : '+ Subiect nou'}
            </button>
          )}
        </div>
      </div>

      {showNewTopicForm && (
        <div className="new-topic-form-container">
          <form onSubmit={handleCreateTopic} className="new-topic-form">
            <h3>Subiect nou</h3>
            <input
              type="text"
              placeholder="Titlul subiectului"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Conținutul mesajului inițial"
              value={newTopicContent}
              onChange={(e) => setNewTopicContent(e.target.value)}
              rows="6"
              required
            />
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Se creează...' : 'Creează subiect'}
            </button>
          </form>
        </div>
      )}

      <div className="topics-table">
        <div className="topics-header">
          <div className="col-title">Subiect</div>
          <div className="col-author">Autor</div>
          <div className="col-stats">Răspunsuri</div>
          <div className="col-activity">Ultima activitate</div>
        </div>

        {pinnedTopics.length > 0 && (
          <div className="topics-section">
            <div className="section-title">Subiecte fixate</div>
            {pinnedTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/forum/topic/${topic.id}`}
                className="topic-row pinned"
              >
                <div className="col-title">
                  <span className="pin-icon">📌</span>
                  {topic.title}
                </div>
                <div className="col-author">
                  <Link to={`/profile/${topic.author?.id}`} onClick={(e) => e.stopPropagation()}>
                    {topic.author?.nickname || 'Utilizator'}
                  </Link>
                </div>
                <div className="col-stats">
                  <span>{topic.replies ?? 0} răspunsuri</span>
                  <span className="views">{topic.views ?? 0} vizualizări</span>
                </div>
                <div className="col-activity">{formatDate(topic.lastActivity)}</div>
              </Link>
            ))}
          </div>
        )}

        <div className="topics-section">
          {pinnedTopics.length > 0 && <div className="section-title">Subiecte</div>}
          {normalTopics.length === 0 && pinnedTopics.length === 0 ? (
            <div className="no-topics">Nu există subiecte în această categorie încă.</div>
          ) : (
            normalTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/forum/topic/${topic.id}`}
                className="topic-row"
              >
                <div className="col-title">{topic.title}</div>
                <div className="col-author">
                  <Link to={`/profile/${topic.author?.id}`} onClick={(e) => e.stopPropagation()}>
                    {topic.author?.nickname || 'Utilizator'}
                  </Link>
                </div>
                <div className="col-stats">
                  <span>{topic.replies ?? 0} răspunsuri</span>
                  <span className="views">{topic.views ?? 0} vizualizări</span>
                </div>
                <div className="col-activity">{formatDate(topic.lastActivity)}</div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
