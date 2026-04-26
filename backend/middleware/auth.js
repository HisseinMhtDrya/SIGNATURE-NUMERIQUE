const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Logs d'accès avec IP et date
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();
    console.log(`🔐 [${timestamp}] ${clientIP} - Auth attempt`);
    console.log('🔑 Auth middleware - Token present:', !!token);
    console.log('🔑 Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
    
    if (!token) {
      console.log(`❌ [${timestamp}] ${clientIP} - Access denied: No token`);
      return res.status(401).json({ error: 'Accès refusé' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔑 Token decoded - User ID:', decoded.id, 'Expires:', new Date(decoded.exp * 1000).toISOString());
    
    // Vérification utilisateur bloqué
    const user = await User.findById(decoded.id);
    console.log('🔑 User found:', !!user, '- Role:', user?.role, '- Active:', user?.isActive);
    
    if (!user) {
      console.log(`❌ [${timestamp}] ${clientIP} - Access denied: User not found`);
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    
    if (!user.isActive) {
      console.log(`🚫 [${timestamp}] ${clientIP} - Access denied: User blocked - User ID: ${user._id}`);
      return res.status(403).json({ error: 'Utilisateur bloqué' });
    }
    
    // Mise à jour dernière connexion
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();
    
    req.user = user;
    console.log(`✅ [${timestamp}] ${clientIP} - Auth success - User: ${user.email} (${user.role})`);
    next();
  } catch (error) {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const timestamp = new Date().toISOString();
    console.error(`❌ [${timestamp}] ${clientIP} - Auth error:`, error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré', 
        expiredAt: error.expiredAt,
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token invalide',
        code: 'TOKEN_INVALID' 
      });
    }
    
    res.status(401).json({ error: 'Token invalide' });
  }
};

const adminAuth = async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const timestamp = new Date().toISOString();
  
  if (req.user.role !== 'admin') {
    console.log(`🚫 [${timestamp}] ${clientIP} - Admin access denied - User: ${req.user.email} (${req.user.role})`);
    return res.status(403).json({ 
      error: 'Accès administrateur requis',
      requiredRole: 'admin',
      userRole: req.user.role 
    });
  }
  
  console.log(`👑 [${timestamp}] ${clientIP} - Admin access granted - User: ${req.user.email}`);
  next();
};

const superAdminAuth = async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const timestamp = new Date().toISOString();
  
  if (req.user.role !== 'superadmin') {
    console.log(`🚫 [${timestamp}] ${clientIP} - SuperAdmin access denied - User: ${req.user.email} (${req.user.role})`);
    return res.status(403).json({ error: 'Super admin requis' });
  }
  
  console.log(`🌟 [${timestamp}] ${clientIP} - SuperAdmin access granted - User: ${req.user.email}`);
  next();
};

// Middleware pour vérifier si l'utilisateur est bloqué
const checkBlocked = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.isActive) {
      return res.status(403).json({ error: 'Utilisateur bloqué' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { auth, adminAuth, superAdminAuth, checkBlocked };
