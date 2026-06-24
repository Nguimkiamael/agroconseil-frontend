import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

// ── PALETTE ──────────────────────────────────────────────────
const C = {
  forestDeep:  '#0A2E1A',
  forest:      '#1B6B3A',
  forestMid:   '#2E7D52',
  gold:        '#C8A84B',
  goldLight:   '#E8D08A',
  ivory:       '#F5F0E8',
  ivoryDark:   '#EDE8DC',
  charcoal:    '#1A1A1A',
  muted:       '#6B7280',
  white:       '#FFFFFF',
};

// ── HOOK : COMPTEUR ANIMÉ ────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ── HOOK : INTERSECTION OBSERVER ────────────────────────────
function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ════════════════════════════════════════════════════════════
// COMPOSANTS
// ════════════════════════════════════════════════════════════

function StatChoc({ chiffre, unite, texte, delay = 0 }) {
  const [ref, inView] = useInView();
  const count = useCounter(chiffre, 2000, inView);
  return (
    <div ref={ref} style={{
      textAlign: 'center', padding: '40px 20px',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(30px)',
      transition: `all 0.7s ease ${delay}ms`
    }}>
      <div style={{
        fontSize: 'clamp(56px, 10vw, 96px)',
        fontWeight: 900,
        color: C.gold,
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-2px'
      }}>
        {count}{unite}
      </div>
      <div style={{
        fontSize: 15, color: 'rgba(255,255,255,0.65)',
        marginTop: 12, maxWidth: 180, margin: '12px auto 0',
        lineHeight: 1.5
      }}>
        {texte}
      </div>
    </div>
  );
}

function EtapeCard({ numero, titre, texte, inView, delay }) {
  return (
    <div style={{
      display: 'flex', gap: 24, alignItems: 'flex-start',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateX(0)' : 'translateX(-20px)',
      transition: `all 0.6s ease ${delay}ms`
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: C.gold, color: C.charcoal,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 900, flexShrink: 0
      }}>
        {numero}
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.charcoal, marginBottom: 6 }}>
          {titre}
        </div>
        <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
          {texte}
        </div>
      </div>
    </div>
  );
}

function FeatureChip({ icone, texte }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: C.white, border: `1px solid ${C.ivoryDark}`,
      borderRadius: 10, padding: '12px 16px',
      fontSize: 13, color: C.charcoal, fontWeight: 500
    }}>
      <span style={{ fontSize: 20 }}>{icone}</span>
      {texte}
    </div>
  );
}

function CibleCard({ icone, titre, texte, inView, delay }) {
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.ivoryDark}`,
      borderTop: `3px solid ${C.gold}`,
      borderRadius: 12, padding: '28px 24px',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `all 0.6s ease ${delay}ms`
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icone}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.charcoal, marginBottom: 8 }}>{titre}</div>
      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{texte}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// PAGE PRINCIPALE
// ════════════════════════════════════════════════════════════
export default function Accueil() {
  const navigate = useNavigate();
  const [heroVisible, setHeroVisible] = useState(false);
  const [etapesRef, etapesVisible] = useInView();
  const [ciblesRef, ciblesVisible] = useInView();
  const [featuresRef, featuresVisible] = useInView();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", color: C.charcoal, overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,46,26,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid rgba(200,168,75,0.15)`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🌱</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.white, letterSpacing: '-0.3px' }}>
            AgroConseil <span style={{ color: C.gold }}>Pro</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => navigate('/connexion')} style={{
            background: 'transparent', border: `1px solid rgba(255,255,255,0.25)`,
            color: C.white, padding: '9px 20px', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            Connexion
          </button>
          <button onClick={() => navigate('/inscription')} style={{
            background: C.gold, border: 'none',
            color: C.charcoal, padding: '9px 20px', borderRadius: 8,
            fontSize: 14, fontWeight: 700, cursor: 'pointer'
          }}>
            Commencer →
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          HERO — PLEIN ÉCRAN
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        background: `linear-gradient(160deg, ${C.forestDeep} 0%, #0D3D22 60%, #0A2E1A 100%)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center',
        position: 'relative', overflow: 'hidden'
      }}>

        {/* Cercles décoratifs flottants */}
        <div style={{
          position: 'absolute', top: '10%', right: '8%',
          width: 300, height: 300, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(200,168,75,0.08) 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', left: '5%',
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(46,125,82,0.15) 0%, transparent 70%)`,
          pointerEvents: 'none'
        }} />

        {/* Eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(200,168,75,0.12)',
          border: `1px solid rgba(200,168,75,0.3)`,
          borderRadius: 30, padding: '8px 18px',
          fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
          color: C.gold, textTransform: 'uppercase',
          marginBottom: 32,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 0.8s ease 0.1s'
        }}>
          🇨🇲 Conçu pour l'Afrique centrale
        </div>

        {/* Titre principal */}
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 900,
          color: C.white,
          lineHeight: 1.05,
          letterSpacing: '-1.5px',
          maxWidth: 780,
          marginBottom: 24,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.25s'
        }}>
          Votre agronome IA,{' '}
          <span style={{
            color: C.gold,
            position: 'relative',
          }}>
            disponible partout
          </span>
          {' '}et à toute heure
        </h1>

        {/* Sous-titre */}
        <p style={{
          fontSize: 'clamp(15px, 2.5vw, 19px)',
          color: 'rgba(255,255,255,0.65)',
          maxWidth: 560, lineHeight: 1.7,
          marginBottom: 44,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.4s'
        }}>
          Diagnostic instantané des maladies, plan de traitement local,
          calendrier cultural personnalisé — validé par l'IRAD Cameroun.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 60,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s ease 0.55s'
        }}>
          <button onClick={() => navigate('/inscription')} style={{
            background: C.gold, border: 'none',
            color: C.charcoal, padding: '16px 36px',
            borderRadius: 10, fontSize: 16, fontWeight: 800,
            cursor: 'pointer', letterSpacing: '-0.3px',
            boxShadow: `0 8px 32px rgba(200,168,75,0.35)`,
          }}>
            Essayer gratuitement →
          </button>
          <button onClick={() => navigate('/connexion')} style={{
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.25)`,
            color: C.white, padding: '16px 36px',
            borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: 'pointer'
          }}>
            Se connecter
          </button>
        </div>

        {/* Badges de confiance */}
        <div style={{
          display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
          opacity: heroVisible ? 1 : 0,
          transition: 'all 0.8s ease 0.7s'
        }}>
          {['✓ Validé IRAD Cameroun', '✓ 8 agents IA spécialisés', '✓ Disponible 24h/24'].map((b, i) => (
            <span key={i} style={{
              fontSize: 13, color: 'rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              {b}
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          opacity: 0.4
        }}>
          <div style={{ width: 1, height: 40, background: C.gold }} />
          <span style={{ fontSize: 10, color: C.gold, letterSpacing: 2, textTransform: 'uppercase' }}>
            Défiler
          </span>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION CHIFFRES CHOC — fond sombre
      ══════════════════════════════════════════ */}
      <section style={{
        background: C.forestDeep,
        padding: '80px 24px',
        borderTop: `1px solid rgba(200,168,75,0.1)`,
        borderBottom: `1px solid rgba(200,168,75,0.1)`,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 12, fontWeight: 700,
            letterSpacing: 3, textTransform: 'uppercase',
            color: C.gold, marginBottom: 8
          }}>
            Le défi agricole au Cameroun
          </p>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(22px, 4vw, 32px)',
            fontWeight: 800, color: C.white, marginBottom: 60,
            letterSpacing: '-0.5px'
          }}>
            Des chiffres qui imposent l'urgence d'agir
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 0,
            borderTop: `1px solid rgba(255,255,255,0.06)`,
            borderLeft: `1px solid rgba(255,255,255,0.06)`,
          }}>
            {[
              { chiffre: 70, unite: '%', texte: 'de la population active dépend de l\'agriculture' },
              { chiffre: 40, unite: '%', texte: 'des récoltes perdues faute de conseil à temps' },
              { chiffre: 1,  unite: '/10K', texte: 'agronome disponible par agriculteur en zone rurale' },
              { chiffre: 24, unite: 'h', texte: 'de délai moyen pour obtenir un avis d\'expert' },
            ].map((s, i) => (
              <div key={i} style={{
                borderRight: `1px solid rgba(255,255,255,0.06)`,
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
              }}>
                <StatChoc {...s} delay={i * 150} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION COMMENT ÇA MARCHE — fond ivoire
      ══════════════════════════════════════════ */}
      <section style={{ background: C.ivory, padding: '100px 24px' }}>
        <div ref={etapesRef} style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: C.forest, marginBottom: 8
          }}>
            Le processus
          </p>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800,
            color: C.charcoal, marginBottom: 60, letterSpacing: '-0.5px',
            maxWidth: 480
          }}>
            Un diagnostic en moins de 5 minutes
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px 80px' }}>
            {[
              {
                numero: '1', titre: 'Décrivez ou photographiez',
                texte: 'Tapez vos symptômes en français ou prenez une photo de la culture malade — depuis votre téléphone.'
              },
              {
                numero: '2', titre: '8 agents IA analysent',
                texte: 'Nos agents spécialisés (diagnostic, agronome, planificateur...) travaillent en cascade pour croiser les données.'
              },
              {
                numero: '3', titre: 'Recevez le plan d\'action',
                texte: 'Traitement local disponible au Cameroun, calendrier semaine par semaine, et fiche PDF téléchargeable.'
              },
              {
                numero: '4', titre: 'Suivez et progressez',
                texte: 'Votre historique de consultations, vos parcelles, et des conseils quotidiens personnalisés selon vos cultures.'
              },
            ].map((e, i) => (
              <EtapeCard key={i} {...e} inView={etapesVisible} delay={i * 120} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION FONCTIONNALITÉS — fond blanc
      ══════════════════════════════════════════ */}
      <section style={{ background: C.white, padding: '100px 24px' }}>
        <div ref={featuresRef} style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: C.forest, marginBottom: 8
          }}>
            La plateforme
          </p>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800,
            color: C.charcoal, marginBottom: 48, letterSpacing: '-0.5px',
            opacity: featuresVisible ? 1 : 0,
            transform: featuresVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s ease'
          }}>
            Tout ce dont un agriculteur a besoin
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: 12,
            opacity: featuresVisible ? 1 : 0,
            transition: 'all 0.7s ease 0.2s'
          }}>
            {[
              { icone: '🔬', texte: 'Diagnostic par texte ou photo' },
              { icone: '🌿', texte: 'Traitements disponibles localement' },
              { icone: '📅', texte: 'Calendrier cultural 4 semaines' },
              { icone: '📊', texte: 'Tableau de bord ONG & institutions' },
              { icone: '🌾', texte: 'Suivi de parcelles personnalisé' },
              { icone: '💬', texte: 'Assistant conseil disponible 24h/24' },
              { icone: '📄', texte: 'Rapports PDF professionnels' },
              { icone: '📰', texte: 'Fil d\'actualité agricole du jour' },
              { icone: '📞', texte: 'Annuaire local IRAD & coopératives' },
              { icone: '✅', texte: 'Validé par les fiches IRAD & CARBAP' },
            ].map((f, i) => <FeatureChip key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION POUR QUI — fond ivoire
      ══════════════════════════════════════════ */}
      <section style={{ background: C.ivory, padding: '100px 24px' }}>
        <div ref={ciblesRef} style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 3,
            textTransform: 'uppercase', color: C.forest, marginBottom: 8
          }}>
            Les utilisateurs
          </p>
          <h2 style={{
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800,
            color: C.charcoal, marginBottom: 48, letterSpacing: '-0.5px'
          }}>
            Une solution pour tout l'écosystème agricole
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icone: '👨‍🌾', titre: 'Agriculteurs', texte: 'Diagnostic immédiat, conseils pratiques adaptés à votre zone et votre culture.', delay: 0 },
              { icone: '🌍', titre: 'ONG & Coopératives', texte: 'Accompagnez des centaines d\'agriculteurs simultanément, avec rapports d\'impact automatiques.', delay: 100 },
              { icone: '🏛', titre: 'Ministères', texte: 'Données terrain en temps réel pour piloter les politiques agricoles nationales.', delay: 200 },
              { icone: '🏫', titre: 'Écoles agricoles', texte: 'Outil pédagogique ancré dans les réalités locales pour former la prochaine génération.', delay: 300 },
            ].map((c, i) => (
              <CibleCard key={i} {...c} inView={ciblesVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DISCLAIMER
      ══════════════════════════════════════════ */}
      <section style={{ background: C.white, padding: '32px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.7, fontStyle: 'italic' }}>
            ⚠️ AgroConseil Pro est un outil d'aide à la décision basé sur l'intelligence artificielle
            et des fiches techniques validées (IRAD, CARBAP). Pour les exploitations de grande taille,
            nous recommandons de confirmer les recommandations avec un agronome qualifié.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL — fond forêt
      ══════════════════════════════════════════ */}
      <section style={{
        background: `linear-gradient(135deg, ${C.forest} 0%, ${C.forestDeep} 100%)`,
        padding: '100px 24px', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🌱</div>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900,
            color: C.white, marginBottom: 16, letterSpacing: '-1px', lineHeight: 1.1
          }}>
            Protégez vos cultures dès aujourd'hui
          </h2>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.65)',
            marginBottom: 40, lineHeight: 1.7
          }}>
            Rejoignez AgroConseil Pro — gratuit pour commencer, sans engagement.
          </p>
          <button onClick={() => navigate('/inscription')} style={{
            background: C.gold, border: 'none',
            color: C.charcoal, padding: '18px 48px',
            borderRadius: 10, fontSize: 17, fontWeight: 800,
            cursor: 'pointer', letterSpacing: '-0.3px',
            boxShadow: `0 8px 40px rgba(200,168,75,0.4)`,
          }}>
            Créer mon compte gratuitement →
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{
        background: C.forestDeep,
        borderTop: `1px solid rgba(200,168,75,0.1)`,
        padding: '32px 40px',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🌱</span>
          <span style={{ color: C.white, fontSize: 14, fontWeight: 700 }}>
            AgroConseil <span style={{ color: C.gold }}>Pro</span>
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          NGUIMKIA Maël — IAI-Cameroun — Yaoundé, 2026
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          Validé IRAD & CARBAP
        </div>
      </footer>

    </div>
  );
}