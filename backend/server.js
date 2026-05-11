const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const SecurityMiddleware = require('./middleware/security');
const { errorHandler, notFound, unhandledRejectionHandler, uncaughtExceptionHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const signatureRoutes = require('./routes/signatures');
const adminRoutes = require('./routes/admin');
const totpRoutes = require('./routes/totp');
const permissionsRoutes = require('./routes/permissions');
const refreshRoutes = require('./routes/refresh');
const securityRoutes = require('./routes/security');
// const intrusionRoutes = require('./routes/intrusion');
const mlRoutes = require('./routes/ml');
const testRoutes = require('./routes/test');
const workflowRoutes = require('./routes/workflow');

const app = express();

// Logger toutes les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

// 🔒 CORS doit être AVANT les middlewares de sécurité
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://localhost:3000', 
    'http://localhost:3001', 
    'https://localhost:3001', 
    'http://localhost:5000', 
    'https://localhost:5000',
    process.env.FRONTEND_URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔒 Sécurité OWASP Top 10
app.use(SecurityMiddleware.completeSecurity());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/totp', totpRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/refresh', refreshRoutes);
app.use('/api/security', securityRoutes);
// app.use('/api/intrusion', intrusionRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/test', testRoutes);
// Routes protégées (nécessitent authentification)
app.use('/api/workflow', workflowRoutes.router);
// Routes publiques pour les invités (doivent être APRÈS les routes protégées)
app.use('/api/workflow', workflowRoutes.publicRouter);

// 🚨 Gestion des erreurs (doit être APRÈS les routes)
app.use(notFound);
app.use(errorHandler);

// 🚨 Gestion des erreurs globales
process.on('unhandledRejection', unhandledRejectionHandler);
process.on('uncaughtException', uncaughtExceptionHandler);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ MongoDB erreur:', err));

const PORT = process.env.PORT || 5000;

// Serveur HTTP simple - Render gère automatiquement le HTTPS
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
