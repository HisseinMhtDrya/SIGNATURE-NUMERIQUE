const express = require('express');
const TOTPService = require('../services/totpService');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Activer 2FA pour un utilisateur
router.post('/enable', auth, async (req, res) => {
  try {
    const user = req.user;
    
    // Générer un secret TOTP
    const secret = TOTPService.generateSecret(user.email);
    
    // Sauvegarder le secret dans la base de données
    user.totpSecret = secret.base32;
    user.totpEnabled = true;
    await user.save();
    
    // Générer le QR code
    const qrCode = await TOTPService.generateQRCode(secret);
    
    res.json({
      secret: secret.base32,
      qrCode: qrCode,
      message: '2FA activé avec succès'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vérifier un token TOTP
router.post('/verify', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user;
    
    if (!user.totpEnabled || !user.totpSecret) {
      return res.status(400).json({ error: '2FA non activé' });
    }
    
    const isValid = TOTPService.verifyToken(token, { base32: user.totpSecret });
    
    if (isValid) {
      // Marquer la 2FA comme vérifiée pour cette session
      req.session.totpVerified = true;
      res.json({ message: '2FA vérifiée avec succès' });
    } else {
      res.status(400).json({ error: 'Token 2FA invalide' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Désactiver 2FA
router.post('/disable', auth, async (req, res) => {
  try {
    const user = req.user;
    
    user.totpEnabled = false;
    user.totpSecret = null;
    await user.save();
    
    res.json({ message: '2FA désactivée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir le statut 2FA
router.get('/status', auth, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      enabled: user.totpEnabled || false,
      hasSecret: !!user.totpSecret
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
