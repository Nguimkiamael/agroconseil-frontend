// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import Diagnostic from './pages/Diagnostic';
import Dashboard from './pages/Dashboard';
import MonEspace from './pages/MonEspace';
import Parcelles from './pages/Parcelles';
import FilActualite from './pages/FilActualite';
import Annuaire from './pages/Annuaire';
import ChatbotWidget from './components/ChatbotWidget';
import Admin from './pages/Admin';
import Reseaux from './pages/Reseaux';

function RouteProtegee({ children, roleRequis }) {
  const token = localStorage.getItem('token');
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');

  if (!token) return <Navigate to="/connexion" />;
  if (roleRequis && !roleRequis.includes(utilisateur.role)) {
    return <Navigate to="/diagnostic" />;
  }
  return children;
}

export default function App() {
  const token = localStorage.getItem('token');
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') || '{}');
  const estAgriculteur = ['agriculteur', 'agent_terrain'].includes(utilisateur.role);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />

        <Route path="/admin"
  element={<RouteProtegee roleRequis={['admin']}><Admin /></RouteProtegee>}
/>

        <Route path="/diagnostic" element={<RouteProtegee><Diagnostic /></RouteProtegee>} />
        <Route path="/mon-espace" element={<RouteProtegee><MonEspace /></RouteProtegee>} />
        <Route path="/parcelles" element={<RouteProtegee><Parcelles /></RouteProtegee>} />
        <Route path="/fil-actualite" element={<RouteProtegee><FilActualite /></RouteProtegee>} />
        <Route path="/annuaire" element={<RouteProtegee><Annuaire /></RouteProtegee>} />

        <Route path="/reseaux" element={<RouteProtegee roleRequis={['ong','institution']}><Reseaux /></RouteProtegee>} />

        <Route
          path="/dashboard"
          element={<RouteProtegee roleRequis={['ong','institution','admin']}><Dashboard /></RouteProtegee>}
        />
      </Routes>

      {token && estAgriculteur && <ChatbotWidget />}
    </BrowserRouter>
  );
}