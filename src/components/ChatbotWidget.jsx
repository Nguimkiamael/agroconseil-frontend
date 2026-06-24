// src/components/ChatbotWidget.jsx

import { useState, useRef, useEffect } from 'react';
import { diagnosticAPI } from '../services/api';

export default function ChatbotWidget() {
  const [ouvert, setOuvert]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Bonjour ! Je suis votre Assistant AgroConseil. Posez-moi vos questions sur l'agriculture — techniques, calendriers, prix, conseils pratiques..."
    }
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, ouvert]);

  const envoyer = async () => {
    if (!input.trim() || loading) return;

    const nouveauMessage = { role: 'user', content: input };
    const historiqueActuel = [...messages, nouveauMessage];
    setMessages(historiqueActuel);
    setInput('');
    setLoading(true);

    try {
      const res = await diagnosticAPI.chatbot({
        message:    input,
        historique: historiqueActuel.map(m => ({ role: m.role, content: m.content }))
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reponse }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, une erreur est survenue. Réessayez."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  };

  return (
    <>
      {/* BOUTON FLOTTANT */}
      {!ouvert && (
        <button onClick={() => setOuvert(true)} style={styles.boutonFlottant}>
          💬
        </button>
      )}

      {/* FENÊTRE CHAT */}
      {ouvert && (
        <div style={styles.fenetre}>

          {/* Header */}
          <div style={styles.header}>
            <div>
              <div style={styles.headerTitre}>🌱 Assistant AgroConseil</div>
              <div style={styles.headerSousTitre}>Conseils généraux</div>
            </div>
            <button onClick={() => setOuvert(false)} style={styles.fermerBtn}>✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={styles.messagesZone}>
            {messages.map((m, i) => (
              <div key={i} style={{
                ...styles.messageBox,
                ...(m.role === 'user' ? styles.messageUser : styles.messageAssistant)
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.messageBox, ...styles.messageAssistant }}>
                <span style={styles.loadingDots}>● ● ●</span>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={styles.disclaimer}>
            💡 Conseils généraux — pour un diagnostic précis, utilisez le formulaire Diagnostic
          </div>

          {/* Input */}
          <div style={styles.inputZone}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question..."
              style={styles.input}
              rows={1}
            />
            <button onClick={envoyer} disabled={loading} style={styles.envoyerBtn}>
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  );
}

const styles = {
  boutonFlottant: {
    position: 'fixed', bottom: 24, right: 24, width: 56, height: 56,
    borderRadius: '50%', background: '#1B6B3A', color: '#fff',
    border: 'none', fontSize: 24, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(27,107,58,0.4)', zIndex: 1000
  },

  fenetre: {
    position: 'fixed', bottom: 24, right: 24, width: 340, height: 480,
    background: '#fff', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 1000,
    fontFamily: 'Arial, sans-serif'
  },

  header: {
    background: '#1B6B3A', color: '#fff', padding: '14px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitre: { fontSize: 14, fontWeight: 700 },
  headerSousTitre: { fontSize: 11, opacity: 0.8, marginTop: 2 },
  fermerBtn: {
    background: 'transparent', border: 'none', color: '#fff',
    fontSize: 16, cursor: 'pointer', padding: 4
  },

  messagesZone: {
    flex: 1, overflowY: 'auto', padding: 14,
    display: 'flex', flexDirection: 'column', gap: 8, background: '#f8fafc'
  },
  messageBox: {
    padding: '8px 12px', borderRadius: 12, fontSize: 13,
    lineHeight: 1.5, maxWidth: '85%'
  },
  messageUser: {
    background: '#1B6B3A', color: '#fff', alignSelf: 'flex-end'
  },
  messageAssistant: {
    background: '#fff', color: '#374151', alignSelf: 'flex-start',
    border: '1px solid #e2e8f0'
  },
  loadingDots: { color: '#9ca3af', fontSize: 10, letterSpacing: 2 },

  disclaimer: {
    fontSize: 10, color: '#9ca3af', padding: '6px 12px',
    background: '#fffbeb', borderTop: '1px solid #fde68a',
    textAlign: 'center'
  },

  inputZone: {
    display: 'flex', gap: 8, padding: 10, borderTop: '1px solid #f1f5f9'
  },
  input: {
    flex: 1, border: '1px solid #d1d5db', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, resize: 'none',
    fontFamily: 'inherit', maxHeight: 80
  },
  envoyerBtn: {
    background: '#1B6B3A', color: '#fff', border: 'none',
    borderRadius: 8, width: 36, fontSize: 16, cursor: 'pointer'
  },
};