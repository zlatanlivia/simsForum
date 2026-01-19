import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Topic.css';

// Date simulate pentru MVP
const mockTopic = {
  id: 1,
  title: 'Noua actualizare Sims 4 - ce părere aveți?',
  category: { id: 1, name: 'Sims 4 - Discuții generale' },
  author: { id: 1, nickname: 'SimsFan2024', avatar: null, role: 'User' },
  createdAt: '2024-01-10T14:00:00Z',
  posts: [
    {
      id: 1,
      content: 'Am descărcat actualizarea ieri și am observat câteva bug-uri. De exemplu, Simulii mei uneori nu mai răspund la comenzile date. Are cineva aceeași problemă?',
      author: { id: 1, nickname: 'SimsFan2024', avatar: null, role: 'User' },
      createdAt: '2024-01-10T14:00:00Z',
      editedAt: null
    },
    {
      id: 2,
      content: 'Eu am observat că performanța s-a îmbunătățit semnificativ pe PC-ul meu. Mai puține lag-uri și încărcare mai rapidă. Poate ar trebui să încerci să resetezi cache-ul jocului?',
      author: { id: 2, nickname: 'BuilderPro', avatar: null, role: 'Moderator' },
      createdAt: '2024-01-10T15:30:00Z',
      editedAt: null
    },
    {
      id: 3,
      content: 'Multumesc pentru sfat! Voi încerca asta mai târziu.',
      author: { id: 1, nickname: 'SimsFan2024', avatar: null, role: 'User' },
      createdAt: '2024-01-10T16:00:00Z',
      editedAt: null
    }
  ]
};

const Topic = () => {
  const { topicId } = useParams();
  const { user, isAuthenticated, isModerator } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(mockTopic);
  const [newPostContent, setNewPostContent] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      alert('Te rugăm să scrii un mesaj');
      return;
    }

    const newPost = {
      id: Date.now(),
      content: newPostContent,
      author: user,
      createdAt: new Date().toISOString(),
      editedAt: null
    };

    setTopic({
      ...topic,
      posts: [...topic.posts, newPost]
    });
    setNewPostContent('');
  };

  const handleEditPost = (postId) => {
    const post = topic.posts.find(p => p.id === postId);
    if (post) {
      setEditingPostId(postId);
      setEditContent(post.content);
    }
  };

  const handleSaveEdit = (postId) => {
    if (!editContent.trim()) {
      alert('Mesajul nu poate fi gol');
      return;
    }

    setTopic({
      ...topic,
      posts: topic.posts.map(p =>
        p.id === postId
          ? { ...p, content: editContent, editedAt: new Date().toISOString() }
          : p
      )
    });
    setEditingPostId(null);
    setEditContent('');
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Sigur vrei să ștergi acest mesaj?')) {
      setTopic({
        ...topic,
        posts: topic.posts.filter(p => p.id !== postId)
      });
    }
  };

  const canEditPost = (post) => {
    return isAuthenticated && (
      post.author.id === user?.id || isModerator
    );
  };

  const canDeletePost = (post) => {
    return isAuthenticated && (
      post.author.id === user?.id || isModerator
    );
  };

  const getRoleBadge = (role) => {
    if (role === 'Admin') return <span className="role-badge admin">Admin</span>;
    if (role === 'Moderator') return <span className="role-badge moderator">Moderator</span>;
    return null;
  };

  return (
    <div className="topic-page">
      <div className="topic-header">
        <Link to="/forum" className="back-link">← Înapoi la forum</Link>
        <Link to={`/forum/category/${topic.category.id}`} className="back-link">
          ← {topic.category.name}
        </Link>
        <h1>{topic.title}</h1>
        <div className="topic-meta">
          <span>
            Creat de <Link to={`/profile/${topic.author.id}`}>{topic.author.nickname}</Link>
          </span>
          <span>•</span>
          <span>{formatDate(topic.createdAt)}</span>
        </div>
      </div>

      <div className="posts-list">
        {topic.posts.map((post, index) => (
          <div key={post.id} className="post-card">
            <div className="post-sidebar">
              <Link to={`/profile/${post.author.id}`} className="post-author">
                {post.author.avatar ? (
                  <img src={post.author.avatar} alt={post.author.nickname} className="author-avatar" />
                ) : (
                  <div className="author-avatar-placeholder">
                    {post.author.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="author-info">
                  <div className="author-name">
                    {post.author.nickname}
                    {getRoleBadge(post.author.role)}
                  </div>
                  <div className="author-role">{post.author.role}</div>
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

      {isAuthenticated ? (
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
            <button type="submit" className="btn btn-primary">
              Trimite răspuns
            </button>
          </form>
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

