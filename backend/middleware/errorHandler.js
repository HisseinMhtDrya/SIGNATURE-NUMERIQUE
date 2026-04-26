const mongoose = require('mongoose');

// Middleware de gestion des erreurs globale
const errorHandler = (err, req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const timestamp = new Date().toISOString();
  
  console.error(`🚨 [${timestamp}] ${clientIP} - Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.email || 'Anonymous',
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors,
      code: 'VALIDATION_ERROR'
    });
  }

  // Erreurs de duplication Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      error: 'Duplication détectée',
      field,
      value: err.keyValue[field],
      code: 'DUPLICATE_ERROR'
    });
  }

  // Erreurs de conversion Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID invalide',
      field: err.path,
      value: err.value,
      code: 'INVALID_ID'
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token JWT invalide',
      code: 'JWT_INVALID'
    });
  }

  // Erreurs d'expiration JWT
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token JWT expiré',
      expiredAt: err.expiredAt,
      code: 'JWT_EXPIRED'
    });
  }

  // Erreurs Multer (upload fichiers)
  if (err.name === 'MulterError') {
    let message = 'Erreur lors de l\'upload du fichier';
    let code = 'UPLOAD_ERROR';
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Fichier trop volumineux (max: 10MB)';
      code = 'FILE_TOO_LARGE';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Trop de fichiers envoyés';
      code = 'TOO_MANY_FILES';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Champ de fichier inattendu';
      code = 'UNEXPECTED_FILE';
    }

    return res.status(400).json({
      error: message,
      code,
      multerCode: err.code
    });
  }

  // Erreurs de syntaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'JSON invalide',
      code: 'INVALID_JSON'
    });
  }

  // Erreurs de connexion base de données
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    return res.status(503).json({
      error: 'Service temporairement indisponible',
      code: 'DATABASE_ERROR'
    });
  }

  // Erreur par défaut
  const statusCode = err.statusCode || err.status || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    error: err.message || 'Erreur interne du serveur',
    code: err.code || 'INTERNAL_ERROR',
    ...(isDevelopment && { 
      stack: err.stack,
      details: {
        timestamp,
        ip: clientIP,
        url: req.url,
        method: req.method
      }
    })
  });
};

// Middleware pour les routes non trouvées (404)
const notFound = (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const timestamp = new Date().toISOString();
  
  console.warn(`⚠️ [${timestamp}] ${clientIP} - Route not found: ${req.method} ${req.url}`);
  
  res.status(404).json({
    error: 'Route non trouvée',
    url: req.url,
    method: req.method,
    code: 'NOT_FOUND'
  });
};

// Middleware pour capturer les promesses rejetées non gérées
const unhandledRejectionHandler = (err) => {
  const timestamp = new Date().toISOString();
  console.error(`💥 [${timestamp}] Unhandled Rejection:`, err);
  // En production, vous pourriez vouloir fermer l'application proprement
  // process.exit(1);
};

// Middleware pour les exceptions non capturées
const uncaughtExceptionHandler = (err) => {
  const timestamp = new Date().toISOString();
  console.error(`💥 [${timestamp}] Uncaught Exception:`, err);
  // En production, vous pourriez vouloir fermer l'application proprement
  // process.exit(1);
};

module.exports = {
  errorHandler,
  notFound,
  unhandledRejectionHandler,
  uncaughtExceptionHandler
};
