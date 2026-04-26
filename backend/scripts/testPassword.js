const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importer le modèle User
const User = require('../models/User');

const testPassword = async () => {
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

    console.log('✅ Admin trouvé:', admin.email);
    console.log('   Hash actuel:', admin.password.substring(0, 50) + '...');

    // Tester différents mots de passe
    const testPasswords = ['admin123', '12345678', 'password'];
    
    for (const testPwd of testPasswords) {
      const isValid = await admin.comparePassword(testPwd);
      console.log(`   Mot de passe "${testPwd}": ${isValid ? '✅ Valide' : '❌ Invalide'}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

testPassword();
