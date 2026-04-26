const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenService = require('../services/tokenService');
const { generateKeyPair } = require('../crypto/crypto');
const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email déjà utilisé' });
    }

    // Génération clés RSA
    const keys = generateKeyPair();
    
    const user = new User({
      name,
      email,
      password,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey // ⚠️ En prod, stocker sécurisé !
    });

    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password });
    console.log('Request body:', req.body);
    
    const { email, password, twoFactorToken } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user || !(await user.comparePassword(password))) {
      console.log('Invalid credentials');
      return res.status(400).json({ error: 'Identifiants incorrects' });
    }

    // Vérification 2FA 
    if (user.totpEnabled) {
      if (!twoFactorToken) {
        return res.status(400).json({ 
          error: 'Token 2FA requis',
          requiresTwoFactor: true 
        });
      }
      
      const TOTPService = require('../services/totpService');
      const isValid = TOTPService.verifyToken(twoFactorToken, { base32: user.totpSecret });
      
      if (!isValid) {
        return res.status(400).json({ error: 'Token 2FA invalide' });
      }
    }

    // Générer les tokens avec refresh
    const accessToken = TokenService.generateAccessToken(user._id);
    const refreshToken = await TokenService.generateRefreshToken(
      user._id, 
      req.headers['user-agent']
    );
    
    res.json({
      token: accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        totpEnabled: user.totpEnabled || false
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
