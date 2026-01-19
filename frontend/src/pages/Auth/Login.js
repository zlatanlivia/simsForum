import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Te rugăm să completezi toate câmpurile');
        return;
      }

      const result = await login(email, password);
      if (result.success) {
        navigate('/forum');
      } else {
        setError(result.error || 'Autentificare eșuată');
      }
    } catch (err) {
      setError('A apărut o eroare. Te rugăm să încerci din nou.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Autentificare Sims Forum</h1>
        <p className="auth-subtitle">Bine ai revenit!</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sims@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parolă</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Autentificare...' : 'Autentifică-te'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Nu ai cont? <Link to="/register">Înregistrează-te</Link>
          </p>
          <Link to="/" className="back-link">← Înapoi la pagina principală</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

