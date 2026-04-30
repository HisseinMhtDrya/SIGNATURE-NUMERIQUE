const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { auth } = require('../middleware/auth');

// Routes publiques pour les invités (sans authentification)
// 2️⃣ Vérifier le code OTP (publique pour les invités)
router.post('/verify-otp', workflowController.verifyOTP);

// 3️⃣ Signer le document (publique pour les invités)
router.post('/sign', workflowController.signDocument);

// 4️⃣ Rejeter la signature (publique pour les invités)
router.post('/reject', workflowController.rejectSignature);

// 6️⃣ Obtenir les détails d'un workflow (publique pour les invités)
router.get('/:id', workflowController.getWorkflow);

// Routes protégées (nécessitent authentification)
router.use(auth);

// 1️⃣ Créer un workflow de signature
router.post('/create', workflowController.createWorkflow);

// 5️⃣ Renvoyer l'OTP
router.post('/resend-otp', workflowController.resendOTP);

// 7️⃣ Lister les workflows de l'utilisateur connecté
router.get('/', workflowController.getUserWorkflows);

module.exports = router;
