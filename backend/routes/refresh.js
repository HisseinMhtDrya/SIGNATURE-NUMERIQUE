const express = require('express');
const TokenService = require('../services/tokenService');
const router = express.Router();

// Rafraîchir les tokens
router.post('/', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis' });
    }
    
    const tokens = await TokenService.refreshTokens(refreshToken);
    
    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Révoquer un refresh token
router.post('/revoke', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis' });
    }
    
    await TokenService.revokeToken(refreshToken);
    
    res.json({ message: 'Token révoqué avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les sessions actives (nécessite auth)
router.get('/sessions', async (req, res) => {
  try {
    // Pour l'instant, nous utiliserons l'auth middleware existant
    // Dans une version complète, ajouter un middleware ici
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    
    const sessions = await TokenService.getUserActiveSessions(userId);
    
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Révoquer toutes les sessions d'un utilisateur
router.post('/revoke-all', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentification requise' });
    }
    
    await TokenService.revokeAllUserTokens(userId);
    
    res.json({ message: 'Toutes les sessions révoquées avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
