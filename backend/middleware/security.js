const helmet = require('helmet');
const xss = require('xss');
const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');

class SecurityMiddleware {
  // Configuration Helmet complète
  static helmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "http://localhost:5000", "https://localhost:5000", "http://localhost:3001", "https://localhost:3001"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      ieNoOpen: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  // Protection XSS
  static xssProtection() {
    return (req, res, next) => {
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          if (typeof req.body[key] === 'string') {
            req.body[key] = xss(req.body[key]);
          } else if (typeof req.body[key] === 'object') {
            req.body[key] = SecurityMiddleware.sanitizeObject(req.body[key]);
          }
        });
      }
      next();
    };
  }

  // Sanitisation d'objet récursive
  static sanitizeObject(obj) {
    const sanitized = {};
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        sanitized[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = SecurityMiddleware.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    });
    return sanitized;
  }

  // Protection contre les injections NoSQL
  static nosqlProtection() {
    return mongoSanitize();
  }

  // Rate limiting avancé
  static advancedRateLimit(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requêtes par fenêtre
      message: {
        error: 'Trop de requêtes, veuillez réessayer plus tard',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      // Rate limiting par IP et par utilisateur si authentifié
      keyGenerator: (req) => {
        return req.user ? `user_${req.user.id}` : `ip_${req.ip}`;
      }
    };

    return rateLimit({ ...defaultOptions, ...options });
  }

  // CSRF Protection
  static csrfProtection() {
    return csrf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      }
    });
  }

  // Validation des entrées
  static inputValidation() {
    return (req, res, next) => {
      // Taille maximale des requêtes
      if (req.headers['content-length'] > 10 * 1024 * 1024) { // 10MB
        return res.status(413).json({ error: 'Payload trop volumineux' });
      }

      // Validation des headers
      const suspiciousHeaders = ['<script', 'javascript:', 'vbscript:'];
      const headers = JSON.stringify(req.headers);
      
      for (const suspicious of suspiciousHeaders) {
        if (headers.toLowerCase().includes(suspicious)) {
          return res.status(400).json({ error: 'Headers suspects détectés' });
        }
      }

      next();
    };
  }

  // Protection contre le brute force
  static bruteForceProtection() {
    const attempts = new Map();

    return (req, res, next) => {
      const key = req.ip;
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutes
      const maxAttempts = 5;

      // Nettoyer les anciennes tentatives
      if (attempts.has(key)) {
        attempts.set(key, attempts.get(key).filter(time => now - time < windowMs));
      }

      const userAttempts = attempts.get(key) || [];
      userAttempts.push(now);
      attempts.set(key, userAttempts);

      if (userAttempts.length >= maxAttempts) {
        return res.status(429).json({
          error: 'Trop de tentatives de connexion',
          retryAfter: Math.ceil((windowMs - (now - userAttempts[0])) / 1000)
        });
      }

      next();
    };
  }

  // Security headers additionnels
  static securityHeaders() {
    return (req, res, next) => {
      // Headers de sécurité
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      // Cache control pour les réponses sensibles
      if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }

      next();
    };
  }

  // Middleware de sécurité complet
  static completeSecurity() {
    return [
      SecurityMiddleware.helmetConfig(),
      SecurityMiddleware.xssProtection(),
      SecurityMiddleware.nosqlProtection(),
      SecurityMiddleware.inputValidation(),
      SecurityMiddleware.securityHeaders(),
      SecurityMiddleware.advancedRateLimit()
    ];
  }
}

module.exports = SecurityMiddleware;
