const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenService = require('../services/tokenService');
const { generateKeyPair } = require('../crypto/crypto');
const router = express.Router();

// Inscription avec OTP obligatoire
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
      privateKey: keys.privateKey,
      isActive: false, // Nouvel utilisateur inactif par défaut
      role: 'user' // Force le rôle user pour les nouveaux inscrits
    });

    await user.save();
    
    // Envoyer l'OTP pour la première connexion
    const OtpService = require('../services/otpService');
    const otpResult = await OtpService.createAndSendOtp(user);
    
    console.log(`📧 New user registered: ${email} - OTP sent`);
    
    res.status(201).json({
      message: 'Compte créé avec succès ! Vérifiez votre email pour le code OTP.',
      requiresOtp: true,
      email: user.email,
      name: user.name,
      otpSent: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Demander OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: 'Identifiants incorrects' });
    }

    // Envoyer l'OTP
    const OtpService = require('../services/otpService');
    const result = await OtpService.createAndSendOtp(user);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connexion avec OTP (sauf admin)
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email, hasPassword: !!req.body.password, hasOtp: !!req.body.otp });
    console.log('Request body:', req.body);
    
    const { email, password, otp, twoFactorToken } = req.body;
    
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

    // EXCEPTION ADMIN : Pas d'OTP requis pour l'admin
    const isAdmin = user.role === 'admin' && user.email === 'hisseinmhtdrya@gmail.com';
    
    if (!isAdmin) {
      // Vérification OTP obligatoire pour les utilisateurs normaux
      if (!user.isOtpVerified) {
        if (!otp) {
          return res.status(400).json({ 
            error: 'OTP requis',
            requiresOtp: true 
          });
        }
        
        const OtpService = require('../services/otpService');
        const otpResult = await OtpService.verifyOtp(user, otp);
        
        if (!otpResult.valid) {
          return res.status(400).json({ error: otpResult.error });
        }
      }
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

    // Activer le compte si première connexion
    if (!user.isActive) {
      user.isActive = true;
      await user.save();
    }

    // Générer les tokens avec refresh
    const accessToken = TokenService.generateAccessToken(user._id);
    const refreshToken = await TokenService.generateRefreshToken(
      user._id, 
      req.headers['user-agent']
    );
    
    // Réinitialiser l'OTP après connexion réussie (sauf admin)
    if (!isAdmin) {
      const OtpService = require('../services/otpService');
      await OtpService.resetOtp(user);
    }
    
    console.log(`✅ Login successful - User: ${user.email} (${user.role}) - Admin bypass: ${isAdmin}`);
    
    res.json({
      token: accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        totpEnabled: user.totpEnabled || false,
        isActive: user.isActive,
        isAdminBypass: isAdmin // Pour info frontend
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
