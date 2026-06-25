// src/pages/Diagnostic.jsx
// AgroConseil Pro — Page de diagnostic v2
// Améliorations : loader par étapes, badge RAG, cohérence image+texte,
//                 nom scientifique, drag & drop, cultures enrichies

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { diagnosticAPI, rapportsAPI } from '../services/api';
import { Header } from './Parcelles';

const CULTURES = [
  'arachide', 'café', 'cacao', 'haricot', 'igname',
  'maïs', 'manioc', 'palmier à huile', 'plantain',
  'riz', 'sorgho', 'tomate',
];

const REGIONS = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord',
  'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
];

// Étapes affichées pendant le chargement (rassure l'utilisateur)
const ETAPES_CHARGEMENT = [
  { id: 1, label: 'Agent Vision — analyse de l\'image...', duree: 4000 },
  { id: 2, label: 'Recherche dans la base IRAD (RAG)...', duree: 3000 },
  { id: 3, label: 'Agent Diagnostic — identification...', duree: 4000 },
  { id: 4, label: 'Agent Agronome — plan de traitement...', duree: 4000 },
  { id: 5, label: 'Agent Planificateur — calendrier 4 semaines...', duree: 3000 },
  { id: 6, label: 'Agent Rapporteur — génération de la synthèse...', duree: 3000 },
];

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
export default function Diagnostic() {
  const navigate    = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
  const dropRef     = useRef(null);

  const [form,      setForm]      = useState({ culture: '', region: '', description: '' });
  const [image,     setImage]     = useState(null);
  const [preview,   setPreview]   = useState(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [etapeIdx,  setEtapeIdx]  = useState(0);
  const [resultat,  setResultat]  = useState(null);
  const [erreur,    setErreur]    = useState('');

  // ── Gestion image ────────────────────────────────────────
  const appliquerImage = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImage = (e) => appliquerImage(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    appliquerImage(e.dataTransfer.files[0]);
  };

  // ── Loader progressif ────────────────────────────────────
  const demarrerLoader = () => {
    setEtapeIdx(0);
    let idx = 0;
    const avancer = () => {
      if (idx < ETAPES_CHARGEMENT.length - 1) {
        idx++;
        setEtapeIdx(idx);
        setTimeout(avancer, ETAPES_CHARGEMENT[idx].duree);
      }
    };
    setTimeout(avancer, ETAPES_CHARGEMENT[0].duree);
  };

  // ── Soumission ───────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setResultat(null);

    if (!form.description.trim()) {
  setErreur('⚠️ La description des symptômes est obligatoire. Décrivez ce que vous observez : couleur des feuilles, taches, déformation, parties touchées, depuis combien de temps.');
  return;
}
if (form.description.trim().length < 20) {
  setErreur('⚠️ Description trop courte. Soyez plus précis pour un meilleur diagnostic.');
  return;
}
    if (!form.culture || !form.region) {
      setErreur('Sélectionnez la culture et la région.');
      return;
    }

    setLoading(true);
    demarrerLoader();

    const formData = new FormData();
    formData.append('culture',     form.culture);
    formData.append('region',      form.region);
    formData.append('description', form.description);
    if (image) formData.append('image', image);

    try {
      const res = await diagnosticAPI.lancer(formData);
      setResultat(res.data);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du diagnostic. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  // ── Téléchargement PDF ───────────────────────────────────
  const telechargerPDF = async () => {
    try {
      const res  = await rapportsAPI.telecharger(resultat.consultation_id);
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute('download', `AgroConseil_${form.culture}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Erreur lors du téléchargement du PDF.');
    }
  };

  const nouveauDiagnostic = () => {
    setResultat(null);
    setForm({ culture: '', region: '', description: '' });
    setImage(null);
    setPreview(null);
    setEtapeIdx(0);
  };

  const deconnexion = () => {
    localStorage.clear();
    navigate('/connexion');
  };

  // ── Rendu ────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <Header navigate={navigate} utilisateur={utilisateur} onDeconnexion={deconnexion} />

      <div style={styles.container}>

        {/* ═══ LOADER ═══ */}
        {loading && (
          <div style={styles.loaderCard}>
            <div style={styles.loaderSpinner}>🌿</div>
            <h3 style={styles.loaderTitre}>Analyse en cours...</h3>
            <p style={styles.loaderSousTitre}>Nos 6 agents IA travaillent sur votre cas</p>
            <div style={styles.etapesContainer}>
              {ETAPES_CHARGEMENT.map((etape, i) => (
                <div key={etape.id} style={{
                  ...styles.etapeLigne,
                  color: i < etapeIdx ? '#16a34a' : i === etapeIdx ? '#1B6B3A' : '#9ca3af',
                  fontWeight: i === etapeIdx ? 700 : 400,
                }}>
                  <span style={styles.etapePuce}>
                    {i < etapeIdx ? '✓' : i === etapeIdx ? '⟳' : '○'}
                  </span>
                  {etape.label}
                </div>
              ))}
            </div>
            <div style={styles.loaderBarre}>
              <div style={{
                ...styles.loaderBarreInterne,
                width: `${((etapeIdx + 1) / ETAPES_CHARGEMENT.length) * 100}%`,
              }} />
            </div>
          </div>
        )}

        {/* ═══ FORMULAIRE ═══ */}
        {!loading && !resultat && (
          <div style={styles.card}>
            <h2 style={styles.titre}>🔍 Nouveau diagnostic</h2>
            <p style={styles.sousTitre}>
              Décrivez le problème de votre culture et/ou ajoutez une photo.
              Notre système multi-agents analysera et identifiera la maladie.
            </p>

            <form onSubmit={handleSubmit}>

              {/* Culture + Région */}
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Culture *</label>
                  <select
                    style={styles.input}
                    value={form.culture}
                    onChange={e => setForm({ ...form, culture: e.target.value })}
                  >
                    <option value="">Sélectionnez...</option>
                    {CULTURES.map(c => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
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
              </div>

              {/* Description */}
              <label style={styles.label}>Description du problème</label>
              <textarea
                style={styles.textarea}
                rows={4}
                placeholder="Ex : Les feuilles ont des trous irréguliers et je vois de la sciure dans le cornet du maïs depuis 3 jours..."
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />

              {/* Zone drag & drop image */}
              <label style={styles.label}>📸 Photo de la culture (optionnel)</label>
              <div
                ref={dropRef}
                style={{ ...styles.dropZone, borderColor: dragOver ? '#1B6B3A' : '#d1d5db', background: dragOver ? '#f0fdf4' : '#fafafa' }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => dropRef.current.querySelector('input').click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImage}
                  style={{ display: 'none' }}
                />
                {preview ? (
                  <div style={styles.previewBox}>
                    <img src={preview} alt="Aperçu" style={styles.previewImg} />
                    <div>
                      <p style={{ fontSize: 13, color: '#374151', marginBottom: 6 }}>
                        ✅ {image?.name}
                      </p>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setImage(null); setPreview(null); }}
                        style={styles.removeBtn}
                      >
                        ✕ Retirer la photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.dropHint}>
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📷</span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>
                      Glissez une photo ici ou <strong style={{ color: '#1B6B3A' }}>cliquez pour parcourir</strong>
                    </span>
                    <span style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, display: 'block' }}>
                      JPG, PNG — l'image améliore la précision du diagnostic
                    </span>
                  </div>
                )}
              </div>

              {erreur && <div style={styles.erreurBox}>⚠️ {erreur}</div>}

              <button type="submit" style={styles.bouton} disabled={loading}>
                🔍 Lancer le diagnostic
              </button>

            </form>
          </div>
        )}

        {/* ═══ RÉSULTAT ═══ */}
        {!loading && resultat && (
          <ResultatDiagnostic
            resultat={resultat}
            culture={form.culture}
            region={form.region}
            onTelecharger={telechargerPDF}
            onNouveau={nouveauDiagnostic}
          />
        )}

      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
// COMPOSANT RÉSULTAT
// ════════════════════════════════════════════════════════════
function ResultatDiagnostic({ resultat, culture, region, onTelecharger, onNouveau }) {

  const { diagnostic, traitement, planning, synthese } = resultat;

  // ── CAS ESCALADE ────────────────────────────────────────
  if (resultat.statut === 'escalade') {
    return (
      <div>
        {/* Bandeau rouge */}
        <div style={{ ...styles.scoreBandeau, background: '#dc2626' }}>
          <div>
            <div style={styles.scoreLabel}>Confiance faible — vérification recommandée</div>
            <div style={styles.scoreValue}>🔴 {diagnostic.niveau_confiance}</div>
          </div>
          <div style={styles.scoreNumber}>{diagnostic.score}%</div>
        </div>

        {/* Explication */}
        <div style={styles.card}>
          <h3 style={{ ...styles.sectionTitre, color: '#dc2626' }}>⚠️ Pourquoi ce résultat ?</h3>
          <p style={styles.texte}>{resultat.message}</p>
          <BadgeMethode methode={diagnostic.methode} confiance_rag={diagnostic.confiance_rag} />
        </div>

        {/* Hypothèse */}
        <div style={styles.card}>
          <h3 style={styles.sectionTitre}>🔬 Hypothèse la plus probable</h3>
          <div style={styles.maladieBox}>{diagnostic.maladie}</div>
          {diagnostic.nom_scientifique && (
            <p style={styles.nomScientifique}>🔬 {diagnostic.nom_scientifique}</p>
          )}
          {diagnostic.symptomes?.length > 0 && (
            <>
              <p style={styles.labelGras}>Symptômes pris en compte :</p>
              <ul style={styles.liste}>
                {diagnostic.symptomes.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </>
          )}
        </div>

        {/* Traitement provisoire */}
        {traitement?.traitement_immediat && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitre}>💊 En attendant l'avis de l'IRAD</h3>
            <div style={styles.urgentBox}>
              🚨 <strong>Action de précaution :</strong> {traitement.traitement_immediat}
            </div>
            {traitement.alternative_bio && (
              <div style={styles.bioBox}>
                🌿 <strong>Option plus sûre (bio) :</strong> {traitement.alternative_bio}
              </div>
            )}
          </div>
        )}

        {/* Contact IRAD */}
        <div style={styles.card}>
          <h3 style={{ ...styles.sectionTitre, color: '#dc2626' }}>📞 Contactez un agronome IRAD</h3>
          <p style={styles.texte}>☎️ IRAD Cameroun : <strong>+237 222 23 35 26</strong></p>
          <p style={styles.texte}>
            Mentionnez le score de confiance ({diagnostic.score}%) pour que l'agronome
            comprenne qu'il s'agit d'un cas nécessitant vérification.
          </p>
        </div>

        {synthese && !synthese.startsWith('Erreur') && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitre}>📄 Résumé</h3>
            <div style={styles.synthese}>{synthese}</div>
          </div>
        )}

        <div style={styles.disclaimer}>{resultat.disclaimer}</div>
        <ActionsButtons
          consultationId={resultat.consultation_id}
          onTelecharger={onTelecharger}
          onNouveau={onNouveau}
        />
      </div>
    );
  }

  // ── CAS SUCCÈS ──────────────────────────────────────────
  const couleurNiveau = { 'ÉLEVÉ': '#16a34a', 'MOYEN': '#d97706', 'FAIBLE': '#dc2626' };
  const niveau = Object.keys(couleurNiveau).find(k => diagnostic.niveau_confiance?.includes(k)) || 'FAIBLE';

  return (
    <div>

      {/* BANDEAU SCORE */}
      <div style={{ ...styles.scoreBandeau, background: couleurNiveau[niveau] }}>
        <div>
          <div style={styles.scoreLabel}>Confiance du diagnostic</div>
          <div style={styles.scoreValue}>{diagnostic.emoji} {diagnostic.niveau_confiance}</div>
          <div style={{ ...styles.scoreLabel, marginTop: 4, opacity: 0.85 }}>
            {culture} • {region}
          </div>
        </div>
        <div style={styles.scoreNumber}>{diagnostic.score}%</div>
      </div>

      {/* DIAGNOSTIC */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitre}>🔬 Diagnostic</h3>

        <div style={styles.maladieBox}>{diagnostic.maladie}</div>

        {diagnostic.nom_scientifique && (
          <p style={styles.nomScientifique}>
            🔬 <em>{diagnostic.nom_scientifique}</em>
          </p>
        )}

        <p style={styles.texte}>{diagnostic.explication}</p>

        {/* Badges source + méthode + cohérence */}
        <div style={styles.badgesRow}>
          <BadgeMethode methode={diagnostic.methode} confiance_rag={diagnostic.confiance_rag} />
          {diagnostic.coherence === true && (
            <span style={styles.badgeCoherence}>
              ✓ Image & texte concordants (+{diagnostic.bonus_coherence} pts)
            </span>
          )}
          {diagnostic.coherence === false && (
            <span style={styles.badgeIncoherence}>
              ⚠ Image & texte divergents
            </span>
          )}
        </div>

        {diagnostic.observations_image && (
          <div style={styles.observationBox}>
            👁️ <strong>Observation visuelle :</strong> {diagnostic.observations_image}
          </div>
        )}

        {diagnostic.symptomes?.length > 0 && (
          <>
            <p style={styles.labelGras}>Symptômes identifiés :</p>
            <ul style={styles.liste}>
              {diagnostic.symptomes.map((s, i) => <li key={i}>✓ {s}</li>)}
            </ul>
          </>
        )}

        <div style={styles.sourceBadge}>📚 {diagnostic.source}</div>
      </div>

      {/* TRAITEMENT */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitre}>💊 Plan de traitement</h3>

        <div style={styles.urgentBox}>
          🚨 <strong>Action immédiate :</strong> {traitement.traitement_immediat}
        </div>

        {traitement.traitement_principal && (
          <div style={styles.traitementBox}>
            <div style={styles.produitNom}>💊 {traitement.traitement_principal.produit}</div>
            <p style={styles.texte}><strong>Dosage :</strong> {traitement.traitement_principal.dosage}</p>
            <p style={styles.texte}><strong>Application :</strong> {traitement.traitement_principal.mode_emploi}</p>
            <p style={styles.texte}>
              <strong>📍 Disponible à :</strong> {traitement.traitement_principal.disponibilite}
            </p>
          </div>
        )}

        {traitement.alternative_bio && (
          <div style={styles.bioBox}>
            🌿 <strong>Alternative bio :</strong> {traitement.alternative_bio}
          </div>
        )}

        {traitement.precautions?.length > 0 && (
          <>
            <p style={styles.labelGras}>⚠️ Précautions :</p>
            <ul style={styles.liste}>
              {traitement.precautions.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </>
        )}

        {traitement.suivi && (
          <div style={styles.suiviBox}>
            🔍 <strong>Suivi après traitement :</strong> {traitement.suivi}
          </div>
        )}
      </div>

      {/* PLANNING 4 SEMAINES */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitre}>📅 Calendrier — 4 semaines</h3>
        <div style={styles.planningGrid}>
          {['semaine_1', 'semaine_2', 'semaine_3', 'semaine_4'].map((key, i) => {
            const s       = planning[key];
            const couleurs = ['#dc2626', '#2563eb', '#2E7D52', '#059669'];
            if (!s) return null;
            return (
              <div key={key} style={styles.semaineCard}>
                <div style={{ ...styles.semaineHeader, background: couleurs[i] }}>
                  Sem. {i + 1} — {s.priorite?.toUpperCase()}
                </div>
                <div style={styles.semaineBody}>
                  <ul style={styles.liste}>
                    {s.actions?.map((a, j) => <li key={j}>→ {a}</li>)}
                  </ul>
                  <p style={styles.conseil}>💡 {s.conseil}</p>
                </div>
              </div>
            );
          })}
        </div>

        {planning.alerte_saisonniere && (
          <div style={styles.alerteBox}>
            🌦️ <strong>Alerte saisonnière :</strong> {planning.alerte_saisonniere}
          </div>
        )}
      </div>

      {/* SYNTHÈSE */}
      {synthese && !synthese.startsWith('Erreur') && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitre}>📄 Synthèse agronome</h3>
          <div style={styles.synthese}>{synthese}</div>
        </div>
      )}

      <div style={styles.disclaimer}>{resultat.disclaimer}</div>

      <ActionsButtons
        consultationId={resultat.consultation_id}
        onTelecharger={onTelecharger}
        onNouveau={onNouveau}
      />
    </div>
  );
}


// ════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ════════════════════════════════════════════════════════════

/** Badge indiquant la méthode de diagnostic et la source (RAG ou IA générale) */
function BadgeMethode({ methode, confiance_rag }) {
  const labelMethode = {
    'image + texte':  '📷+📝 Image & description',
    'texte uniquement': '📝 Description texte',
    'image uniquement': '📷 Image seule',
    'aucune': '❌ Aucune analyse',
  }[methode] || methode;

  return (
    <div style={styles.badgesRow}>
      <span style={styles.badgeMethode}>{labelMethode}</span>
      <span style={confiance_rag ? styles.badgeRAGok : styles.badgeRAGhors}>
        {confiance_rag ? '✓ Validé base IRAD' : '⟳ Connaissances générales IA'}
      </span>
    </div>
  );
}

/** Boutons d'action PDF + Nouveau diagnostic */
function ActionsButtons({ consultationId, onTelecharger, onNouveau }) {
  return (
    <div style={styles.actions}>
      {consultationId && (
        <button onClick={onTelecharger} style={styles.boutonPrimaire}>
          📄 Télécharger rapport PDF
        </button>
      )}
      <button onClick={onNouveau} style={styles.boutonSecondaire}>
        🔍 Nouveau diagnostic
      </button>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
// STYLES
// ════════════════════════════════════════════════════════════
const styles = {
  page:      { minHeight: '100vh', background: '#f0fdf4', fontFamily: 'Arial, sans-serif' },
  container: { maxWidth: 720, margin: '0 auto', padding: '24px 16px' },

  // ── Formulaire ──
  card: {
    background: '#fff', borderRadius: 12, padding: 24,
    marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  titre:     { fontSize: 20, color: '#1B6B3A', marginBottom: 4, fontWeight: 700 },
  sousTitre: { fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 },
  row:       { display: 'flex', gap: 12 },
  label:     { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, marginTop: 14 },
  input:     { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' },
  textarea:  { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },

  dropZone: {
    marginTop: 8, border: '2px dashed', borderRadius: 10, padding: 20,
    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
  },
  dropHint:  { padding: '10px 0' },
  previewBox: { display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left' },
  previewImg: { width: 90, height: 90, objectFit: 'cover', borderRadius: 8, border: '2px solid #e2e8f0', flexShrink: 0 },
  removeBtn:  { background: '#fef2f2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
  erreurBox:  { marginTop: 12, padding: '10px 12px', background: '#fef2f2', color: '#dc2626', borderRadius: 8, fontSize: 13 },
  bouton:     { width: '100%', marginTop: 20, padding: '14px', background: '#1B6B3A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' },

  // ── Loader ──
  loaderCard: {
    background: '#fff', borderRadius: 12, padding: 32, marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center',
  },
  loaderSpinner:   { fontSize: 40, marginBottom: 12, animation: 'pulse 1.5s infinite' },
  loaderTitre:     { fontSize: 18, color: '#1B6B3A', fontWeight: 700, marginBottom: 4 },
  loaderSousTitre: { fontSize: 13, color: '#6b7280', marginBottom: 24 },
  etapesContainer: { textAlign: 'left', margin: '0 auto 20px', maxWidth: 360 },
  etapeLigne:      { fontSize: 12, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s' },
  etapePuce:       { width: 16, textAlign: 'center', flexShrink: 0 },
  loaderBarre:     { height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden', margin: '0 auto', maxWidth: 360 },
  loaderBarreInterne: { height: '100%', background: '#1B6B3A', borderRadius: 3, transition: 'width 0.8s ease' },

  // ── Résultat — général ──
  scoreBandeau: { borderRadius: 12, padding: '18px 24px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' },
  scoreLabel:   { fontSize: 12, opacity: 0.9 },
  scoreValue:   { fontSize: 16, fontWeight: 700, marginTop: 4 },
  scoreNumber:  { fontSize: 40, fontWeight: 900 },

  sectionTitre:    { fontSize: 16, color: '#1B6B3A', marginBottom: 12, fontWeight: 700 },
  maladieBox:      { fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 6, padding: '10px 14px', background: '#f0fdf4', borderRadius: 8, borderLeft: '4px solid #1B6B3A' },
  nomScientifique: { fontSize: 13, color: '#6b7280', fontStyle: 'italic', marginBottom: 8 },
  texte:           { fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 8 },
  labelGras:       { fontSize: 13, fontWeight: 700, color: '#1B6B3A', marginTop: 12, marginBottom: 6 },
  liste:           { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: '#374151', lineHeight: 2 },
  sourceBadge:     { marginTop: 12, display: 'inline-block', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: 20, fontSize: 11 },

  badgesRow:       { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  badgeMethode:    { fontSize: 11, background: '#f3f4f6', color: '#374151', padding: '3px 10px', borderRadius: 20, border: '1px solid #e5e7eb' },
  badgeRAGok:      { fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 20, border: '1px solid #bbf7d0' },
  badgeRAGhors:    { fontSize: 11, background: '#fef9c3', color: '#854d0e', padding: '3px 10px', borderRadius: 20, border: '1px solid #fef08a' },
  badgeCoherence:  { fontSize: 11, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 20 },
  badgeIncoherence:{ fontSize: 11, background: '#fff7ed', color: '#c2410c', padding: '3px 10px', borderRadius: 20 },

  observationBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: '#475569', marginBottom: 10, fontStyle: 'italic' },

  // ── Traitement ──
  urgentBox:   { background: '#fef2f2', borderLeft: '4px solid #dc2626', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#7f1d1d', marginBottom: 12 },
  traitementBox: { background: '#fefce8', borderLeft: '4px solid #f59e0b', borderRadius: 6, padding: '12px 14px', marginBottom: 12 },
  produitNom:  { fontSize: 15, fontWeight: 700, color: '#92400e', marginBottom: 6 },
  bioBox:      { background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#14532d', marginBottom: 12 },
  suiviBox:    { background: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#1e3a8a', marginTop: 8 },

  // ── Planning ──
  planningGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  semaineCard:  { border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' },
  semaineHeader: { padding: '8px 12px', color: '#fff', fontSize: 11, fontWeight: 700 },
  semaineBody:   { padding: '10px 12px', background: '#fafafa' },
  conseil:       { marginTop: 8, fontSize: 11, color: '#6b7280', fontStyle: 'italic' },
  alerteBox:     { marginTop: 12, background: '#fffbeb', borderLeft: '4px solid #f59e0b', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#78350f' },

  // ── Synthèse ──
  synthese:    { fontSize: 13, color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-wrap' },
  disclaimer:  { fontSize: 11, color: '#6b7280', fontStyle: 'italic', padding: '12px 16px', background: '#f8fafc', borderRadius: 8, marginBottom: 16 },

  // ── Actions ──
  actions:         { display: 'flex', gap: 12, marginBottom: 40 },
  boutonPrimaire:  { flex: 1, padding: '13px', background: '#1B6B3A', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  boutonSecondaire: { flex: 1, padding: '13px', background: '#fff', color: '#1B6B3A', border: '2px solid #1B6B3A', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};