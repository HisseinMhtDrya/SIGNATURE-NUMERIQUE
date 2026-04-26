const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

class TokenService {
  // Générer un access token
  static generateAccessToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  // Générer un refresh token
  static async generateRefreshToken(userId, deviceInfo = null) {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours
    
    const refreshToken = new RefreshToken({
      token,
      user: userId,
      expiresAt,
      deviceInfo
    });
    
    await refreshToken.save();
    return token;
  }

  // Rafraîchir les tokens
  static async refreshTokens(refreshTokenString) {
    try {
      // Trouver le refresh token
      const refreshToken = await RefreshToken.findOne({
        token: refreshTokenString,
        isRevoked: false,
        expiresAt: { $gt: new Date() }
      }).populate('user');

      if (!refreshToken) {
        throw new Error('Refresh token invalide ou expiré');
      }

      // Générer nouveaux tokens
      const accessToken = this.generateAccessToken(refreshToken.user._id);
      const newRefreshToken = await this.generateRefreshToken(
        refreshToken.user._id,
        refreshToken.deviceInfo
      );

      // Révoquer l'ancien refresh token
      refreshToken.isRevoked = true;
      await refreshToken.save();

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: refreshToken.user._id,
          name: refreshToken.user.name,
          email: refreshToken.user.email,
          role: refreshToken.user.role
        }
      };
    } catch (error) {
      throw new Error('Échec du rafraîchissement des tokens');
    }
  }

  // Révoquer tous les refresh tokens d'un utilisateur
  static async revokeAllUserTokens(userId) {
    await RefreshToken.updateMany(
      { user: userId, isRevoked: false },
      { isRevoked: true }
    );
  }

  // Révoquer un refresh token spécifique
  static async revokeToken(tokenString) {
    await RefreshToken.updateOne(
      { token: tokenString },
      { isRevoked: true }
    );
  }

  // Nettoyer les tokens expirés
  static async cleanupExpiredTokens() {
    await RefreshToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }

  // Obtenir les sessions actives d'un utilisateur
  static async getUserActiveSessions(userId) {
    const tokens = await RefreshToken.find({
      user: userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    return tokens.map(token => ({
      id: token._id,
      deviceInfo: token.deviceInfo,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt
    }));
  }

  // Vérifier un access token
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

module.exports = TokenService;
