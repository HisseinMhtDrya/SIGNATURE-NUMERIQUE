// Configuration API centralisée
const API_CONFIG = {
  // URL de l'API backend - utilise HTTPS en production, HTTP en développement
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  
  // Timeout pour les requêtes
  TIMEOUT: 30000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Exporter l'URL de base pour l'utiliser partout
export const API_BASE_URL = API_CONFIG.BASE_URL;

// Exporter la configuration complète
export default API_CONFIG;
