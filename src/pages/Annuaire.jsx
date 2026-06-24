// src/pages/Annuaire.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticAPI } from '../services/api';
import { Header } from './Parcelles';

const REGIONS  = ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest'];

export default function Annuaire() {
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  const [region, setRegion] = useState(utilisateur.region || 'Centre');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    charger(region);
  }, [region]);

  const charger = async (r) => {
    setLoading(true);
    setErreur('');
    try {
      const res = await diagnosticAPI.annuaire(r);
      setData(res.data);
    } catch (err) {
      setErreur('Région non disponible.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      <Header navigate={navigate} utilisateur={utilisateur} />

      <div style={styles.container}>
        <h2 style={styles.titre}>📞 Annuaire local</h2>
        <p style={styles.sousTitre}>
          Contacts utiles près de vous — institutions, coopératives, pharmacies agricoles
        </p>

        <label style={styles.label}>Région</label>
        <select
          style={styles.select}
          value={region}
          onChange={e => setRegion(e.target.value)}
        >
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {loading ? (
          <div style={styles.loadingInline}>Chargement...</div>
        ) : erreur ? (
          <div style={styles.erreurBox}>{erreur}</div>
        ) : data && (
          <div style={styles.contenu}>

            {/* INSTITUTIONS */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitre}>🏛 Institutions</h3>
              <div style={styles.contactItem}>
                <div style={styles.contactLabel}>Délégation MINADER</div>
                <div style={styles.contactValeur}>{data.institutions.minader}</div>
              </div>
              <div style={styles.contactItem}>
                <div style={styles.contactLabel}>Station IRAD</div>
                <div style={styles.contactValeur}>{data.institutions.irad}</div>
              </div>
              <div style={styles.contactItem}>
                <div style={styles.contactLabel}>IRAD National</div>
                <div style={styles.contactValeur}>{data.irad_national}</div>
              </div>
            </div>

            {/* COOPÉRATIVES */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitre}>🤝 Coopératives agricoles</h3>
              {data.cooperatives.map((c, i) => (
                <div key={i} style={styles.listeItem}>🌾 {c}</div>
              ))}
            </div>

            {/* PHARMACIES */}
            <div style={styles.card}>
              <h3 style={styles.sectionTitre}>💊 Pharmacies agricoles</h3>
              {data.pharmacies.length === 0 ? (
                <p style={styles.vide}>Aucune pharmacie référencée pour cette région encore.</p>
              ) : (
                data.pharmacies.map((p, i) => (
                  <div key={i} style={styles.listeItem}>📍 {p.nom} — {p.ville}</div>
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' },

  container: { maxWidth: 700, margin: '0 auto', padding: '24px 16px' },
  titre: { fontSize: 22, color: '#1a1a1a', fontWeight: 800, marginBottom: 4 },
  sousTitre: { fontSize: 13, color: '#6b7280', marginBottom: 20 },

  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 },
  select: {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #d1d5db', fontSize: 14, marginBottom: 20, boxSizing: 'border-box'
  },

  loadingInline: { textAlign: 'center', color: '#6b7280', padding: '40px 0' },
  erreurBox: { padding: '12px 14px', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: 13 },

  contenu: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  sectionTitre: { fontSize: 15, color: '#1B6B3A', marginBottom: 12, fontWeight: 700 },

  contactItem: { marginBottom: 10 },
  contactLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 2 },
  contactValeur: { fontSize: 13, color: '#1a1a1a', fontWeight: 500 },

  listeItem: { fontSize: 13, color: '#374151', padding: '6px 0', borderBottom: '1px solid #f1f5f9' },
  vide: { fontSize: 12, color: '#9ca3af', fontStyle: 'italic' },
};