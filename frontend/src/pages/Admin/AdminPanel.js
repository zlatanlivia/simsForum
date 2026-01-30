import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authFetch } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import './AdminPanel.css';

const API_URL = 'http://localhost:5001/api';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('ro-RO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, recentRes] = await Promise.all([
        authFetch(`${API_URL}/admin/stats`),
        authFetch(`${API_URL}/admin/users`),
        authFetch(`${API_URL}/admin/recent`),
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const recentData = await recentRes.json();

      if (!statsRes.ok) setError(statsData.error || 'Eroare la statistici.');
      else if (statsData.success && statsData.stats) setStats(statsData.stats);

      if (!usersRes.ok) setError(usersData.error || 'Eroare la utilizatori.');
      else if (usersData.success && usersData.users) setUsers(usersData.users);

      if (recentRes.ok && recentData.success) {
        setRecentTopics(recentData.recentTopics || []);
        setRecentPosts(recentData.recentPosts || []);
      }
    } catch (e) {
      setError('Eroare de conexiune la server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) return;
    loadAdminData();
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const displayName = user.nickname || user.username || (user.email ? user.email.split('@')[0] : 'Admin');

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h1>🛡️ Panou de administrare</h1>
          <p>Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h1>🛡️ Panou de administrare</h1>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-header-row">
          <div>
            <h1>🛡️ Panou de administrare</h1>
            <p>Bună, {displayName}! Iată o privire de ansamblu asupra forumului.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => { setLoading(true); setError(null); loadAdminData(); }}>
            Reîmprospătează datele
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalUsers ?? 0}</div>
            <div className="stat-label">Utilizatori totali</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalTopics ?? 0}</div>
            <div className="stat-label">Subiecte</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.totalPosts ?? 0}</div>
            <div className="stat-label">Mesaje</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <div className="stat-value">{stats?.activeToday ?? 0}</div>
            <div className="stat-label">Mesaje azi</div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <h2>Utilizatori ({users.length})</h2>
          <div className="users-table">
            <div className="table-header">
              <div className="col-nickname">Nickname</div>
              <div className="col-email">Email</div>
              <div className="col-role">Rol</div>
              <div className="col-joined">Înregistrat</div>
              <div className="col-actions">Acțiuni</div>
            </div>
            {users.length === 0 ? (
              <div className="table-row empty">
                <div className="col-empty">Niciun utilizator înregistrat.</div>
              </div>
            ) : (
              users.map((u) => (
                <div key={u.id} className="table-row">
                  <div className="col-nickname">
                    <Link to={`/profile/${u.id}`} className="user-profile-link">
                      {u.nickname || u.username}
                    </Link>
                  </div>
                  <div className="col-email">{u.email}</div>
                  <div className="col-role">
                    <select defaultValue={u.role} className="role-select" disabled title="Modificarea rolului va fi implementată în backend.">
                      <option value="User">User</option>
                      <option value="Moderator">Moderator</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-joined">{u.joined || '—'}</div>
                  <div className="col-actions">
                    <button className="action-btn" disabled title="În curând">Editează</button>
                    <button className="action-btn delete" disabled title="În curând">Șterge</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>Subiecte recente (scrise de utilizatori)</h2>
          <div className="admin-recent-list">
            {recentTopics.length === 0 ? (
              <p className="admin-recent-empty">Niciun subiect încă.</p>
            ) : (
              <ul className="admin-recent-ul">
                {recentTopics.map((t) => (
                  <li key={t.id} className="admin-recent-li">
                    <Link to={`/forum/topic/${t.id}`} className="admin-recent-link">
                      {t.title}
                    </Link>
                    <span className="admin-recent-meta">
                      de <Link to={`/profile/${t.authorId}`} className="admin-author-link"><strong>{t.authorNickname}</strong></Link>
                      {t.categoryName && ` • ${t.categoryName}`}
                      {' • '}{formatDate(t.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>Mesaje recente (scrise de utilizatori)</h2>
          <div className="admin-recent-list">
            {recentPosts.length === 0 ? (
              <p className="admin-recent-empty">Niciun mesaj încă.</p>
            ) : (
              <ul className="admin-recent-ul">
                {recentPosts.map((p) => (
                  <li key={p.id} className="admin-recent-li">
                    <Link to={`/forum/topic/${p.topicId}`} className="admin-recent-link">
                      {p.topicTitle || `Subiect #${p.topicId}`}
                    </Link>
                    <span className="admin-recent-meta">
                      de <Link to={`/profile/${p.authorId}`} className="admin-author-link"><strong>{p.authorNickname}</strong></Link>
                      {' • '}{formatDate(p.createdAt)}
                    </span>
                    <p className="admin-recent-snippet">{p.contentSnippet}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>Gestionare secțiuni</h2>
          <div className="categories-management">
            <button className="btn btn-primary" disabled title="În curând">+ Adaugă secțiune nouă</button>
            <p className="note">
              Statisticile, utilizatorii și activitatea recentă sunt afișate din API. Modificarea rolurilor și gestionarea secțiunilor pot fi adăugate ulterior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
