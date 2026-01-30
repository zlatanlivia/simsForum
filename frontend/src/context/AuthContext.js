import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);
const API_URL = 'http://localhost:5001/api';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie folosit în cadrul AuthProvider');
  }
  return context;
};

const getStoredToken = () => localStorage.getItem('simsForumToken');
const getStoredUser = () => {
  try {
    const u = localStorage.getItem('simsForumUser');
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
};

export const authFetch = (url, options = {}) => {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await authFetch(`${API_URL}/me`);
      const data = await response.json();
      if (response.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('simsForumUser', JSON.stringify(data.user));
      } else {
        setUser(null);
        localStorage.removeItem('simsForumUser');
        localStorage.removeItem('simsForumToken');
      }
    } catch (e) {
      setUser(null);
      localStorage.removeItem('simsForumUser');
      localStorage.removeItem('simsForumToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    if (token) {
      if (storedUser) setUser(storedUser);
      refreshUser();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Autentificare eșuată' };
      }

      localStorage.setItem('simsForumToken', data.token);
      setUser(data.user);
      localStorage.setItem('simsForumUser', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, error: 'Eroare de conexiune la server.' };
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Înregistrare eșuată' };
      }

      localStorage.setItem('simsForumToken', data.token);
      setUser(data.user);
      localStorage.setItem('simsForumUser', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (e) {
      return { success: false, error: 'Eroare de conexiune la server.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('simsForumUser');
    localStorage.removeItem('simsForumToken');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('simsForumUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isModerator: user?.role === 'Moderator' || user?.role === 'Admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
