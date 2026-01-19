import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Category.css';

// Date simulate pentru MVP
const mockTopics = {
  1: [
    {
      id: 1,
      title: 'Noua actualizare Sims 4 - ce părere aveți?',
      author: { id: 1, nickname: 'SimsFan2024', avatar: null },
      replies: 23,
      views: 145,
      lastActivity: '2024-01-15T10:30:00Z',
      pinned: true
    },
    {
      id: 2,
      title: 'Cea mai bună casă pe care ați construit-o vreodată?',
      author: { id: 2, nickname: 'BuilderPro', avatar: null },
      replies: 45,
      views: 289,
      lastActivity: '2024-01-15T09:15:00Z',
      pinned: false
    },
    {
      id: 3,
      title: 'Help! Simulul meu nu vrea să mănânce',
      author: { id: 3, nickname: 'NewSimmer', avatar: null },
      replies: 8,
      views: 67,
      lastActivity: '2024-01-14T20:45:00Z',
      pinned: false
    }
  ]
};

const categoryNames = {
  1: 'Sims 4 - Discuții generale',
  2: 'Sims 4 - DLC și Pachete',
  3: 'Sims 4 - Building & Design',
  4: 'Sims 4 - Gameplay & Challenges',
  5: 'Moduri și Custom Content',
  6: 'Sims clasic (Sims 1, 2, 3)'
};

const Category = () => {
  const { categoryId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState(mockTopics[categoryId] || []);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);

  const formatDate = (dateString) => {
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

  const handleCreateTopic = (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      alert('Te rugăm să completezi titlul și conținutul subiectului');
      return;
    }

    const newTopic = {
      id: Date.now(),
      title: newTopicTitle,
      author: { id: 1, nickname: 'Utilizator', avatar: null },
      replies: 0,
      views: 0,
      lastActivity: new Date().toISOString(),
      pinned: false
    };

    setTopics([newTopic, ...topics]);
    setNewTopicTitle('');
    setNewTopicContent('');
    setShowNewTopicForm(false);
    navigate(`/forum/topic/${newTopic.id}`);
  };

  const pinnedTopics = topics.filter(t => t.pinned);
  const normalTopics = topics.filter(t => !t.pinned);

  return (
    <div className="category-page">
      <div className="category-header">
        <Link to="/forum" className="back-link">← Înapoi la forum</Link>
        <h1>{categoryNames[categoryId] || `Categoria ${categoryId}`}</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowNewTopicForm(!showNewTopicForm)}
            className="btn btn-primary"
          >
            {showNewTopicForm ? 'Anulează' : '+ Subiect nou'}
          </button>
        )}
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
            <button type="submit" className="btn btn-primary">
              Creează subiect
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
            <div className="section-title">📌 Subiecte fixate</div>
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
                  <Link to={`/profile/${topic.author.id}`} onClick={(e) => e.stopPropagation()}>
                    {topic.author.nickname}
                  </Link>
                </div>
                <div className="col-stats">
                  <span>{topic.replies} răspunsuri</span>
                  <span className="views">{topic.views} vizualizări</span>
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
                  <Link to={`/profile/${topic.author.id}`} onClick={(e) => e.stopPropagation()}>
                    {topic.author.nickname}
                  </Link>
                </div>
                <div className="col-stats">
                  <span>{topic.replies} răspunsuri</span>
                  <span className="views">{topic.views} vizualizări</span>
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

