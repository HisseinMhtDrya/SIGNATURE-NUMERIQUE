const express = require('express');
const { auth } = require('../middleware/auth');
const Document = require('../models/Document');
const Signature = require('../models/Signature');
const { calculateFileHash, signData, verifySignature } = require('../crypto/crypto');
const router = express.Router();

// Récupérer toutes les signatures (pour admin)
router.get('/', auth, async (req, res) => {
  try {
    const signatures = await Signature.find()
      .populate('user', 'name email')
      .populate('document', 'name')
      .sort({ signedAt: -1 });
    
    res.json(signatures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Signer un document
router.post('/:documentId/sign', auth, async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // Vérifier document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }

    // Recalculer hash actuel
    const currentHash = await calculateFileHash(document.filePath);
    
    // Vérifier intégrité avant signature
    if (currentHash !== document.originalHash) {
      return res.status(400).json({ 
        error: 'Document modifié ! Impossible de signer.',
        integrity: false 
      });
    }

    // Signer avec clé privée utilisateur
    const signatureValue = signData(currentHash, req.user.privateKey);
    
    const signature = new Signature({
      document: document._id,
      user: req.user._id,
      signatureValue: signatureValue.toString('base64'),
      documentHashAtSigning: currentHash,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await signature.save();
    
    res.status(201).json({
      message: 'Document signé avec succès',
      signature: {
        id: signature._id,
        signedAt: signature.signedAt,
        hash: signature.documentHashAtSigning
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vérifier signature
router.post('/:documentId/verify/:signatureId', auth, async (req, res) => {
  try {
    const { documentId, signatureId } = req.params;
    
    const document = await Document.findById(documentId);
    const signature = await Signature.findById(signatureId).populate('user');
    
    if (!document || !signature) {
      return res.status(404).json({ error: 'Document ou signature non trouvée' });
    }

    // Recalculer hash actuel
    const currentHash = await calculateFileHash(document.filePath);
    
    // Vérifier intégrité document
    const isDocumentValid = currentHash === document.originalHash;
    
    // Vérifier signature
    const isSignatureValid = verifySignature(
      signature.documentHashAtSigning,
      signature.signatureValue,
      signature.user.publicKey
    );

    res.json({
      document: {
        integrity: isDocumentValid,
        currentHash,
        originalHash: document.originalHash
      },
      signature: {
        valid: isSignatureValid,
        signer: signature.user.name,
        signedAt: signature.signedAt,
        ipAddress: signature.ipAddress
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Historique signatures d'un document
router.get('/:documentId/history', auth, async (req, res) => {
  try {
    const signatures = await Signature.find({ document: req.params.documentId })
      .populate('user', 'name email')
      .sort({ signedAt: -1 });
    
    res.json(signatures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
