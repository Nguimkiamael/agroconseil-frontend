// src/pages/Connexion.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Connexion() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);

    try {
      const res = await authAPI.connexion(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));
      
      const role = res.data.utilisateur.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'ong' || role === 'institution') {
        navigate('/dashboard');
      } else {
        navigate('/diagnostic');
      }
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🌱 AgroConseil Pro</div>
        <h2 style={styles.titre}>Connexion</h2>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Nom d'utilisateur</label>
          <input
            style={styles.input}
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />

          <label style={styles.label}>Mot de passe</label>
          <input
            type="password"
            style={styles.input}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />

          {erreur && <div style={styles.erreur}>{erreur}</div>}

          <button type="submit" style={styles.bouton} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={styles.lien}>
          Pas encore de compte ? <Link to="/inscription" style={styles.link}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
      }

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f0fdf4',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    background: '#fff', borderRadius: 16, padding: 40,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: 380
  },
  logo: {
    fontSize: 24, fontWeight: 800, color: '#1B6B3A',
    textAlign: 'center', marginBottom: 8
  },
  titre: {
    textAlign: 'center', color: '#374151',
    fontSize: 18, marginBottom: 24, fontWeight: 600
  },
  label: {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: '#374151', marginBottom: 6, marginTop: 14
  },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box'
  },
  bouton: {
    width: '100%', marginTop: 24, padding: '12px',
    background: '#1B6B3A', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer'
  },
  erreur: {
    marginTop: 12, padding: '10px 12px', background: '#fef2f2',
    color: '#dc2626', borderRadius: 8, fontSize: 13
  },
  lien: {
    textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280'
  },
  link: { color: '#1B6B3A', fontWeight: 600, textDecoration: 'none' }
      };