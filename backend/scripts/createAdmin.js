const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importer le modèle User
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Se connecter à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si un admin existe déjà
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Un admin existe déjà:', existingAdmin.email);
      process.exit(0);
    }

    // Créer le mot de passe hashé
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Créer l'utilisateur admin
    const admin = new User({
      name: 'Administrateur',
      email: 'admin@signature.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    await admin.save();
    console.log('✅ Utilisateur admin créé avec succès:');
    console.log('   Email: admin@signature.com');
    console.log('   Mot de passe: admin123');
    console.log('   Rôle: admin');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

createAdmin();
