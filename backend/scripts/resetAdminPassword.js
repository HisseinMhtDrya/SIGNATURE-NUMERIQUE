const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importer le modèle User
const User = require('../models/User');

const resetAdminPassword = async () => {
  try {
    // Se connecter à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver l'utilisateur admin
    const admin = await User.findOne({ email: 'hisseinmhtdrya@gmail.com' });
    if (!admin) {
      console.log('❌ Admin non trouvé');
      process.exit(0);
    }

    // Créer le nouveau mot de passe hashé
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Mettre à jour le mot de passe
    admin.password = hashedPassword;
    admin.role = 'admin'; // S'assurer que c'est bien un admin
    admin.isActive = true;
    admin.emailVerified = true;

    await admin.save();
    console.log('✅ Mot de passe admin réinitialisé avec succès:');
    console.log('   Email: hysseinmhtdrya@gmail.com');
    console.log('   Nouveau mot de passe: admin123');
    console.log('   Rôle: admin');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

resetAdminPassword();
