// src/pages/Inscription.jsx

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Inscription() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', last_name: '', role: 'agriculteur',
    telephone: '', region: '', organisation: ''
  });
  const [erreurs, setErreurs] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const champ = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreurs({});
    setLoading(true);

    try {
      const res = await authAPI.inscription(form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('utilisateur', JSON.stringify(res.data.utilisateur));

      const role = res.data.utilisateur.role;
if (role === 'ong' || role === 'institution' || role === 'admin') {
  navigate('/dashboard');
} else {
  navigate('/diagnostic');
}
    } catch (err) {
      setErreurs(err.response?.data || { erreur: 'Erreur lors de l\'inscription.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🌱 AgroConseil Pro</div>
        <h2 style={styles.titre}>Créer un compte</h2>

        <form onSubmit={handleSubmit}>

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Prénom</label>
              <input style={styles.input} onChange={e => champ('first_name', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Nom</label>
              <input style={styles.input} onChange={e => champ('last_name', e.target.value)} />
            </div>
          </div>

          <label style={styles.label}>Nom d'utilisateur *</label>
          <input style={styles.input} required onChange={e => champ('username', e.target.value)} />
          {erreurs.username && <div style={styles.erreur}>{erreurs.username[0]}</div>}

          <label style={styles.label}>Email</label>
          <input type="email" style={styles.input} onChange={e => champ('email', e.target.value)} />

          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Mot de passe *</label>
              <input type="password" style={styles.input} required onChange={e => champ('password', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Confirmer *</label>
              <input type="password" style={styles.input} required onChange={e => champ('password_confirm', e.target.value)} />
            </div>
          </div>
          {erreurs.password && <div style={styles.erreur}>{erreurs.password[0]}</div>}
          {erreurs.password_confirm && <div style={styles.erreur}>{erreurs.password_confirm}</div>}

          <label style={styles.label}>Vous êtes *</label>
          <select style={styles.input} value={form.role} onChange={e => champ('role', e.target.value)}>
            <option value="agriculteur">Agriculteur</option>
            <option value="agent_terrain">Agent de terrain</option>
            <option value="ong">ONG / Coopérative</option>
            <option value="institution">Institution / Ministère</option>
          </select>

          <label style={styles.label}>Téléphone</label>
          <input style={styles.input} onChange={e => champ('telephone', e.target.value)} />

          <label style={styles.label}>Région</label>
          <select style={styles.input} onChange={e => champ('region', e.target.value)}>
            <option value="">Sélectionnez votre région</option>
            <option>Adamaoua</option><option>Centre</option><option>Est</option>
            <option>Extrême-Nord</option><option>Littoral</option><option>Nord</option>
            <option>Nord-Ouest</option><option>Ouest</option><option>Sud</option><option>Sud-Ouest</option>
          </select>

          {(form.role === 'ong' || form.role === 'institution') && (
            <>
              <label style={styles.label}>Organisation</label>
              <input style={styles.input} onChange={e => champ('organisation', e.target.value)} />
            </>
          )}

          {erreurs.erreur && <div style={styles.erreur}>{erreurs.erreur}</div>}

          <button type="submit" style={styles.bouton} disabled={loading}>
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p style={styles.lien}>
          Déjà un compte ? <Link to="/" style={styles.link}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#f0fdf4',
    fontFamily: 'Arial, sans-serif', padding: 20
  },
  card: {
    background: '#fff', borderRadius: 16, padding: 40,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: 440
  },
  logo: { fontSize: 24, fontWeight: 800, color: '#1B6B3A', textAlign: 'center', marginBottom: 8 },
  titre: { textAlign: 'center', color: '#374151', fontSize: 18, marginBottom: 24, fontWeight: 600 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 14 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' },
  row: { display: 'flex', gap: 12 },
  bouton: { width: '100%', marginTop: 24, padding: '12px', background: '#1B6B3A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  erreur: { marginTop: 6, padding: '8px 10px', background: '#fef2f2', color: '#dc2626', borderRadius: 6, fontSize: 12 },
  lien: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6b7280' },
  link: { color: '#1B6B3A', fontWeight: 600, textDecoration: 'none' }
};