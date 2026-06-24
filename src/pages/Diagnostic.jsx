// src/pages/Dashboard.jsx — AgroConseil Pro v3
// Design : tableau de bord agronome premium

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { Header } from './Parcelles';

// ── Palette ────────────────────────────────────────────────
const C = {
  forest:   '#0F3D24',
  sage:     '#2D6A4F',
  mint:     '#52B788',
  cream:    '#FAFAF7',
  sand:     '#F1EDE4',
  amber:    '#D97706',
  amberBg:  '#FEF3C7',
  red:      '#DC2626',
  redBg:    '#FEE2E2',
  blue:     '#2563EB',
  blueBg:   '#EFF6FF',
  slate:    '#374151',
  muted:    '#6B7280',
  border:   '#E5E7EB',
  white:    '#FFFFFF',
};

const PIE_COLORS = ['#0F3D24','#2D6A4F','#52B788','#D97706','#2563EB','#8B5CF6'];

// ── Composant : Score animé ────────────────────────────────
function ScoreAnneau({ score, size = 120 }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? C.mint : score >= 50 ? C.amber : C.red;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="800" fill={C.slate}>{score}%</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fill={C.muted}>confiance</text>
    </svg>
  );
}

// ── Composant : KPI Card ───────────────────────────────────
function KpiCard({ icone, valeur, label, sous, couleur, bg }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 14,
      padding: '20px 22px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
      borderTop: `3px solid ${couleur}`,
      display: 'flex', flexDirection: 'column', gap: 6,
      transition: 'transform 0.15s, box-shadow 0.15s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ background: bg, borderRadius: 10, padding: '8px 10px', fontSize: 20 }}>{icone}</div>
      </div>
      <div style={{ fontSize: 30, fontWeight: 900, color: C.slate, lineHeight: 1, marginTop: 4 }}>{valeur}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      {sous && <div style={{ fontSize: 11, color: couleur, fontWeight: 600, marginTop: 2 }}>{sous}</div>}
    </div>
  );
}

// ── Tooltip custom ─────────────────────────────────────────
const TooltipCustom = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.10)' }}>
      <div style={{ color: C.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.forest, fontWeight: 700 }}>
          {p.value} {p.name === 'total' ? 'diagnostic(s)' : p.name}
        </div>
      ))}
    </div>
  );
};

// ── Bandeau santé réseau ───────────────────────────────────
function BandeauSante({ stats }) {
  if (!stats) return null;
  const score = stats.resume.score_moyen || 0;
  const escalade = stats.resume.taux_escalade || 0;
  const etat = score >= 75 ? { label: 'Réseau en bonne santé', color: C.mint, bg: '#F0FDF4' }
             : score >= 50 ? { label: 'Réseau à surveiller',   color: C.amber, bg: '#FFFBEB' }
             :               { label: 'Réseau nécessite attention', color: C.red, bg: '#FFF5F5' };

  return (
    <div style={{
      background: etat.bg,
      border: `1px solid ${etat.color}30`,
      borderRadius: 12,
      padding: '16px 24px',
      marginBottom: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 20,
    }}>
      <ScoreAnneau score={score} size={90} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: etat.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          {etat.label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, color: C.slate }}>
          {stats.resume.total_consultations} diagnostics réalisés
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
          {stats.resume.agriculteurs_uniques} agriculteur(s) suivi(s) · {escalade}% de cas escaladés vers expert
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fiabilité moyenne</div>
        <div style={{ fontSize: 36, fontWeight: 900, color: etat.color }}>{score}%</div>
      </div>
    </div>
  );
}

// ── Ligne consultation ─────────────────────────────────────
function LigneConsultation({ c, index }) {
  const [hover, setHover] = useState(false);
  const score = c.score_confiance;
  const scoreColor = score >= 80 ? C.mint : score >= 50 ? C.amber : C.red;
  const scoreBg    = score >= 80 ? '#F0FDF4' : score >= 50 ? C.amberBg : C.redBg;

  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: hover ? C.cream : (index % 2 === 0 ? C.white : '#FAFAFA'), transition: 'background 0.1s' }}
    >
      <td style={S.td}>
        <div style={{ fontWeight: 600, color: C.slate, fontSize: 12 }}>
          {c.utilisateur__first_name || c.utilisateur__username || '—'}
        </div>
      </td>
      <td style={S.td}>
        <span style={{ background: '#F0FDF4', color: C.sage, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
          {c.culture}
        </span>
      </td>
      <td style={{ ...S.td, color: C.muted, fontSize: 11 }}>{c.region || '—'}</td>
      <td style={{ ...S.td, maxWidth: 180 }}>
        <div style={{ fontSize: 12, color: C.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {c.maladie_detectee || <span style={{ color: C.muted, fontStyle: 'italic' }}>Non identifié</span>}
        </div>
      </td>
      <td style={S.td}>
        {score > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 48, height: 4, background: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${score}%`, height: '100%', background: scoreColor, borderRadius: 2, transition: 'width 0.5s' }} />
            </div>
            <span style={{ background: scoreBg, color: scoreColor, padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
              {score}%
            </span>
          </div>
        ) : <span style={{ color: C.muted, fontSize: 11 }}>—</span>}
      </td>
      <td style={S.td}>
        <span style={{
          padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          background: c.statut === 'complete' ? '#F0FDF4' : C.amberBg,
          color:      c.statut === 'complete' ? C.sage    : C.amber,
        }}>
          {c.statut === 'complete' ? '✓ Complété' : '⚠ Escaladé'}
        </span>
      </td>
      <td style={{ ...S.td, color: C.muted, fontSize: 11 }}>
        {new Date(c.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
      </td>
    </tr>
  );
}

// ── PAGE PRINCIPALE ────────────────────────────────────────
export default function Dashboard() {
  const navigate    = useNavigate();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  const [stats,         setStats]         = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [erreur,        setErreur]        = useState('');
  const [onglet,        setOnglet]        = useState('apercu'); // apercu | consultations

  useEffect(() => { chargerDonnees(); }, []);

  const chargerDonnees = async () => {
    try {
      const [statsRes, consultRes] = await Promise.all([
        api.get('/diagnostic/mes-dashboard/'),
        api.get('/diagnostic/mes-consultations/'),
      ]);
      setStats(statsRes.data);
      setConsultations(consultRes.data);
    } catch {
      setErreur('Impossible de charger les statistiques. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.cream, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.sage}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: C.muted, fontSize: 13 }}>Chargement du tableau de bord…</span>
    </div>
  );

  if (erreur) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: C.cream }}>
      <div style={{ background: C.white, borderRadius: 12, padding: 32, textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ color: C.slate, fontSize: 14, marginBottom: 16 }}>{erreur}</div>
        <button onClick={chargerDonnees} style={{ background: C.sage, color: C.white, border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      `}</style>

      <Header navigate={navigate} utilisateur={utilisateur} />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── Titre + actions ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
              AgroConseil Pro
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: C.forest, margin: 0 }}>
              Tableau de bord
            </h1>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
              Vue d'ensemble de votre réseau d'agriculteurs
            </div>
          </div>
          <button
            onClick={() => navigate('/diagnostic')}
            style={{ background: C.sage, color: C.white, border: 'none', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            🔬 Nouveau diagnostic
          </button>
        </div>

        {/* ── Bandeau santé réseau ── */}
        <BandeauSante stats={stats} />

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <KpiCard icone="📋" valeur={stats.resume.total_consultations} label="Diagnostics" sous="Depuis le début" couleur={C.sage} bg="#F0FDF4" />
          <KpiCard icone="👨‍🌾" valeur={stats.resume.agriculteurs_uniques} label="Agriculteurs" sous="Réseau actif" couleur={C.blue} bg={C.blueBg} />
          <KpiCard icone="✅" valeur={`${stats.resume.score_moyen}%`} label="Score moyen" sous="Fiabilité IA" couleur={C.mint} bg="#F0FDF4" />
          <KpiCard icone="⚠️" valeur={`${stats.resume.taux_escalade}%`} label="Taux escalade" sous="Cas complexes" couleur={C.amber} bg={C.amberBg} />
        </div>

        {/* ── Onglets ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: C.white, padding: 4, borderRadius: 10, width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {[
            { id: 'apercu',        label: '📊 Aperçu' },
            { id: 'consultations', label: '📋 Consultations' },
          ].map(o => (
            <button
              key={o.id}
              onClick={() => setOnglet(o.id)}
              style={{
                background: onglet === o.id ? C.forest : 'transparent',
                color:      onglet === o.id ? C.white  : C.muted,
                border: 'none', borderRadius: 7, padding: '7px 18px',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* ── ONGLET APERÇU ── */}
        {onglet === 'apercu' && (
          <div>
            {/* Évolution */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={S.cardTitre}>📈 Diagnostics des 30 derniers jours</div>
                <div style={{ fontSize: 11, color: C.muted }}>Activité quotidienne</div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={stats.evolution_30j} margin={{ left: -10, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" fontSize={10} tick={{ fill: C.muted }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={10} tick={{ fill: C.muted }} axisLine={false} tickLine={false} />
                  <Tooltip content={<TooltipCustom />} />
                  <Line
                    type="monotone" dataKey="total" stroke={C.sage} strokeWidth={2.5}
                    dot={{ r: 3, fill: C.sage, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: C.forest }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Par culture */}
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <div style={S.cardTitre}>🌾 Cultures diagnostiquées</div>
                </div>
                {stats.par_culture?.length > 0 ? (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <ResponsiveContainer width="50%" height={180}>
                      <PieChart>
                        <Pie data={stats.par_culture} dataKey="total" nameKey="culture" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                          {stats.par_culture.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<TooltipCustom />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {stats.par_culture.slice(0, 5).map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, color: C.slate, flex: 1 }}>{c.culture}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{c.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : <Vide />}
              </div>

              {/* Par région */}
              <div style={S.card}>
                <div style={S.cardHeader}>
                  <div style={S.cardTitre}>🌍 Régions actives</div>
                </div>
                {stats.par_region?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={stats.par_region} margin={{ left: -20, right: 5, top: 5, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="region" fontSize={9} angle={-35} textAnchor="end" tick={{ fill: C.muted }} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} tick={{ fill: C.muted }} axisLine={false} tickLine={false} />
                      <Tooltip content={<TooltipCustom />} />
                      <Bar dataKey="total" fill={C.sage} radius={[4, 4, 0, 0]}>
                        {stats.par_region.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? C.forest : C.mint} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <Vide />}
              </div>
            </div>

            {/* Maladies fréquentes */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={S.cardTitre}>🦠 Maladies les plus fréquentes</div>
                <div style={{ fontSize: 11, color: C.muted }}>Sur l'ensemble des diagnostics confirmés</div>
              </div>
              {stats.maladies_frequentes?.length === 0 ? <Vide texte="Les maladies apparaîtront ici au fil des diagnostics." /> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.maladies_frequentes.map((m, i) => {
                    const max = stats.maladies_frequentes[0]?.total || 1;
                    const pct = Math.round((m.total / max) * 100);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? C.forest : C.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: i === 0 ? C.white : C.muted, flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.slate }}>{m.maladie_detectee}</span>
                            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{m.total} cas</span>
                          </div>
                          <div style={{ height: 4, background: C.sand, borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? C.forest : C.mint, borderRadius: 2, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ONGLET CONSULTATIONS ── */}
        {onglet === 'consultations' && (
          <div style={S.card}>
            <div style={{ ...S.cardHeader, marginBottom: 16 }}>
              <div style={S.cardTitre}>📋 Consultations récentes</div>
              <div style={{ fontSize: 11, color: C.muted }}>{consultations.length} entrée(s)</div>
            </div>
            {consultations.length === 0 ? (
              <Vide texte="Aucune consultation enregistrée pour le moment." />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: C.cream }}>
                      {['Agriculteur', 'Culture', 'Région', 'Diagnostic', 'Score', 'Statut', 'Date'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consultations.slice(0, 20).map((c, i) => (
                      <LigneConsultation key={c.id} c={c} index={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── Composant vide ─────────────────────────────────────────
function Vide({ texte = 'Aucune donnée disponible.' }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: C.muted, fontSize: 12 }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>🌱</div>
      {texte}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────
const S = {
  card: {
    background: C.white,
    borderRadius: 14,
    padding: '20px 22px',
    marginBottom: 16,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  cardTitre: {
    fontSize: 14, fontWeight: 700, color: C.forest,
  },
  th: {
    textAlign: 'left', padding: '10px 12px',
    color: C.muted, fontWeight: 700, fontSize: 10,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    borderBottom: `2px solid ${C.border}`,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '10px 12px', borderBottom: `1px solid ${C.cream}`,
    verticalAlign: 'middle',
  },
};