const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, adminAuth } = require('../middleware/auth');
const Document = require('../models/Document');
const { calculateFileHash } = require('../crypto/crypto');
const router = express.Router();

// Configuration multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // Limite à 1 fichier par requête
  },
  fileFilter: (req, file, cb) => {
    // Validation plus stricte des types de fichiers
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-word.document.macroEnabled.12',
      'application/rtf',
      'text/plain',
      'application/vnd.oasis.opendocument.text'
    ];
    
    // Vérification extension
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.rtf', '.txt', '.odt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // Vérification nom de fichier (pas de caractères dangereux)
    const dangerousPatterns = /[<>:"|?*\x00-\x1f]/;
    if (dangerousPatterns.test(file.originalname)) {
      return cb(new Error('Nom de fichier invalide'), false);
    }
    
    // Vérification taille minimale (pas de fichiers vides)
    if (file.size === 0) {
      return cb(new Error('Fichier vide non autorisé'), false);
    }
    
    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
      console.log(`✅ File validation passed: ${file.originalname} (${file.mimetype})`);
      cb(null, true);
    } else {
      console.log(`❌ File validation failed: ${file.originalname} (${file.mimetype})`);
      cb(new Error(`Type de fichier non supporté. Types autorisés: ${allowedExtensions.join(', ')}`), false);
    }
  }
});

// Upload document
router.post('/', auth, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    
    console.log(`📄 Upload attempt: ${req.file.originalname} by ${req.user.email}`);
    
    const fileHash = await calculateFileHash(req.file.path);
    
    // Vérification doublon de hash
    const existingDoc = await Document.findOne({ originalHash: fileHash });
    if (existingDoc) {
      // Nettoyer le fichier uploadé
      fs.unlinkSync(req.file.path);
      return res.status(409).json({ 
        error: 'Ce document existe déjà',
        existingDocument: {
          id: existingDoc._id,
          name: existingDoc.name,
          owner: existingDoc.owner
        }
      });
    }
    
    const document = new Document({
      name: req.file.originalname,
      filePath: req.file.path,
      originalHash: fileHash,
      owner: req.user._id,
      size: req.file.size,
      mimeType: req.file.mimetype
    });

    await document.save();
    
    console.log(`✅ Document uploaded successfully: ${document.name}`);
    
    res.status(201).json({
      message: 'Document uploadé avec succès',
      document: {
        id: document._id,
        name: document.name,
        filePath: `/uploads/${path.basename(document.filePath)}`,
        hash: document.originalHash,
        size: document.size,
        uploadedAt: document.createdAt
      }
    });
  } catch (error) {
    // Nettoyer le fichier en cas d'erreur
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Liste documents
router.get('/', auth, async (req, res) => {
  try {
    const startTime = Date.now();
    console.log('📄 Documents route - User:', req.user.email, 'Role:', req.user.role);
    
    // Si admin, retourner tous les documents
    let documents;
    if (req.user.role === 'admin') {
      console.log('👑 Admin access - fetching all documents');
      documents = await Document.find({})
        .select('name originalHash createdAt size owner filePath') // Sélectionner seulement les champs nécessaires
        .populate('owner', 'name email')
        .lean() // Utiliser lean pour meilleure performance
        .sort({ createdAt: -1 });
    } else {
      console.log('👤 User access - fetching own documents');
      documents = await Document.find({ owner: req.user._id })
        .select('name originalHash createdAt size owner filePath')
        .populate('owner', 'name email')
        .lean()
        .sort({ createdAt: -1 });
    }
    
    const duration = Date.now() - startTime;
    console.log(`📊 Found ${documents.length} documents in ${duration}ms`);
    res.json(documents);
  } catch (error) {
    console.error('❌ Error in documents route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route admin pour voir tous les documents
router.get('/admin/all', auth, async (req, res) => {
  try {
    console.log('🔐 Admin route accessed - User:', req.user.email, 'Role:', req.user.role);
    
    // Vérification manuelle du rôle admin
    if (req.user.role !== 'admin') {
      console.log('❌ Access denied - User is not admin');
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const documents = await Document.find({})
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    
    console.log('📄 Found documents:', documents.length);
    res.json(documents);
  } catch (error) {
    console.error('❌ Error in admin route:', error);
    res.status(500).json({ error: error.message });
  }
});

// Partager document - générer liens pour les signataires
router.get('/:id/share', auth, async (req, res) => {
  try {
    console.log(`📄 Share document - User: ${req.user.email}, Doc ID: ${req.params.id}`);
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log(`❌ Access denied - User ${req.user.email} not owner of document ${req.params.id}`);
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    // Récupérer les signatures existantes pour ce document
    const Signature = require('../models/Signature');
    const signatures = await Signature.find({ document: req.params.id })
      .populate('user', 'name email');
    
    // Générer les URLs de partage
    const shareUrls = signatures.map(sig => {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const signUrl = `${baseUrl}/sign/${document._id}?user=${sig.user._id}&token=${btoa(`${sig.user.email}:${document._id}`)}`;
      
      return {
        email: sig.user.email,
        name: sig.user.name,
        signUrl,
        signed: !!sig.signedAt,
        signedAt: sig.signedAt
      };
    });
    
    // Si aucune signature existante, créer une URL pour le propriétaire
    if (shareUrls.length === 0) {
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const signUrl = `${baseUrl}/sign/${document._id}?user=${req.user._id}&token=${btoa(`${req.user.email}:${document._id}`)}`;
      
      shareUrls.push({
        email: req.user.email,
        name: req.user.name,
        signUrl,
        signed: false,
        signedAt: null
      });
    }
    
    console.log(`✅ Share URLs generated for document ${req.params.id} - ${shareUrls.length} URLs`);
    res.json(shareUrls);
    
  } catch (error) {
    console.error('❌ Share document error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Supprimer document
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`🗑️ Delete document - User: ${req.user.email}, Doc ID: ${req.params.id}`);
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    // Supprimer le fichier physique
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
      console.log(`🗑️ File deleted: ${document.filePath}`);
    }
    
    // Supprimer les signatures associées
    const Signature = require('../models/Signature');
    await Signature.deleteMany({ document: req.params.id });
    
    // Supprimer le document
    await Document.findByIdAndDelete(req.params.id);
    
    console.log(`✅ Document deleted: ${req.params.id}`);
    res.json({ message: 'Document supprimé avec succès' });
    
  } catch (error) {
    console.error('❌ Delete document error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Renommer document
router.put('/:id', auth, async (req, res) => {
  try {
    console.log(`✏️ Rename document - User: ${req.user.email}, Doc ID: ${req.params.id}`);
    
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nom du document requis' });
    }
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document non trouvé' });
    }
    
    // Vérifier que l'utilisateur est le propriétaire ou admin
    if (document.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    document.name = name.trim();
    document.updatedAt = new Date();
    await document.save();
    
    console.log(`✅ Document renamed: ${req.params.id} -> ${name}`);
    res.json({ 
      message: 'Document renommé avec succès',
      document: {
        id: document._id,
        name: document.name,
        updatedAt: document.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Rename document error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
