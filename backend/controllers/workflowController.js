const SignatureWorkflow = require('../models/SignatureWorkflow');
const Document = require('../models/Document');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Transporter Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Générer OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// 1️⃣ CRÉER WORKFLOW
exports.createWorkflow = async (req, res) => {
  try {
    console.log(`🚀 Création workflow par ${req.user.email}`);
    
    const { documentId, emails } = req.body; // ["user1@email.com", "user2@email.com"]

    if (!documentId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Document ID et emails requis' });
    }

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire du document ou admin
    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Valider les emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: `Email invalide: ${email}` });
      }
    }

    const steps = emails.map((email, index) => ({
      email: email.toLowerCase().trim(),
      order: index + 1,
      userId: null // Sera mis à jour lors de la première connexion
    }));

    const workflow = new SignatureWorkflow({
      documentId,
      steps,
      currentStep: 0,
      status: 'pending',
      createdBy: req.user._id
    });

    await workflow.save();
    
    // Envoyer l'invitation au premier signataire
    await sendInvite(workflow._id, steps[0].email);
    
    console.log(`✅ Workflow créé: ${workflow._id} pour document ${documentId}`);
    
    res.json({ 
      success: true, 
      workflowId: workflow._id,
      message: 'Workflow créé et première invitation envoyée',
      totalSteps: emails.length
    });
  } catch (error) {
    console.error('❌ Erreur création workflow:', error);
    res.status(500).json({ error: error.message });
  }
};

// 2️⃣ ENVOYER INVITATION
const sendInvite = async (workflowId, email) => {
  try {
    console.log(`📧 Envoi invitation à ${email} pour workflow ${workflowId}`);
    
    const workflow = await SignatureWorkflow.findById(workflowId).populate('documentId');
    const step = workflow.steps[workflow.currentStep];
    
    const otp = generateOTP();
    step.otpCode = otp;
    step.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    await workflow.save();

    // Vérifier si les configurations email sont présentes
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️ CONFIGURATION EMAIL MANQUANTE');
      console.log('='.repeat(60));
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Code OTP: ${otp}`);
      console.log(`⏰ Valide 5 minutes`);
      console.log(`🔗 Lien: http://localhost:3000/guest-workflow/${workflowId}`);
      console.log('❌ Configurez EMAIL_USER et EMAIL_PASS dans .env');
      console.log('='.repeat(60) + '\n');
      return;
    }

    // Mode production : envoyer l'email
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `📄 Signature requise - Document ${workflow.documentId.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">📄 Signature requise</h2>
          <p>Bonjour,</p>
          <p>Vous êtes invité à signer le document <strong>${workflow.documentId.name}</strong>.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #28a745;">🔐 Code de vérification OTP</h3>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 3px; color: #007bff;">${otp}</p>
            <p style="color: #6c757d;">Ce code est valide pendant 5 minutes.</p>
          </div>
          <p>
            <a href="${baseUrl}/guest-workflow/${workflowId}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
               Signer maintenant
            </a>
          </p>
          <hr style="margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            Si vous n'avez pas demandé cette signature, veuillez ignorer cet email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${email}`);
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    // En mode développement, ne pas bloquer le workflow si l'email échoue
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Mode développement: workflow continuera malgré l\'erreur email');
      return;
    }
    throw error;
  }
};

// 3️⃣ VÉRIFIER OTP
exports.verifyOTP = async (req, res) => {
  try {
    console.log(`🔐 Vérification OTP pour workflow ${req.body.workflowId}`);
    
    const { workflowId, otp } = req.body;

    if (!workflowId || !otp) {
      return res.status(400).json({ error: 'Workflow ID et OTP requis' });
    }

    const workflow = await SignatureWorkflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé' });
    }

    const step = workflow.steps[workflow.currentStep];
    if (!step) {
      return res.status(400).json({ error: 'Aucune étape en cours' });
    }

    if (!step.otpCode || step.otpExpires < new Date()) {
      return res.status(400).json({ error: 'OTP expiré ou invalide' });
    }

    if (step.otpCode !== otp) {
      return res.status(400).json({ error: 'OTP incorrect' });
    }

    // Mettre à jour le statut du workflow
    if (workflow.status === 'pending') {
      workflow.status = 'in_progress';
    }
    
    step.status = 'pending';
    await workflow.save();

    console.log(`✅ OTP validé pour ${step.email}`);

    res.json({ 
      success: true, 
      message: 'OTP validé, vous pouvez signer',
      userCanSign: true,
      workflowStatus: workflow.status,
      currentStep: workflow.currentStep + 1,
      totalSteps: workflow.steps.length
    });
  } catch (error) {
    console.error('❌ Erreur vérification OTP:', error);
    res.status(500).json({ error: error.message });
  }
};

// 4️⃣ SIGNER
exports.signDocument = async (req, res) => {
  try {
    console.log(`✍️ Signature du document pour workflow ${req.body.workflowId}`);
    
    const { workflowId, signatureData } = req.body; // signatureData = base64

    if (!workflowId || !signatureData) {
      return res.status(400).json({ error: 'Workflow ID et signature requis' });
    }

    const workflow = await SignatureWorkflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé' });
    }

    const step = workflow.steps[workflow.currentStep];
    if (!step) {
      return res.status(400).json({ error: 'Aucune étape en cours' });
    }

    // Enregistrer la signature
    step.status = 'signed';
    step.signedAt = new Date();
    step.signatureData = signatureData;
    step.otpCode = null; // Nettoyer l'OTP
    step.otpExpires = null;

    workflow.currentStep++;

    // Vérifier si le workflow est terminé
    if (workflow.currentStep >= workflow.steps.length) {
      workflow.status = 'completed';
      workflow.completedAt = new Date();
    }

    await workflow.save();

    // Envoyer l'invitation au signataire suivant
    if (workflow.status === 'in_progress') {
      const nextStep = workflow.steps[workflow.currentStep];
      await sendInvite(workflowId, nextStep.email);
    }

    console.log(`✅ Signature enregistrée pour ${step.email}`);

    res.json({ 
      success: true, 
      workflow: {
        id: workflow._id,
        status: workflow.status,
        currentStep: workflow.currentStep,
        totalSteps: workflow.steps.length,
        completedAt: workflow.completedAt
      },
      nextStep: workflow.status === 'in_progress' ? workflow.currentStep + 1 : null,
      message: workflow.status === 'completed' ? 'Workflow terminé !' : 'Signature enregistrée'
    });
  } catch (error) {
    console.error('❌ Erreur signature document:', error);
    res.status(500).json({ error: error.message });
  }
};

// 5️⃣ REJETER SIGNATURE
exports.rejectSignature = async (req, res) => {
  try {
    console.log(`❌ Rejet signature pour workflow ${req.body.workflowId}`);
    
    const { workflowId, rejectionReason } = req.body;

    if (!workflowId) {
      return res.status(400).json({ error: 'Workflow ID requis' });
    }

    const workflow = await SignatureWorkflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé' });
    }

    const step = workflow.steps[workflow.currentStep];
    if (!step) {
      return res.status(400).json({ error: 'Aucune étape en cours' });
    }

    step.status = 'rejected';
    step.rejectionReason = rejectionReason || 'Signature refusée';
    step.signedAt = new Date();
    step.otpCode = null;
    step.otpExpires = null;

    workflow.status = 'cancelled';
    await workflow.save();

    console.log(`❌ Signature rejetée par ${step.email}: ${rejectionReason}`);

    res.json({ 
      success: true, 
      message: 'Signature rejetée et workflow annulé',
      rejectionReason: step.rejectionReason
    });
  } catch (error) {
    console.error('❌ Erreur rejet signature:', error);
    res.status(500).json({ error: error.message });
  }
};

// 6️⃣ GET WORKFLOW STATUS
exports.getWorkflow = async (req, res) => {
  try {
    console.log(`📋 Récupération workflow ${req.params.id}`);
    
    const workflow = await SignatureWorkflow.findById(req.params.id)
      .populate('documentId', 'name filePath')
      .populate('createdBy', 'name email')
      .populate('steps.userId', 'name email');

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé' });
    }

    res.json(workflow);
  } catch (error) {
    console.error('❌ Erreur récupération workflow:', error);
    res.status(500).json({ error: error.message });
  }
};

// 7️⃣ LISTE DES WORKFLOWS D'UN UTILISATEUR
exports.getUserWorkflows = async (req, res) => {
  try {
    console.log(`📋 Récupération workflows pour ${req.user.email}`);
    
    const workflows = await SignatureWorkflow.find({
      'steps.email': req.user.email
    })
    .populate('documentId', 'name')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

    res.json(workflows);
  } catch (error) {
    console.error('❌ Erreur récupération workflows utilisateur:', error);
    res.status(500).json({ error: error.message });
  }
};

// 8️⃣ RENVOYER OTP
exports.resendOTP = async (req, res) => {
  try {
    console.log(`🔄 Renvoi OTP pour workflow ${req.body.workflowId}`);
    
    const { workflowId } = req.body;

    const workflow = await SignatureWorkflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow non trouvé' });
    }

    const step = workflow.steps[workflow.currentStep];
    if (!step) {
      return res.status(400).json({ error: 'Aucune étape en cours' });
    }

    await sendInvite(workflowId, step.email);

    res.json({ 
      success: true, 
      message: 'Nouvel OTP envoyé',
      email: step.email
    });
  } catch (error) {
    console.error('❌ Erreur renvoi OTP:', error);
    res.status(500).json({ error: error.message });
  }
};
