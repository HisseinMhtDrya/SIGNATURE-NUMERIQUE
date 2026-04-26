const express = require('express');
const Permission = require('../models/Permission');
const Role = require('../models/Role');
const { auth, adminAuth } = require('../middleware/auth');
const RBACMiddleware = require('../middleware/rbac');
const router = express.Router();

// Créer une permission (admin seulement)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, resource, action, category } = req.body;
    
    const permission = new Permission({
      name,
      description,
      resource,
      action,
      category
    });
    
    await permission.save();
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lister toutes les permissions (admin seulement)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ resource: 1, action: 1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un rôle (admin seulement)
router.post('/roles', auth, adminAuth, async (req, res) => {
  try {
    const { name, description, level, permissions } = req.body;
    
    const role = new Role({
      name,
      description,
      level,
      permissions
    });
    
    await role.save();
    await role.populate('permissions');
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lister tous les rôles (admin seulement)
router.get('/roles', auth, adminAuth, async (req, res) => {
  try {
    const roles = await Role.find().populate('permissions').sort({ level: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assigner un rôle à un utilisateur (admin seulement)
router.post('/users/:userId/roles/:roleId', auth, adminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const { userId, roleId } = req.params;
    
    const user = await User.findById(userId);
    const role = await Role.findById(roleId);
    
    if (!user || !role) {
      return res.status(404).json({ error: 'Utilisateur ou rôle non trouvé' });
    }
    
    user.roles.push(roleId);
    await user.save();
    
    res.json({ message: 'Rôle assigné avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les permissions d'un utilisateur
router.get('/users/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier que l'utilisateur peut voir ses propres permissions ou qu'il est admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    
    const permissions = await RBACMiddleware.getUserPermissions(userId);
    res.json({ permissions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialiser les permissions par défaut (admin seulement)
router.post('/init', auth, adminAuth, async (req, res) => {
  try {
    // Permissions de base
    const basicPermissions = [
      { name: 'documents:read', description: 'Lire ses documents', resource: 'documents', action: 'read', category: 'basic' },
      { name: 'documents:create', description: 'Créer des documents', resource: 'documents', action: 'create', category: 'basic' },
      { name: 'signatures:create', description: 'Signer des documents', resource: 'signatures', action: 'create', category: 'basic' },
      { name: 'signatures:read', description: 'Voir les signatures', resource: 'signatures', action: 'read', category: 'basic' }
    ];
    
    // Permissions avancées
    const advancedPermissions = [
      { name: 'documents:update', description: 'Modifier des documents', resource: 'documents', action: 'update', category: 'advanced' },
      { name: 'documents:delete', description: 'Supprimer des documents', resource: 'documents', action: 'delete', category: 'advanced' }
    ];
    
    // Permissions admin
    const adminPermissions = [
      { name: 'users:read', description: 'Voir les utilisateurs', resource: 'users', action: 'read', category: 'admin' },
      { name: 'users:update', description: 'Modifier les utilisateurs', resource: 'users', action: 'update', category: 'admin' },
      { name: 'users:delete', description: 'Supprimer les utilisateurs', resource: 'users', action: 'delete', category: 'admin' },
      { name: 'admin:read', description: 'Voir les statistiques', resource: 'admin', action: 'read', category: 'admin' }
    ];
    
    // Créer les permissions
    const allPermissions = [...basicPermissions, ...advancedPermissions, ...adminPermissions];
    const createdPermissions = await Permission.insertMany(allPermissions);
    
    // Créer les rôles par défaut
    const userRole = new Role({
      name: 'user',
      description: 'Utilisateur de base',
      level: 1,
      permissions: createdPermissions.filter(p => p.category === 'basic').map(p => p._id)
    });
    
    const moderatorRole = new Role({
      name: 'moderator',
      description: 'Modérateur',
      level: 2,
      permissions: createdPermissions.filter(p => ['basic', 'advanced'].includes(p.category)).map(p => p._id)
    });
    
    const adminRole = new Role({
      name: 'admin',
      description: 'Administrateur',
      level: 3,
      permissions: createdPermissions.map(p => p._id)
    });
    
    await userRole.save();
    await moderatorRole.save();
    await adminRole.save();
    
    res.json({ 
      message: 'Permissions et rôles initialisés avec succès',
      permissions: createdPermissions.length,
      roles: 3
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
