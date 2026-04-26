const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Document = require('../models/Document');
const Signature = require('../models/Signature');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Middleware admin uniquement
router.use(auth);
router.use(adminAuth);

// DASHBOARD ADMIN - Statistiques globales
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'admin' }),
      Document.countDocuments(),
      Signature.countDocuments(),
      User.countDocuments({ isActive: false })
    ]);

    const recentActivity = await Signature.find()
      .populate('user', 'name email')
      .populate('document', 'name')
      .sort({ signedAt: -1 })
      .limit(10);

    res.json({
      usersActive: stats[0],
      admins: stats[1],
      documents: stats[2],
      signatures: stats[3],
      usersBlocked: stats[4],
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GESTION UTILISATEURS COMPLET
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role, active } = req.query;
    const filter = {};
    
    if (role) filter.role = role;
    if (active !== undefined) filter.isActive = active === 'true';

    const users = await User.find(filter)
      .select('-password -privateKey')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users: users.map(u => u.toAdminJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recherche utilisateur
router.get('/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      role: 'user'
    })
    .select('-password -privateKey')
    .limit(20);

    res.json(users.map(u => u.toAdminJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer utilisateur (admin crée user)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    
    const existingUser = await User.findOne({ 
      $or: [{ email }, { name }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Utilisateur existant' });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({
      message: 'Utilisateur créé',
      user: user.toAdminJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modifier utilisateur
router.put('/users/:id', async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).select('-password -privateKey');

    res.json({
      message: 'Utilisateur mis à jour',
      user: user.toAdminJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bloquer/Débloquer utilisateur
router.patch('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `Utilisateur ${user.isActive ? 'activé' : 'bloqué'}`,
      user: user.toAdminJSON()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GESTION DOCUMENTS (Admin voit tout)
router.get('/documents', async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RAPPORTS & AUDIT
router.get('/audit/signatures', async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    let filter = {};

    if (startDate || endDate) {
      filter.signedAt = {};
      if (startDate) filter.signedAt.$gte = new Date(startDate);
      if (endDate) filter.signedAt.$lte = new Date(endDate);
    }
    if (userId) filter.user = userId;

    const signatures = await Signature.find(filter)
      .populate('user', 'name email')
      .populate('document', 'name')
      .sort({ signedAt: -1 });

    res.json(signatures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GÉNÉRER ADMIN PREMIER UTILISATEUR
router.post('/setup-admin', async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount > 0) {
      return res.status(400).json({ error: 'Admin existe déjà' });
    }

    const { name, email, password } = req.body;
    const admin = new User({ name, email, password, role: 'admin' });
    await admin.save();

    res.status(201).json({
      message: 'Premier admin créé',
      admin: { id: admin._id, name: admin.name, email: admin.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
