import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Forum.css';

// Date simulate pentru MVP
const mockCategories = [
  {
    id: 1,
    name: 'Sims 4 - Discuții generale',
    description: 'Discuții generale despre Sims 4',
    icon: '🏠',
    topicCount: 24,
    postCount: 156,
    lastActivity: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Sims 4 - DLC și Pachete',
    description: 'Discutăm despre expansion packs, game packs și stuff packs',
    icon: '📦',
    topicCount: 18,
    postCount: 98,
    lastActivity: '2024-01-15T09:15:00Z'
  },
  {
    id: 3,
    name: 'Sims 4 - Building & Design',
    description: 'Împărtășește-ți casele și obiectele personalizate',
    icon: '🏗️',
    topicCount: 32,
    postCount: 201,
    lastActivity: '2024-01-15T11:00:00Z'
  },
  {
    id: 4,
    name: 'Sims 4 - Gameplay & Challenges',
    description: 'Sfaturi, trucuri și challenge-uri',
    icon: '🎮',
    topicCount: 15,
    postCount: 87,
    lastActivity: '2024-01-14T20:45:00Z'
  },
  {
    id: 5,
    name: 'Moduri și Custom Content',
    description: 'Discuții despre mods și CC pentru Sims 4',
    icon: '✨',
    topicCount: 42,
    postCount: 289,
    lastActivity: '2024-01-15T12:20:00Z'
  },
  {
    id: 6,
    name: 'Sims clasic (Sims 1, 2, 3)',
    description: 'Nostalgie pentru versiunile vechi ale jocului',
    icon: '💾',
    topicCount: 28,
    postCount: 145,
    lastActivity: '2024-01-14T18:30:00Z'
  }
];

const Forum = () => {
  const { isAuthenticated } = useAuth();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Acum câteva minute';
    if (hours < 24) return `Acum ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
    const days = Math.floor(hours / 24);
    return `Acum ${days} ${days === 1 ? 'zi' : 'zile'}`;
  };

  return (
    <div className="forum">
      <div className="forum-header">
        <h1>🏠 Forum Sims</h1>
        <p>Explorează secțiunile și alătură-te discuțiilor</p>
      </div>

      <div className="categories-list">
        {mockCategories.map((category) => (
          <Link
            key={category.id}
            to={`/forum/category/${category.id}`}
            className="category-card"
          >
            <div className="category-icon">{category.icon}</div>
            <div className="category-content">
              <h2 className="category-name">{category.name}</h2>
              <p className="category-description">{category.description}</p>
              <div className="category-stats">
                <span>{category.topicCount} subiecte</span>
                <span>•</span>
                <span>{category.postCount} mesaje</span>
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

