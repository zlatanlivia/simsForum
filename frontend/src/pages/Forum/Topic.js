import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authFetch } from '../../context/AuthContext';
import './Topic.css';

const API_URL = 'http://localhost:5001/api';

const Topic = () => {
  const { topicId } = useParams();
  const { user, isAuthenticated, isModerator } = useAuth();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTopic = async () => {
    try {
      const response = await authFetch(`${API_URL}/topics/${topicId}`);
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Eroare la încărcarea subiectului.');
        return;
      }
      setTopic(data.topic);
      setPosts(data.posts || []);
    } catch (e) {
      setError('Eroare de conexiune la server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      alert('Te rugăm să scrii un mesaj');
      return;
    }
    setSubmitting(true);
    try {
      const response = await authFetch(`${API_URL}/topics/${topicId}/posts`, {
        method: 'POST',
        body: JSON.stringify({ content: newPostContent.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Eroare la trimiterea mesajului.');
        return;
      }
      setPosts((prev) => [...prev, data.post]);
      setNewPostContent('');
    } catch (e) {
      alert('Eroare de conexiune.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPost = (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPostId(postId);
      setEditContent(post.content);
    }
  };

  const handleSaveEdit = async (postId) => {
    if (!editContent.trim()) {
      alert('Mesajul nu poate fi gol');
      return;
    }
    try {
      const response = await authFetch(`${API_URL}/topics/${topicId}/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editContent.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Eroare la salvarea modificărilor.');
        return;
      }
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, content: data.post.content, editedAt: data.post.editedAt } : p))
      );
      setEditingPostId(null);
      setEditContent('');
    } catch (e) {
      alert('Eroare de conexiune.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Sigur vrei să ștergi acest mesaj?')) return;
    try {
      const response = await authFetch(`${API_URL}/topics/${topicId}/posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Eroare la ștergere.');
        return;
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      alert('Eroare de conexiune.');
    }
  };

  const canEditPost = (post) => {
    return isAuthenticated && (post.author?.id === user?.id || isModerator);
  };

  const canDeletePost = (post) => {
    return isAuthenticated && (post.author?.id === user?.id || isModerator);
  };

  const getRoleBadge = (role) => {
    if (role === 'Admin') return <span className="role-badge admin">Admin</span>;
    if (role === 'Moderator') return <span className="role-badge moderator">Moderator</span>;
    return null;
  };

  if (loading) {
    return (
      <div className="topic-page">
        <div className="topic-header">
          <Link to="/forum" className="back-link">← Înapoi la forum</Link>
          <h1>Se încarcă...</h1>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="topic-page">
        <div className="topic-header">
          <Link to="/forum" className="back-link">← Înapoi la forum</Link>
          <p className="error-message">{error || 'Subiectul nu există.'}</p>
        </div>
      </div>
    );
  }

  const authorName = topic.author?.nickname || topic.author?.username || 'Utilizator';
  const categoryId = topic.category?.id;
  const categoryName = topic.category?.name || 'Forum';

  return (
    <div className="topic-page">
      <div className="topic-header">
        <Link to="/forum" className="back-link">← Înapoi la forum</Link>
        {categoryId && (
          <Link to={`/forum/category/${categoryId}`} className="back-link">
            ← {categoryName}
          </Link>
        )}
        <h1>{topic.title}</h1>
        <div className="topic-meta">
          <span>
            Creat de{' '}
            <Link to={`/profile/${topic.author?.id}`}>{authorName}</Link>
          </span>
          <span>•</span>
          <span>{formatDate(topic.createdAt)}</span>
        </div>
      </div>

      <div className="posts-list">
        {posts.map((post, index) => (
          <div key={post.id} className="post-card">
            <div className="post-sidebar">
              <Link to={`/profile/${post.author?.id}`} className="post-author">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.nickname}
                    className="author-avatar"
                  />
                ) : (
                  <div className="author-avatar-placeholder">
                    {(post.author?.nickname || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="author-info">
                  <div className="author-name">
                    {post.author?.nickname || post.author?.username || 'Utilizator'}
                    {getRoleBadge(post.author?.role)}
                  </div>
                  <div className="author-role">{post.author?.role || 'User'}</div>
                </div>
              </Link>
              <div className="post-number">#{index + 1}</div>
            </div>
            <div className="post-content">
              {editingPostId === post.id ? (
                <div className="edit-form">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="6"
                    className="edit-textarea"
                  />
                  <div className="edit-actions">
                    <button
                      onClick={() => handleSaveEdit(post.id)}
                      className="btn btn-primary"
                    >
                      Salvează
                    </button>
                    <button
                      onClick={() => setEditingPostId(null)}
                      className="btn btn-secondary"
                    >
                      Anulează
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="post-text">{post.content}</div>
                  {post.editedAt && (
                    <div className="post-edited">
                      (Editat la {formatDate(post.editedAt)})
                    </div>
                  )}
                  <div className="post-footer">
                    <div className="post-date">{formatDate(post.createdAt)}</div>
                    <div className="post-actions">
                      {canEditPost(post) && (
                        <button
                          onClick={() => handleEditPost(post.id)}
                          className="action-btn"
                        >
                          Editează
                        </button>
                      )}
                      {canDeletePost(post) && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="action-btn delete"
                        >
                          Șterge
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {isAuthenticated && !topic.closed ? (
        <div className="new-post-form-container">
          <h3>Răspunde la subiect</h3>
          <form onSubmit={handleSubmitPost} className="new-post-form">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Scrie răspunsul tău aici..."
              rows="6"
              required
            />
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Se trimite...' : 'Trimite răspuns'}
            </button>
          </form>
        </div>
      ) : topic.closed ? (
        <div className="login-prompt">
          Acest subiect este închis. Nu se mai pot adăuga răspunsuri.
        </div>
      ) : (
        <div className="login-prompt">
          <Link to="/login" className="btn btn-primary">
            Autentifică-te pentru a răspunde
          </Link>
        </div>
      )}
    </div>
  );
};

export default Topic;
