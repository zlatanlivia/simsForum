import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authFetch } from '../../context/AuthContext';
import './Profile.css';

const API_URL = 'http://localhost:5001/api';

// Achievements simulate pentru Sims
const allAchievements = {
  'Primul mesaj': {
    id: 1,
    name: 'Primul mesaj',
    description: 'Ai scris primul tău mesaj în forum',
    icon: '💬',
    color: '#4CAF50'
  },
  'Primul subiect': {
    id: 2,
    name: 'Primul subiect',
    description: 'Ai creat primul tău subiect',
    icon: '📝',
    color: '#2196F3'
  },
  'Sims Veteran': {
    id: 3,
    name: 'Sims Veteran',
    description: 'Ai participat la 10 discuții',
    icon: '🏆',
    color: '#FF9800'
  },
  'Constructor Expert': {
    id: 4,
    name: 'Constructor Expert',
    description: 'Ai creat 5 subiecte în secțiunea Building',
    icon: '🏗️',
    color: '#9C27B0'
  },
  'Sims Master': {
    id: 5,
    name: 'Sims Master',
    description: 'Ai atins 50 mesaje în forum',
    icon: '⭐',
    color: '#F44336'
  }
};

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editAbout, setEditAbout] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await authFetch(`${API_URL}/profile/${userId}`);
        const data = await res.json();
        if (res.ok && data.success && data.profile) {
          const profile = data.profile;
          setProfileUser({
            ...profile,
            recentTopics: Array.isArray(profile.recentTopics) ? profile.recentTopics : [],
            recentPosts: Array.isArray(profile.recentPosts) ? profile.recentPosts : [],
          });
          setEditAbout(profile.about || '');
          setEditNickname(profile.nickname || profile.username || '');
          setEditAvatar(profile.avatar || '');
        } else {
          setProfileUser(null);
        }
      } catch (e) {
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Se încarcă profilul...</div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-page">
        <div className="error-message">
          Utilizatorul nu a fost găsit.
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id.toString() === userId;
  const placeholderInitial = (profileUser?.nickname || profileUser?.username || profileUser?.email || '?')
    .charAt(0)
    .toUpperCase();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSaveProfile = () => {
    const updatedUser = {
      ...profileUser,
      nickname: editNickname,
      about: editAbout,
      avatar: editAvatar
    };
    setProfileUser(updatedUser);
    setIsEditing(false);
    // TODO: Salvare în backend
  };

  const getRoleBadge = (role) => {
    if (role === 'Admin') return <span className="role-badge admin">Admin</span>;
    if (role === 'Moderator') return <span className="role-badge moderator">Moderator</span>;
    return null;
  };

  const userAchievements = profileUser.achievements || [];
  const earnedAchievementNames = new Set(userAchievements.map(a => a.name));

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-section">
          {profileUser.avatar ? (
            <img src={profileUser.avatar} alt={profileUser.nickname} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-placeholder">
              {placeholderInitial}
            </div>
          )}
          {isOwnProfile && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
              Editează profilul
            </button>
          )}
        </div>
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                placeholder="Nickname"
                className="edit-input"
              />
              <input
                type="text"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                placeholder="URL avatar (opțional)"
                className="edit-input"
              />
              <textarea
                value={editAbout}
                onChange={(e) => setEditAbout(e.target.value)}
                placeholder="Despre mine"
                rows="4"
                className="edit-textarea"
              />
              <div className="edit-actions">
                <button onClick={handleSaveProfile} className="btn btn-primary">
                  Salvează
                </button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                  Anulează
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="profile-name">
                {profileUser.nickname || profileUser.username}
                {getRoleBadge(profileUser.role)}
              </h1>
              <p className="profile-username">@{profileUser.username}</p>
              <p className="profile-joined">
                Membru din {formatDate(profileUser.joinedDate)}
              </p>
              {profileUser.about && (
                <div className="profile-about">
                  <h3>Despre mine</h3>
                  <p>{profileUser.about}</p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-value">{profileUser.stats?.topicsCreated || 0}</div>
            <div className="stat-label">Subiecte</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{profileUser.stats?.postsCreated || 0}</div>
            <div className="stat-label">Mesaje</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{userAchievements.length}</div>
            <div className="stat-label">Achievements</div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="achievements-section">
          <h2>🏆 Achievements</h2>
          <div className="achievements-grid">
            {Object.values(allAchievements).map((achievement) => {
              const userAchievement = userAchievements.find(a => a.name === achievement.name);
              const isEarned = earnedAchievementNames.has(achievement.name);
              
              return (
                <div
                  key={achievement.id}
                  className={`achievement-card ${isEarned ? 'earned' : 'locked'}`}
                  title={achievement.description}
                >
                  <div className="achievement-icon" style={{ color: achievement.color }}>
                    {achievement.icon}
                  </div>
                  <div className="achievement-name">{achievement.name}</div>
                  {isEarned && userAchievement && (
                    <div className="achievement-date">
                      Câștigat: {formatDate(userAchievement.earnedAt)}
                    </div>
                  )}
                  {!isEarned && (
                    <div className="achievement-locked">🔒</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="activity-section">
          <h2>Activitate recentă</h2>
          <div className="activity-list">
            {(() => {
              const topics = (profileUser.recentTopics || []).map((t) => ({ type: 'topic', ...t }));
              const posts = (profileUser.recentPosts || []).map((p) => ({ type: 'post', ...p }));
              const merged = [...topics, ...posts].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              ).slice(0, 20);
              if (merged.length === 0) {
                return (
                  <p className="activity-empty">Nicio activitate încă.</p>
                );
              }
              return merged.map((item) => (
                <div key={item.type + '-' + item.id} className="activity-item">
                  <div className="activity-row">
                    {item.type === 'topic' ? (
                      <>
                        <span className="activity-type">Subiect:</span>
                        <Link to={`/forum/topic/${item.id}`}>{item.title}</Link>
                      </>
                    ) : (
                      <>
                        <span className="activity-type">Răspuns la:</span>
                        <Link to={`/forum/topic/${item.topicId}`}>
                          {item.topicTitle || `Subiect #${item.topicId}`}
                        </Link>
                      </>
                    )}
                    <span className="activity-date">{formatDate(item.createdAt)}</span>
                  </div>
                  {item.type === 'post' && item.contentSnippet && (
                    <p className="activity-snippet">{item.contentSnippet}</p>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

