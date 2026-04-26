const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  deviceInfo: { type: String }, // User agent, IP, etc.
  createdAt: { type: Date, default: Date.now }
});

// Index pour le nettoyage automatique
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
