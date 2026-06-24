// src/pages/Parcelles.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticAPI } from '../services/api';

const CULTURES = ['maïs', 'cacao', 'tomate', 'manioc', 'plantain', 'café', 'arachide'];
const REGIONS  = ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest'];

export default function Parcelles() {
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  const [parcelles, setParcelles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [form, setForm] = useState({
    nom: '', culture: '', superficie_ha: '', region: '',
    date_semis: '', notes: ''
  });
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    try {
      const res = await diagnosticAPI.parcelles.liste();
      setParcelles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModal = () => {
    setForm({
      nom: '', culture: '', superficie_ha: '',
      region: utilisateur.region || '', date_semis: '', notes: ''
    });
    setErreur('');
    setModalOuvert(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');

    if (!form.nom || !form.culture || !form.region || !form.date_semis) {
      setErreur('Remplissez tous les champs obligatoires.');
      return;
    }

    setEnvoi(true);
    try {
      await diagnosticAPI.parcelles.creer(form);
      setModalOuvert(false);
      charger();
    } catch (err) {
      setErreur('Erreur lors de la création de la parcelle.');
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer cette parcelle ?')) return;
    try {
      await diagnosticAPI.parcelles.supprimer(id);
      charger();
    } catch {
      alert('Erreur lors de la suppression.');
    }
  };

  const calculerAge = (dateSemis) => {
    const jours = Math.floor((new Date() - new Date(dateSemis)) / (1000 * 60 * 60 * 24));
    if (jours < 0) return 'Pas encore semé';
    if (jours < 30) return `${jours} jours`;
    return `${Math.floor(jours / 30)} mois ${jours % 30}j`;
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.page}>

      <Header navigate={navigate} utilisateur={utilisateur} />

      <div style={styles.container}>
        <div style={styles.titleRow}>
          <h2 style={styles.titre}>🌾 Mes parcelles</h2>
          <button onClick={ouvrirModal} style={styles.boutonAjouter}>
            + Ajouter une parcelle
          </button>
        </div>

        {parcelles.length === 0 ? (
          <div style={styles.vide}>
            <div style={styles.videIcone}>🌱</div>
            <p style={styles.videTexte}>
              Vous n'avez aucune parcelle enregistrée.<br />
              Ajoutez votre première parcelle pour recevoir des conseils personnalisés chaque jour.
            </p>
            <button onClick={ouvrirModal} style={styles.boutonAjouter}>
              + Ajouter ma première parcelle
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {parcelles.map(p => (
              <div key={p.id} style={styles.parcelleCard}>
                <div style={styles.parcelleHeader}>
                  <div style={styles.parcelleNom}>{p.nom}</div>
                  <button onClick={() => supprimer(p.id)} style={styles.supprimerBtn}>✕</button>
                </div>
                <div style={styles.parcelleCulture}>🌾 {p.culture}</div>
                <div style={styles.parcelleInfo}>📍 {p.region}</div>
                <div style={styles.parcelleInfo}>📏 {p.superficie_ha} ha</div>
                <div style={styles.parcelleInfo}>📅 Semé le {new Date(p.date_semis).toLocaleDateString('fr-FR')}</div>
                <div style={styles.parcelleAge}>⏱ {calculerAge(p.date_semis)}</div>
                {p.nb_consultations > 0 && (
                  <div style={styles.parcelleConsultations}>
                    🔍 {p.nb_consultations} diagnostic{p.nb_consultations > 1 ? 's' : ''}
                  </div>
                )}
                {p.notes && <div style={styles.parcelleNotes}>{p.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL AJOUT */}
      {modalOuvert && (
        <div style={styles.modalOverlay} onClick={() => setModalOuvert(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitre}>Nouvelle parcelle</h3>

            <form onSubmit={handleSubmit}>
              <label style={styles.label}>Nom de la parcelle *</label>
              <input
                style={styles.input}
                placeholder="Ex : Champ derrière la maison"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
              />

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Culture *</label>
                  <select
                    style={styles.input}
                    value={form.culture}
                    onChange={e => setForm({ ...form, culture: e.target.value })}
                  >
                    <option value="">Sélectionnez...</option>
                    {CULTURES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Superficie (ha)</label>
                  <input
                    type="number" step="0.1"
                    style={styles.input}
                    placeholder="0.5"
                    value={form.superficie_ha}
                    onChange={e => setForm({ ...form, superficie_ha: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Région *</label>
                  <select
                    style={styles.input}
                    value={form.region}
                    onChange={e => setForm({ ...form, region: e.target.value })}
                  >
                    <option value="">Sélectionnez...</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Date de semis *</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.date_semis}
                    onChange={e => setForm({ ...form, date_semis: e.target.value })}
                  />
                </div>
              </div>

              <label style={styles.label}>Notes (optionnel)</label>
              <textarea
                style={styles.textarea}
                rows={2}
                placeholder="Variété, observations..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />

              {erreur && <div style={styles.erreurBox}>{erreur}</div>}

              <div style={styles.modalActions}>
                <button type="button" onClick={() => setModalOuvert(false)} style={styles.boutonAnnuler}>
                  Annuler
                </button>
                <button type="submit" style={styles.boutonValider} disabled={envoi}>
                  {envoi ? 'Création...' : 'Créer la parcelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}


// ════════════════════════════════════════════════════════════
// HEADER PARTAGÉ
// ════════════════════════════════════════════════════════════
export function Header({ navigate, utilisateur }) {
  const deconnexion = () => {
    localStorage.clear();
    navigate('/connexion');
  };

  const role = utilisateur.role;
  const estAdmin       = role === 'admin';
  const estInstitution = role === 'ong' || role === 'institution';

  return (
    <div style={styles.header}>
      <div style={styles.logo}>🌱 AgroConseil Pro</div>
      <div style={styles.navLinks}>

        {/* Agriculteur / Agent terrain */}
        {!estAdmin && !estInstitution && <>
          <button onClick={() => navigate('/diagnostic')}   style={styles.navBtn}>🔍 Diagnostic</button>
          <button onClick={() => navigate('/mon-espace')}   style={styles.navBtn}>👨‍🌾 Mon espace</button>
          <button onClick={() => navigate('/parcelles')}    style={styles.navBtn}>🌾 Parcelles</button>
          <button onClick={() => navigate('/fil-actualite')}style={styles.navBtn}>📰 Actualité</button>
          <button onClick={() => navigate('/annuaire')}     style={styles.navBtn}>📞 Annuaire</button>
        </>}

        {/* ONG / Institution */}
        {estInstitution && <>
          <button onClick={() => navigate('/dashboard')}    style={styles.navBtn}>📊 Tableau de bord</button>
          <button onClick={() => navigate('/annuaire')}     style={styles.navBtn}>📞 Annuaire</button>
        </>}

        {/* Admin */}
        {estAdmin && <>
          <button onClick={() => navigate('/admin')}        style={styles.navBtn}>⚙️ Administration</button>
        </>}


        {estInstitution && <>
  <button onClick={() => navigate('/dashboard')} style={styles.navBtn}>📊 Dashboard</button>
  <button onClick={() => navigate('/reseaux')}   style={styles.navBtn}>🌐 Réseaux</button>
  <button onClick={() => navigate('/annuaire')}  style={styles.navBtn}>📞 Annuaire</button>
</>}

      </div>
      <div style={styles.userInfo}>
        <span style={{ fontSize: 13, opacity: 0.8 }}>
          {utilisateur.first_name || utilisateur.username}
        </span>
        <button onClick={deconnexion} style={styles.logoutBtn}>Déconnexion</button>
      </div>
    </div>
  );
}


const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: 16, color: '#6b7280' },

  header: {
    background: '#1B6B3A', color: '#fff', padding: '14px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 10
  },
  logo: { fontSize: 18, fontWeight: 800 },
  navLinks: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  navBtn: {
    background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
    padding: '7px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
    padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12
  },

  container: { maxWidth: 900, margin: '0 auto', padding: '24px 16px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 },
  titre: { fontSize: 22, color: '#1a1a1a', fontWeight: 800, margin: 0 },

  boutonAjouter: {
    background: '#1B6B3A', color: '#fff', border: 'none',
    padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer'
  },

  vide: {
    background: '#fff', borderRadius: 12, padding: '60px 20px',
    textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  },
  videIcone: { fontSize: 48, marginBottom: 16 },
  videTexte: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 },
  parcelleCard: {
    background: '#fff', borderRadius: 12, padding: 18,
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9'
  },
  parcelleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  parcelleNom: { fontSize: 15, fontWeight: 700, color: '#1a1a1a' },
  supprimerBtn: {
    background: 'transparent', border: 'none', color: '#dc2626',
    fontSize: 14, cursor: 'pointer', padding: 2
  },
  parcelleCulture: { fontSize: 14, fontWeight: 600, color: '#1B6B3A', marginBottom: 8 },
  parcelleInfo: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  parcelleAge: {
    display: 'inline-block', background: '#f0fdf4', color: '#1B6B3A',
    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, marginTop: 6
  },
  parcelleConsultations: {
    display: 'inline-block', background: '#e0f2fe', color: '#0369a1',
    padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, marginTop: 6, marginLeft: 6
  },
  parcelleNotes: { fontSize: 11, color: '#9ca3af', marginTop: 8, fontStyle: 'italic' },

  /* MODAL */
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16
  },
  modal: {
    background: '#fff', borderRadius: 16, padding: 24,
    width: 440, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto'
  },
  modalTitre: { fontSize: 18, color: '#1B6B3A', marginBottom: 16, fontWeight: 700 },
  modalActions: { display: 'flex', gap: 10, marginTop: 20 },

  row: { display: 'flex', gap: 12 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },

  erreurBox: { marginTop: 12, padding: '10px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: 13 },

  boutonAnnuler: {
    flex: 1, padding: '12px', background: '#fff', color: '#6b7280',
    border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer'
  },
  boutonValider: {
    flex: 1, padding: '12px', background: '#1B6B3A', color: '#fff',
    border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer'
  },
};