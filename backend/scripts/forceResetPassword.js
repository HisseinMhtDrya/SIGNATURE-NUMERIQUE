const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  publicKey: { type: String },
  privateKey: { type: String },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  totpEnabled: { type: Boolean, default: false },
  totpSecret: { type: String },
  googleId: { type: String },
  googleAccessToken: { type: String },
  googleRefreshToken: { type: String },
  githubId: { type: String },
  githubAccessToken: { type: String },
  githubRefreshToken: { type: String },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  customPermissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ajouter la méthode comparePassword
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', userSchema);

const forceResetPassword = async () => {
  try {
    // Se connecter à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('✅ Nouveau hash créé:', hashedPassword.substring(0, 50) + '...');

    // Mettre à jour directement avec updateOne pour contourner le middleware
    const result = await User.updateOne(
      { email: 'hisseinmhtdrya@gmail.com' },
      { 
        password: hashedPassword,
        role: 'admin',
        isActive: true
      }
    );

    console.log('✅ Mise à jour effectuée:', result.modifiedCount, 'document(s) modifié(s)');

    // Vérifier le nouveau mot de passe
    const admin = await User.findOne({ email: 'hisseinmhtdrya@gmail.com' });
    if (admin) {
      const isValid = await admin.comparePassword('admin123');
      console.log('✅ Test du nouveau mot de passe:', isValid ? '✅ Valide' : '❌ Invalide');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

forceResetPassword();
