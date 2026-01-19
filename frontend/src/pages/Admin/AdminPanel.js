import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Date simulate pentru admin panel
  const stats = {
    totalUsers: 127,
    totalTopics: 89,
    totalPosts: 543,
    activeToday: 23
  };

  const recentUsers = [
    { id: 1, nickname: 'NewSimmer1', email: 'new1@example.com', role: 'User', joined: '2024-01-15' },
    { id: 2, nickname: 'BuilderPro', email: 'builder@example.com', role: 'Moderator', joined: '2024-01-14' },
    { id: 3, nickname: 'SimsFan2024', email: 'fan@example.com', role: 'User', joined: '2024-01-13' }
  ];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛡️ Panou de administrare</h1>
        <p>Bună, {user.nickname}! Iată o privire de ansamblu asupra forumului.</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Utilizatori totali</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalTopics}</div>
            <div className="stat-label">Subiecte</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-value">{stats.totalPosts}</div>
            <div className="stat-label">Mesaje</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-value">{stats.activeToday}</div>
            <div className="stat-label">Activi astăzi</div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <h2>Utilizatori recenti</h2>
          <div className="users-table">
            <div className="table-header">
              <div className="col-nickname">Nickname</div>
              <div className="col-email">Email</div>
              <div className="col-role">Rol</div>
              <div className="col-joined">Înregistrat</div>
              <div className="col-actions">Acțiuni</div>
            </div>
            {recentUsers.map((u) => (
              <div key={u.id} className="table-row">
                <div className="col-nickname">{u.nickname}</div>
                <div className="col-email">{u.email}</div>
                <div className="col-role">
                  <select defaultValue={u.role} className="role-select">
                    <option value="User">User</option>
                    <option value="Moderator">Moderator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="col-joined">{u.joined}</div>
                <div className="col-actions">
                  <button className="action-btn">Editează</button>
                  <button className="action-btn delete">Șterge</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h2>Gestionare secțiuni</h2>
          <div className="categories-management">
            <button className="btn btn-primary">+ Adaugă secțiune nouă</button>
            <p className="note">
              Note: În versiunea MVP, funcționalitatea completă de gestionare
              va fi implementată în backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

