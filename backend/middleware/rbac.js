const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

class RBACMiddleware {
  // Vérifier si l'utilisateur a une permission spécifique
  static async checkPermission(userId, resource, action) {
    try {
      const user = await User.findById(userId).populate('roles').populate('customPermissions');
      
      // Vérifier les permissions personnalisées d'abord
      const customPerms = user.customPermissions.filter(perm => 
        perm.resource === resource && perm.action === action
      );
      if (customPerms.length > 0) return true;
      
      // Vérifier les permissions via les rôles
      for (const role of user.roles) {
        const populatedRole = await Role.findById(role._id).populate('permissions');
        const rolePerms = populatedRole.permissions.filter(perm => 
          perm.resource === resource && perm.action === action
        );
        if (rolePerms.length > 0) return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur RBAC:', error);
      return false;
    }
  }

  // Middleware pour vérifier une permission
  static requirePermission(resource, action) {
    return async (req, res, next) => {
      try {
        const userId = req.user.id;
        const hasPermission = await RBACMiddleware.checkPermission(userId, resource, action);
        
        if (!hasPermission) {
          return res.status(403).json({ 
            error: 'Permission refusée',
            required: { resource, action }
          });
        }
        
        next();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
  }

  // Middleware pour vérifier un niveau de rôle minimum
  static requireRole(minLevel) {
    return async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id).populate('roles');
        
        const maxLevel = Math.max(...user.roles.map(role => role.level));
        
        if (maxLevel < minLevel) {
          return res.status(403).json({ 
            error: 'Rôle insuffisant',
            required: minLevel,
            current: maxLevel
          });
        }
        
        next();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };
  }

  // Obtenir toutes les permissions d'un utilisateur
  static async getUserPermissions(userId) {
    try {
      const user = await User.findById(userId).populate({
        path: 'roles',
        populate: 'permissions'
      }).populate('customPermissions');
      
      const permissions = new Set();
      
      // Ajouter les permissions personnalisées
      user.customPermissions.forEach(perm => {
        permissions.add(`${perm.resource}:${perm.action}`);
      });
      
      // Ajouter les permissions des rôles
      user.roles.forEach(role => {
        role.permissions.forEach(perm => {
          permissions.add(`${perm.resource}:${perm.action}`);
        });
      });
      
      return Array.from(permissions);
    } catch (error) {
      console.error('Erreur getUserPermissions:', error);
      return [];
    }
  }
}

module.exports = RBACMiddleware;
