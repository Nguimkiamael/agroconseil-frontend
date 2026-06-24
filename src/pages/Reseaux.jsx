// src/pages/Reseaux.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reseauAPI } from '../services/api';
import { Header } from './Parcelles';

const REGIONS = ['Adamaoua','Centre','Est','Extrême-Nord','Littoral','Nord','Nord-Ouest','Ouest','Sud','Sud-Ouest'];

export default function Reseaux() {
  const navigate = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  const [reseaux, setReseaux]         = useState([]);
  const [reseauSelectionne, setReseauSelectionne] = useState(null);
  const [membres, setMembres]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMembres, setLoadingMembres] = useState(false);
  const [modalCreer, setModalCreer]   = useState(false);
  const [identifiant, setIdentifiant] = useState('');
  const [erreur, setErreur]           = useState('');
  const [succes, setSucces]           = useState('');
  const [form, setForm]               = useState({ nom: '', description: '', region: '' });

  useEffect(() => { chargerReseaux(); }, []);

  const chargerReseaux = async () => {
    try {
      const res = await reseauAPI.liste();
      setReseaux(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chargerMembres = async (reseau) => {
    setReseauSelectionne(reseau);
    setLoadingMembres(true);
    setErreur('');
    try {
      const res = await reseauAPI.membres(reseau.id);
      setMembres(res.data.membres);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembres(false);
    }
  };

  const creerReseau = async (e) => {
    e.preventDefault();
    if (!form.nom.trim()) { setErreur('Le nom est obligatoire.'); return; }
    try {
      await reseauAPI.creer(form);
      setModalCreer(false);
      setForm({ nom: '', description: '', region: '' });
      chargerReseaux();
      setSucces('Réseau créé avec succès !');
      setTimeout(() => setSucces(''), 3000);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la création.');
    }
  };

  const ajouterMembre = async () => {
    if (!identifiant.trim()) return;
    setErreur('');
    try {
      await reseauAPI.ajouterMembre(reseauSelectionne.id, { identifiant });
      setIdentifiant('');
      chargerMembres(reseauSelectionne);
      setSucces('Agriculteur ajouté au réseau !');
      setTimeout(() => setSucces(''), 3000);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de l\'ajout.');
    }
  };

  const retirerMembre = async (userId, username) => {
    if (!window.confirm(`Retirer ${username} du réseau ?`)) return;
    try {
      await reseauAPI.retirerMembre(reseauSelectionne.id, userId);
      chargerMembres(reseauSelectionne);
    } catch { alert('Erreur.'); }
  };

  const copierCode = (code) => {
    navigator.clipboard.writeText(code);
    setSucces(`Code ${code} copié !`);
    setTimeout(() => setSucces(''), 2000);
  };

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div style={styles.page}>
      <Header navigate={navigate} utilisateur={utilisateur} />

      <div style={styles.container}>

        {/* HEADER PAGE */}
        <div style={styles.titleRow}>
          <div>
            <h2 style={styles.titre}>🌐 Mes réseaux</h2>
            <p style={styles.sousTitre}>
              Créez des réseaux et invitez vos agriculteurs à les rejoindre
            </p>
          </div>
          <button onClick={() => { setModalCreer(true); setErreur(''); }} style={styles.btnPrimary}>
            + Créer un réseau
          </button>
        </div>

        {/* MESSAGES */}
        {succes && <div style={styles.succesBox}>{succes}</div>}
        {erreur && <div style={styles.erreurBox}>{erreur}</div>}

        <div style={styles.layout}>

          {/* LISTE DES RÉSEAUX */}
          <div style={styles.sidePanel}>
            <h3 style={styles.panelTitre}>Mes réseaux ({reseaux.length})</h3>

            {reseaux.length === 0 ? (
              <div style={styles.vide}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌐</div>
                <p>Aucun réseau créé.</p>
                <p>Créez votre premier réseau pour commencer à inviter des agriculteurs.</p>
              </div>
            ) : (
              reseaux.map(r => (
                <div
                  key={r.id}
                  onClick={() => chargerMembres(r)}
                  style={{
                    ...styles.reseauCard,
                    ...(reseauSelectionne?.id === r.id ? styles.reseauCardActif : {})
                  }}
                >
                  <div style={styles.reseauNom}>{r.nom}</div>
                  <div style={styles.reseauRegion}>📍 {r.region || 'Toutes régions'}</div>
                  <div style={styles.reseauStats}>
                    <span>👨‍🌾 {r.nb_membres} membres</span>
                    <span>📋 {r.nb_diagnostics} diagnostics</span>
                  </div>
                  <div
                    style={styles.codeInvitation}
                    onClick={(e) => { e.stopPropagation(); copierCode(r.code_invitation); }}
                  >
                    🔑 Code : <strong>{r.code_invitation}</strong> — copier
                  </div>
                </div>
              ))
            )}
          </div>

          {/* PANNEAU MEMBRES */}
          <div style={styles.mainPanel}>
            {!reseauSelectionne ? (
              <div style={styles.placeholder}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👈</div>
                <p style={{ color: '#9ca3af' }}>Sélectionnez un réseau pour voir ses membres</p>
              </div>
            ) : (
              <>
                <div style={styles.membreHeader}>
                  <div>
                    <h3 style={styles.panelTitre}>{reseauSelectionne.nom}</h3>
                    <p style={styles.sousTitre}>
                      {membres.length} membre{membres.length > 1 ? 's' : ''} —
                      Code d'invitation : <strong>{reseauSelectionne.code_invitation}</strong>
                    </p>
                  </div>
                </div>

                {/* AJOUTER UN MEMBRE */}
                <div style={styles.ajouterBox}>
                  <p style={styles.ajouterLabel}>
                    ➕ Ajouter un agriculteur par nom d'utilisateur ou email
                  </p>
                  <div style={styles.ajouterRow}>
                    <input
                      style={styles.ajouterInput}
                      placeholder="Ex : kamga_paul ou kamga@email.com"
                      value={identifiant}
                      onChange={e => setIdentifiant(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && ajouterMembre()}
                    />
                    <button onClick={ajouterMembre} style={styles.btnPrimary}>
                      Ajouter
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                    💡 Ou partagez le code <strong>{reseauSelectionne.code_invitation}</strong> — l'agriculteur peut rejoindre lui-même depuis son espace.
                  </p>
                </div>

                {/* LISTE DES MEMBRES */}
                {loadingMembres ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    Chargement des membres...
                  </div>
                ) : membres.length === 0 ? (
                  <div style={styles.vide}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>👨‍🌾</div>
                    <p>Aucun membre dans ce réseau.</p>
                    <p>Ajoutez des agriculteurs ou partagez le code d'invitation.</p>
                  </div>
                ) : (
                  <div style={styles.membresListe}>
                    {membres.map(m => {
                      const joursInactif = m.derniere_consultation
                        ? Math.floor((new Date() - new Date(m.derniere_consultation)) / (1000 * 60 * 60 * 24))
                        : null;
                      const estInactif = !joursInactif || joursInactif > 14;

                      return (
                        <div key={m.id} style={styles.membreItem}>
                          <div style={styles.membreAvatar}>
                            {(m.nom_complet || m.username)[0].toUpperCase()}
                          </div>
                          <div style={styles.membreInfo}>
                            <div style={styles.membreNom}>
                              {m.nom_complet || m.username}
                              {estInactif && (
                                <span style={styles.inactifBadge}>⚠️ Inactif</span>
                              )}
                            </div>
                            <div style={styles.membreMeta}>
                              @{m.username} • {m.region || 'Région non renseignée'}
                              {m.telephone && ` • ${m.telephone}`}
                            </div>
                            <div style={styles.membreStats}>
                              <span>📋 {m.nb_consultations} diagnostic{m.nb_consultations > 1 ? 's' : ''}</span>
                              {m.derniere_maladie && (
                                <span>🦠 Dernière : {m.derniere_maladie}</span>
                              )}
                              {m.derniere_consultation && (
                                <span>
                                  🕐 Il y a {joursInactif} jour{joursInactif > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => retirerMembre(m.id, m.username)}
                            style={styles.retirerBtn}
                          >
                            Retirer
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>

      {/* MODAL CRÉER UN RÉSEAU */}
      {modalCreer && (
        <div style={styles.overlay} onClick={() => setModalCreer(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitre}>🌐 Nouveau réseau</h3>
            <form onSubmit={creerReseau}>
              <label style={styles.label}>Nom du réseau *</label>
              <input
                style={styles.input}
                placeholder="Ex : ONG AgroVert Bafoussam"
                value={form.nom}
                onChange={e => setForm({ ...form, nom: e.target.value })}
              />
              <label style={styles.label}>Région principale</label>
              <select
                style={styles.input}
                value={form.region}
                onChange={e => setForm({ ...form, region: e.target.value })}
              >
                <option value="">Toutes régions</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <label style={styles.label}>Description (optionnel)</label>
              <textarea
                style={{ ...styles.input, resize: 'vertical' }}
                rows={3}
                placeholder="Mission, zone d'intervention..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              {erreur && <div style={styles.erreurBox}>{erreur}</div>}
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setModalCreer(false)} style={styles.btnSecondary}>
                  Annuler
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Créer le réseau
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc', fontFamily: 'Arial, sans-serif' },
  loading: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280' },

  container: { maxWidth: 1100, margin: '0 auto', padding: '24px 16px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 },
  titre: { fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: 0 },
  sousTitre: { fontSize: 13, color: '#6b7280', marginTop: 4 },

  succesBox: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', color: '#16a34a', fontSize: 13, marginBottom: 12 },
  erreurBox: { background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 12 },

  layout: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 },

  sidePanel: { background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', height: 'fit-content' },
  mainPanel: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', minHeight: 400 },
  panelTitre: { fontSize: 15, fontWeight: 700, color: '#1B6B3A', marginBottom: 12 },

  reseauCard: { border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', marginBottom: 10, cursor: 'pointer', transition: 'all 0.2s' },
  reseauCardActif: { border: '2px solid #1B6B3A', background: '#f0fdf4' },
  reseauNom: { fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 },
  reseauRegion: { fontSize: 11, color: '#9ca3af', marginBottom: 6 },
  reseauStats: { display: 'flex', gap: 12, fontSize: 11, color: '#6b7280', marginBottom: 6 },
  codeInvitation: { fontSize: 11, color: '#1B6B3A', cursor: 'pointer', background: '#f0fdf4', padding: '3px 8px', borderRadius: 6 },

  placeholder: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: '#9ca3af', textAlign: 'center' },

  membreHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },

  ajouterBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 16 },
  ajouterLabel: { fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 },
  ajouterRow: { display: 'flex', gap: 10 },
  ajouterInput: { flex: 1, padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 },

  vide: { textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: 13, lineHeight: 1.8 },

  membresListe: { display: 'flex', flexDirection: 'column', gap: 10 },
  membreItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fafafa', borderRadius: 10, border: '1px solid #f1f5f9' },
  membreAvatar: { width: 40, height: 40, borderRadius: '50%', background: '#1B6B3A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, flexShrink: 0 },
  membreInfo: { flex: 1 },
  membreNom: { fontSize: 14, fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 8 },
  inactifBadge: { fontSize: 10, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 10, fontWeight: 600 },
  membreMeta: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  membreStats: { display: 'flex', gap: 12, fontSize: 11, color: '#6b7280', marginTop: 4 },
  retirerBtn: { background: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' },

  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modal: { background: '#fff', borderRadius: 16, padding: 24, width: 440, maxWidth: '95%' },
  modalTitre: { fontSize: 18, color: '#1B6B3A', marginBottom: 16, fontWeight: 700 },
  modalActions: { display: 'flex', gap: 10, marginTop: 20 },

  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 12 },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' },

  btnPrimary: { background: '#1B6B3A', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  btnSecondary: { background: '#fff', color: '#6b7280', border: '1px solid #d1d5db', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', flex: 1 },
};