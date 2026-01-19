import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

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

// Date simulate utilizatori
const mockUsers = {
  1: {
    id: 1,
    email: 'sims@example.com',
    username: 'sims_player',
    nickname: 'SimsFan2024',
    role: 'User',
    avatar: null,
    joinedDate: '2024-01-01T10:00:00Z',
    about: 'Fan Sims din 2014! Îmi place să construiesc case și să explorez toate expansion packs.',
    achievements: [
      { name: 'Primul mesaj', earnedAt: '2024-01-05T14:00:00Z' },
      { name: 'Primul subiect', earnedAt: '2024-01-10T10:00:00Z' },
      { name: 'Sims Veteran', earnedAt: '2024-01-12T16:30:00Z' }
    ],
    stats: {
      topicsCreated: 5,
      postsCreated: 23,
      totalActivity: 28
    }
  }
};

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editAbout, setEditAbout] = useState(profileUser?.about || '');
  const [editNickname, setEditNickname] = useState(profileUser?.nickname || '');
  const [editAvatar, setEditAvatar] = useState(profileUser?.avatar || '');

  React.useEffect(() => {
    if (!userId) return;

    // Încercăm mai întâi utilizatorii mock
    const mock = mockUsers[userId];
    if (mock) {
      setProfileUser(mock);
      return;
    }

    // Apoi verificăm utilizatorul logat
    if (currentUser && currentUser.id?.toString() === userId) {
      const enrichedUser = {
        ...currentUser,
        nickname:
          currentUser.nickname ||
          currentUser.username ||
          (currentUser.email ? currentUser.email.split('@')[0] : ''),
        achievements: currentUser.achievements || [],
        stats:
          currentUser.stats || {
            topicsCreated: 0,
            postsCreated: 0,
            totalActivity: 0
          }
      };
      setProfileUser(enrichedUser);
    }
  }, [userId, currentUser]);

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
                {profileUser.nickname}
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
            <div className="activity-item">
              <Link to="/forum/topic/1">Noua actualizare Sims 4 - ce părere aveți?</Link>
              <span className="activity-date">Acum 2 zile</span>
            </div>
            <div className="activity-item">
              <Link to="/forum/topic/2">Cea mai bună casă pe care ați construit-o vreodată?</Link>
              <span className="activity-date">Acum 5 zile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

