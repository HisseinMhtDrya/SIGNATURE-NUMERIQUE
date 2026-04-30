const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: false },
  publicKey: { type: String },
  privateKey: { type: String },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  // Champs 2FA
  totpEnabled: { type: Boolean, default: false },
  totpSecret: { type: String },
  // Champs OTP pour connexion
  otp: { type: String },
  otpExpiration: { type: Date },
  otpAttempts: { type: Number, default: 0 },
  isOtpVerified: { type: Boolean, default: false },
  // Champs OAuth
  googleId: { type: String },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  githubId: { type: String },
  githubAccessToken: { type: String },
  githubRefreshToken: { type: String },
  // Champs RBAC
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  customPermissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Méthodes admin
userSchema.methods.toAdminJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    loginCount: this.loginCount,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
