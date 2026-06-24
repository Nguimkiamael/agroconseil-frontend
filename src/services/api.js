// src/services/api.js

import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Intercepteur — ajoute automatiquement le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const authAPI = {
  inscription: (data) => api.post('/auth/inscription/', data),
  connexion:   (data) => api.post('/auth/connexion/', data),
  profil:      () => api.get('/auth/profil/'),
};

export const diagnosticAPI = {
  lancer: (formData) => api.post('/diagnostic/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  historique:     () => api.get('/diagnostic/historique/'),
  mesStats:       () => api.get('/diagnostic/mes-statistiques/'),
  detail:         (id) => api.get(`/diagnostic/${id}/`),
  chatbot:        (data) => api.post('/diagnostic/chatbot/', data),

  filActualite:   () => api.get('/diagnostic/fil-actualite/'),
  annuaire:       (region) => api.get(`/diagnostic/annuaire/${region ? `?region=${region}` : ''}`),

  parcelles: {
    liste:    () => api.get('/diagnostic/parcelles/'),
    creer:    (data) => api.post('/diagnostic/parcelles/', data),
    detail:   (id) => api.get(`/diagnostic/parcelles/${id}/`),
    modifier: (id, data) => api.put(`/diagnostic/parcelles/${id}/`, data),
    supprimer:(id) => api.delete(`/diagnostic/parcelles/${id}/`),
  },
};

export const rapportsAPI = {
  telecharger: (consultationId) =>
    api.get(`/rapports/${consultationId}/pdf/`, { responseType: 'blob' }),
};


export const reseauAPI = {
  liste:          () => api.get('/dashboard/reseaux/'),
  creer:          (data) => api.post('/dashboard/reseaux/', data),
  membres:        (id) => api.get(`/dashboard/reseaux/${id}/membres/`),
  ajouterMembre:  (id, data) => api.post(`/dashboard/reseaux/${id}/ajouter/`, data),
  retirerMembre:  (id, userId) => api.delete(`/dashboard/reseaux/${id}/retirer/${userId}/`),
  stats:          (id) => api.get(`/dashboard/reseaux/${id}/stats/`),
  rejoindre:      (data) => api.post('/dashboard/rejoindre-reseau/', data),
};




export default api;