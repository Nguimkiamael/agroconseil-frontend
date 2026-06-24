// src/pages/Admin.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ROLES = [
  { value: 'agriculteur',   label: 'Agriculteur' },
  { value: 'agent_terrain', label: 'Agent terrain' },
  { value: 'ong',           label: 'ONG / Coopérative' },
  { value: 'institution',   label: 'Institution' },
  { value: 'admin',         label: 'Administrateur' },
];

const ROLE_COLORS = {
  agriculteur:   { bg: '#dcfce7', color: '#16a34a' },
  agent_terrain: { bg: '#dbeafe', color: '#2563eb' },
  ong:           { bg: '#fef3c7', color: '#d97706' },
  institution:   { bg: '#f3e8ff', color: '#9333ea' },
  admin:         { bg: '#fee2e2', color: '#dc2626' },
};

export default function Admin() {
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet]  = useState('stats');
  const [recherche, setRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState('');

  useEffect(() => { charger(); }, []);

  const charger = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/dashboard/admin/stats/'),
        api.get('/dashboard/admin/utilisateurs/'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.utilisateurs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changerRole = async (userId, newRole) => {
    try {
      await api.put(`/dashboard/admin/utilisateurs/${userId}/`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch { alert('Erreur lors de la modification.'); }
  };

  const toggleActif = async (userId, actuel) => {
    try {
      await api.put(`/dashboard/admin/utilisateurs/${userId}/`, { actif: !actuel });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, actif: !actuel } : u));
    } catch { alert('Erreur.'); }
  };

  const supprimer = async (userId, username) => {
    if (!window.confirm(`Désactiver le compte de ${username} ?`)) return;
    try {
      await api.delete(`/dashboard/admin/utilisateurs/${userId}/supprimer/`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, actif: false } : u));
    } catch (err) { alert(err.response?.data?.erreur || 'Erreur.'); }
  };

  const deconnexion = () => { localStorage.clear(); navigate('/connexion'); };

  const usersFiltres = users.filter(u => {
    const matchRecherche = !recherche || 
      u.username.toLowerCase().includes(recherche.toLowerCase()) ||
      u.email.toLowerCase().includes(recherche.toLowerCase()) ||
      u.nom_complet.toLowerCase().includes(recherche.toLowerCase());
    const matchRole = !filtreRole || u.role === filtreRole;
    return matchRecherche && matchRole;
  });

  if (loading) return <div style={styles.loading}>Chargement du panneau d'administration...</div>;

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={styles.logo}>🌱 AgroConseil Pro</span>
          <span style={styles.adminBadge}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
            {utilisateur.username}
          </span>
          <button onClick={deconnexion} style={styles.logoutBtn}>Déconnexion</button>
        </div>
      </div>

      {/* ONGLETS */}
      <div style={styles.onglets}>
        <button
          onClick={() => setOnglet('stats')}
          style={{ ...styles.onglet, ...(onglet === 'stats' ? styles.ongletActif : {}) }}
        >
          📊 Statistiques
        </button>
        <button
          onClick={() => setOnglet('users')}
          style={{ ...styles.onglet, ...(onglet === 'users' ? styles.ongletActif : {}) }}
        >
          👥 Utilisateurs ({users.length})
        </button>
      </div>

      <div style={styles.container}>

        {/* ═══ ONGLET STATS ═══ */}
        {onglet === 'stats' && stats && (
          <div>
            <h2 style={styles.titre}>Vue d'ensemble de la plateforme</h2>

            <div style={styles.statsGrid}>
              <StatCard icone="👥" valeur={stats.utilisateurs.total} label="Utilisateurs total" couleur="#2563eb" />
              <StatCard icone="✅" valeur={stats.utilisateurs.actifs} label="Comptes actifs" couleur="#16a34a" />
              <StatCard icone="🆕" valeur={stats.utilisateurs.cette_semaine} label="Nouveaux cette semaine" couleur="#d97706" />
              <StatCard icone="📋" valeur={stats.consultations.total} label="Diagnostics réalisés" couleur="#1B6B3A" />
              <StatCard icone="🎯" valeur={stats.consultations.completes} label="Diagnostics réussis" couleur="#059669" />
              <StatCard icone="⚠️" valeur={stats.consultations.escaladees} label="Cas escaladés" couleur="#dc2626" />
              <StatCard icone="📚" valeur={stats.fiches_maladies.actives} label="Fiches maladies actives" couleur="#7c3aed" />
              <StatCard icone="📈" valeur={stats.consultations.cette_semaine} label="Diagnostics cette semaine" couleur="#0369a1" />
            </div>

            {/* Répartition par rôle */}
            <div style={styles.card}>
              <h3 style={styles.cardTitre}>Répartition des utilisateurs par rôle</h3>
              <div style={styles.rolesGrid}>
                {ROLES.map(r => {
                  const count = users.filter(u => u.role === r.value).length;
                  const pct = users.length > 0 ? Math.round(count / users.length * 100) : 0;
                  const c = ROLE_COLORS[r.value];
                  return (
                    <div key={r.value} style={{ ...styles.roleItem, background: c.bg }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{count}</div>
                      <div style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: c.color, opacity: 0.7 }}>{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ ONGLET UTILISATEURS ═══ */}
        {onglet === 'users' && (
          <div>
            <div style={styles.toolbarRow}>
              <h2 style={{ ...styles.titre, margin: 0 }}>Gestion des utilisateurs</h2>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  placeholder="Rechercher..."
                  value={recherche}
                  onChange={e => setRecherche(e.target.value)}
                  style={styles.searchInput}
                />
                <select
                  value={filtreRole}
                  onChange={e => setFiltreRole(e.target.value)}
                  style={styles.searchInput}
                >
                  <option value="">Tous les rôles</option>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Utilisateur', 'Email', 'Rôle', 'Région', 'Diagnostics', 'Statut', 'Actions'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {usersFiltres.map(u => {
                      const rc = ROLE_COLORS[u.role] || { bg: '#f3f4f6', color: '#6b7280' };
                      return (
                        <tr key={u.id} style={{ opacity: u.actif ? 1 : 0.5 }}>
                          <td style={styles.td}>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{u.username}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{u.nom_complet}</div>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: 12, color: '#6b7280' }}>{u.email || '—'}</span>
                          </td>
                          <td style={styles.td}>
                            <select
                              value={u.role}
                              onChange={e => changerRole(u.id, e.target.value)}
                              style={{
                                background: rc.bg, color: rc.color,
                                border: 'none', borderRadius: 6,
                                padding: '4px 8px', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: 12, color: '#6b7280' }}>{u.region || '—'}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{
                              background: '#f0fdf4', color: '#16a34a',
                              padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700
                            }}>
                              {u.nb_consultations}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => toggleActif(u.id, u.actif)}
                              style={{
                                background: u.actif ? '#dcfce7' : '#fee2e2',
                                color: u.actif ? '#16a34a' : '#dc2626',
                                border: 'none', borderRadius: 6,
                                padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              {u.actif ? 'Actif' : 'Inactif'}
                            </button>
                          </td>
                          <td style={styles.td}>
                            <button
                              onClick={() => supprimer(u.id, u.username)}
                              style={styles.deleteBtn}
                            >
                              Désactiver
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icone, valeur, label, couleur }) {
  return (
    <div style={{ ...styles.statCard, borderLeft: `4px solid ${couleur}` }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icone}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: couleur }}>{valeur}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#6b7280' },

  header: {
    background: '#0A2E1A', color: '#fff', padding: '16px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  logo: { fontSize: 18, fontWeight: 800 },
  adminBadge: {
    background: '#C8A84B', color: '#0A2E1A',
    padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 900, letterSpacing: 1
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12
  },

  onglets: {
    background: '#fff', borderBottom: '1px solid #e2e8f0',
    display: 'flex', padding: '0 24px'
  },
  onglet: {
    background: 'transparent', border: 'none', borderBottom: '3px solid transparent',
    padding: '16px 20px', fontSize: 14, fontWeight: 600, color: '#6b7280',
    cursor: 'pointer', marginBottom: -1
  },
  ongletActif: {
    color: '#1B6B3A', borderBottomColor: '#1B6B3A'
  },

  container: { maxWidth: 1100, margin: '0 auto', padding: '24px 16px' },
  titre: { fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 },

  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12, marginBottom: 20
  },
  statCard: {
    background: '#fff', borderRadius: 10, padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  },

  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginBottom: 16 },
  cardTitre: { fontSize: 15, color: '#1B6B3A', marginBottom: 16, fontWeight: 700 },

  rolesGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 },
  roleItem: { borderRadius: 10, padding: '16px 12px', textAlign: 'center' },

  toolbarRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12
  },
  searchInput: {
    padding: '8px 12px', border: '1px solid #d1d5db',
    borderRadius: 8, fontSize: 13
  },

  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    textAlign: 'left', padding: '10px 12px',
    background: '#f8fafc', color: '#6b7280',
    fontWeight: 700, borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap'
  },
  td: {
    padding: '10px 12px', borderBottom: '1px solid #f1f5f9',
    color: '#374151', whiteSpace: 'nowrap'
  },
  deleteBtn: {
    background: '#fef2f2', color: '#dc2626', border: 'none',
    padding: '5px 10px', borderRadius: 6, fontSize: 11,
    fontWeight: 600, cursor: 'pointer'
  },
};