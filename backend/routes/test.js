const express = require('express');
const Document = require('../models/Document');
const Signature = require('../models/Signature');
const router = express.Router();

// Route de test sans authentification pour vérifier les documents
router.get('/documents', async (req, res) => {
  try {
    console.log('🧪 Test route - Fetching all documents without auth');
    
    const documents = await Document.find({})
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('🧪 Test route - Found documents:', documents.length);
    res.json(documents);
  } catch (error) {
    console.error('🧪 Test route - Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route de test sans authentification pour les signatures
router.get('/signatures', async (req, res) => {
  try {
    console.log('🧪 Test route - Fetching all signatures without auth');
    
    const signatures = await Signature.find()
      .populate('user', 'name email')
      .populate('document', 'name')
      .sort({ signedAt: -1 });
    
    console.log('🧪 Test route - Found signatures:', signatures.length);
    res.json(signatures);
  } catch (error) {
    console.error('🧪 Test route - Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
