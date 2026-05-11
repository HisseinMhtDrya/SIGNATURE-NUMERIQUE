const express = require('express');
const router = express.Router();
const publicRouter = express.Router();
const workflowController = require('../controllers/workflowController');
const { auth } = require('../middleware/auth');

// Routes protégées (nécessitent authentification)
router.use(auth);

// 1️⃣ Créer un workflow de signature
router.post('/create', workflowController.createWorkflow);

// 5️⃣ Renvoyer l'OTP
router.post('/resend-otp', workflowController.resendOTP);

// 7️⃣ Lister les workflows de l'utilisateur connecté
router.get('/', workflowController.getUserWorkflows);

// 9️⃣ Lister les workflows créés par l'utilisateur (avec historique)
router.get('/created', workflowController.getCreatedWorkflows);

// Routes publiques pour les invités (sans authentification)
// 6️⃣ Obtenir les détails d'un workflow (publique pour les invités)
publicRouter.get('/:id', workflowController.getWorkflow);

// 2️⃣ Vérifier le code OTP (publique pour les invités)
publicRouter.post('/verify-otp', workflowController.verifyOTP);

// 3️⃣ Signer le document (publique pour les invités)
publicRouter.post('/sign', workflowController.signDocument);

// 4️⃣ Rejeter la signature (publique pour les invités)
publicRouter.post('/reject', workflowController.rejectSignature);

module.exports = { router, publicRouter };
