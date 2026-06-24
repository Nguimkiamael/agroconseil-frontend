// src/pages/FilActualite.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticAPI } from '../services/api';
import { Header } from './Parcelles';

export default function FilActualite() {
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      const res = await diagnosticAPI.filActualite();
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const couleurs = {
    onboarding:   { bg: '#f0fdf4', border: '#1B6B3A' },
    conseil_jour: { bg: '#fff',    border: '#2563eb' },
    rappel_suivi: { bg: '#fffbeb', border: '#f59e0b' },
    saisonnier:   { bg: '#f0fdf4', border: '#1B6B3A' },
    alerte:       { bg: '#fef2f2', border: '#dc2626' },
    prevention:   { bg: '#f0fdf4', border: '#059669' },
    entretien:    { bg: '#fff',    border: '#2563eb' },
    suivi:        { bg: '#fffbeb', border: '#f59e0b' },
    info:         { bg: '#fff',    border: '#6b7280' },
  };

  if (loading) return <div style={styles.loading}>Chargement de votre fil d'actualité...</div>;

  return (
    <div style={styles.page}>

      <Header navigate={navigate} utilisateur={utilisateur} />

      <div style={styles.container}>
        <h2 style={styles.titre}>📰 Mon fil d'actualité</h2>
        <p style={styles.sousTitre}>
          Conseils personnalisés selon vos parcelles et l'historique de vos diagnostics
        </p>

        <div style={styles.feed}>
          {items.map((item, i) => {
            const c = couleurs[item.priorite] || couleurs.info;
            return (
              <div key={i} style={{ ...styles.itemCard, borderLeft: `4px solid ${c.border}`, background: c.bg }}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemIcone}>{item.icone}</span>
                  <div style={{ flex: 1 }}>
                    <div style={styles.itemTitre}>{item.titre}</div>
                    {item.parcelle && (
                      <div style={styles.itemMeta}>🌾 {item.parcelle} — {item.culture}</div>
                    )}
                  </div>
                </div>
                <p style={styles.itemContenu}>{item.contenu}</p>

                {item.type === 'rappel_suivi' && (
                  <button onClick={() => navigate('/diagnostic')} style={styles.itemAction}>
                    🔍 Lancer un nouveau diagnostic
                  </button>
                )}
                {item.type === 'onboarding' && (
                  <button onClick={() => navigate('/parcelles')} style={styles.itemAction}>
                    🌾 Ajouter une parcelle
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#6b7280' },

  container: { maxWidth: 700, margin: '0 auto', padding: '24px 16px' },
  titre: { fontSize: 22, color: '#1a1a1a', fontWeight: 800, marginBottom: 4 },
  sousTitre: { fontSize: 13, color: '#6b7280', marginBottom: 20 },

  feed: { display: 'flex', flexDirection: 'column', gap: 12 },
  itemCard: { borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  itemHeader: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  itemIcone: { fontSize: 24 },
  itemTitre: { fontSize: 14, fontWeight: 700, color: '#1a1a1a' },
  itemMeta: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  itemContenu: { fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 8 },
  itemAction: {
    background: '#1B6B3A', color: '#fff', border: 'none',
    padding: '8px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer'
  },
};