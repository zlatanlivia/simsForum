import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !username || !password || !confirmPassword) {
        setError('Te rugăm să completezi toate câmpurile');
        return;
      }

      if (password !== confirmPassword) {
        setError('Parolele nu coincid');
        return;
      }

      const strongPasswordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

      if (!strongPasswordRegex.test(password)) {
        setError(
          'Parola trebuie să aibă minim 8 caractere și să conțină litere mici, litere mari, cifre și un caracter special.'
        );
        return;
      }

      const result = await register(email, username, password);
      if (result.success) {
        navigate('/forum');
      } else {
        setError(result.error || 'Înregistrare eșuată');
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
        <h1 className="auth-title">Înregistrare Sims Forum</h1>
        <p className="auth-subtitle">Alătură-te comunității!</p>

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
            <label htmlFor="username">Nume de utilizator</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="sims_player123"
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
            <small className="password-hint">
              Parola trebuie să aibă minim 8 caractere și să includă litere mici, litere mari, cifre și un
              caracter special (ex: ! @ # $ %).
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmă parola</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Înregistrare...' : 'Înregistrează-te'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Ai deja cont? <Link to="/login">Autentifică-te</Link>
          </p>
          <Link to="/" className="back-link">← Înapoi la pagina principală</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

