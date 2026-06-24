// src/pages/MonEspace.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticAPI, rapportsAPI, reseauAPI } from '../services/api';
import { Header } from './Parcelles';

export default function MonEspace() {
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  const [stats, setStats]         = useState(null);
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [codeReseau, setCodeReseau] = useState('');
  const [msgReseau, setMsgReseau]   = useState('');

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    try {
      const [statsRes, histRes] = await Promise.all([
        diagnosticAPI.mesStats(),
        diagnosticAPI.historique(),
      ]);
      setStats(statsRes.data);
      setHistorique(histRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const telechargerPDF = async (id, culture) => {
    try {
      const res = await rapportsAPI.telecharger(id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AgroConseil_${culture}_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Rapport non disponible pour cette consultation.');
    }
  };

  const rejoindreReseau = async () => {
    if (!codeReseau.trim()) return;
    try {
      const res = await reseauAPI.rejoindre({ code: codeReseau });
      setMsgReseau(`✅ ${res.data.message}`);
      setCodeReseau('');
    } catch (err) {
      setMsgReseau(`❌ ${err.response?.data?.erreur || 'Code invalide.'}`);
    }
    setTimeout(() => setMsgReseau(''), 4000);
  };

  const deconnexion = () => {
    localStorage.clear();
    navigate('/connexion');
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.page}>

      <Header navigate={navigate} utilisateur={utilisateur} />

      <div style={styles.container}>

        <h2 style={styles.titre}>👨‍🌾 Mon espace</h2>

        {/* CARTES STATS */}
        <div style={styles.cardsGrid}>
          <CarteStat icone="📋" valeur={stats.resume.total_consultations} label="Diagnostics réalisés" />
          <CarteStat icone="🌾" valeur={stats.resume.cultures_suivies} label="Cultures suivies" />
          <CarteStat icone="✅" valeur={`${stats.resume.score_moyen}%`} label="Score moyen" />
          <CarteStat icone="⚠️" valeur={stats.resume.escaladees} label="Cas escaladés" />
        </div>

        {/* REJOINDRE UN RÉSEAU */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitre}>🌐 Rejoindre un réseau</h3>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
            Si votre ONG ou coopérative vous a donné un code d'invitation, entrez-le ici.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              style={{ flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}
              placeholder="Ex : ABC12345"
              value={codeReseau}
              onChange={e => setCodeReseau(e.target.value.toUpperCase())}
              onKeyPress={e => e.key === 'Enter' && rejoindreReseau()}
            />
            <button
              onClick={rejoindreReseau}
              style={{ background: '#1B6B3A', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Rejoindre
            </button>
          </div>
          {msgReseau && (
            <p style={{ fontSize: 13, marginTop: 8, color: msgReseau.startsWith('✅') ? '#16a34a' : '#dc2626' }}>
              {msgReseau}
            </p>
          )}
        </div>

        {/* ALERTES RÉCURRENCE */}
        {stats.maladies_recurrentes && stats.maladies_recurrentes.length > 0 && (
          <div style={styles.alerteCard}>
            <h3 style={styles.sectionTitre}>⚠️ Problèmes récurrents détectés</h3>
            <p style={styles.alerteTexte}>
              Ces problèmes sont apparus plusieurs fois — envisagez un traitement préventif systématique.
            </p>
            {stats.maladies_recurrentes.map((m, i) => (
              <div key={i} style={styles.recurrenceItem}>
                <span style={styles.recurrenceBadge}>{m.total}x</span>
                <span>{m.maladie_detectee} ({m.culture})</span>
              </div>
            ))}
          </div>
        )}

        {/* CULTURES SUIVIES */}
        {stats.cultures && stats.cultures.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitre}>🌾 Mes cultures</h3>
            <div style={styles.culturesGrid}>
              {stats.cultures.map((c, i) => (
                <div key={i} style={styles.cultureChip}>
                  {c.culture} <span style={styles.cultureCount}>({c.total})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORIQUE */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitre}>📋 Historique de mes consultations</h3>

          {historique.length === 0 ? (
            <p style={styles.vide}>Aucune consultation pour le moment.</p>
          ) : (
            <div style={styles.historiqueListe}>
              {historique.map((c) => (
                <div key={c.id} style={styles.histoItem}>
                  <div style={styles.histoLeft}>
                    <div style={styles.histoTitre}>
                      {c.maladie_detectee || 'Cas escaladé'} — {c.culture}
                    </div>
                    <div style={styles.histoMeta}>
                      {c.region} • {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div style={styles.histoRight}>
                    {c.score_confiance > 0 && (
                      <span style={{
                        ...styles.scoreBadge,
                        background: c.score_confiance >= 80 ? '#dcfce7' :
                                    c.score_confiance >= 50 ? '#fef3c7' : '#fee2e2',
                        color: c.score_confiance >= 80 ? '#16a34a' :
                               c.score_confiance >= 50 ? '#d97706' : '#dc2626'
                      }}>
                        {c.score_confiance}%
                      </span>
                    )}
                    {c.statut === 'complete' && (
                      <button
                        onClick={() => telechargerPDF(c.id, c.culture)}
                        style={styles.pdfBtn}
                      >
                        📄 PDF
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function CarteStat({ icone, valeur, label }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcone}>{icone}</div>
      <div style={styles.statValeur}>{valeur}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#6b7280' },

  container: { maxWidth: 800, margin: '0 auto', padding: '24px 16px' },
  titre: { fontSize: 22, color: '#1a1a1a', marginBottom: 20, fontWeight: 800 },

  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
  statCard: { background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', textAlign: 'center' },
  statIcone: { fontSize: 22, marginBottom: 4 },
  statValeur: { fontSize: 22, fontWeight: 800, color: '#1B6B3A' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2 },

  card: { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  sectionTitre: { fontSize: 15, color: '#1B6B3A', marginBottom: 12, fontWeight: 700 },

  alerteCard: { background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 20, marginBottom: 16 },
  alerteTexte: { fontSize: 13, color: '#78350f', marginBottom: 10 },
  recurrenceItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13, color: '#78350f' },
  recurrenceBadge: { background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 },

  culturesGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  cultureChip: { background: '#f0fdf4', color: '#1B6B3A', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  cultureCount: { opacity: 0.6, fontSize: 11 },

  vide: { textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '20px 0' },

  historiqueListe: { display: 'flex', flexDirection: 'column', gap: 8 },
  histoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: 8 },
  histoTitre: { fontSize: 13, fontWeight: 600, color: '#1a1a1a' },
  histoMeta: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  histoRight: { display: 'flex', alignItems: 'center', gap: 8 },
  scoreBadge: { padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700 },
  pdfBtn: { background: '#1B6B3A', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' },
};