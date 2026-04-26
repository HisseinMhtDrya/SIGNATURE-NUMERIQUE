const mongoose = require('mongoose');
require('dotenv').config();

// Importer le modèle User
const User = require('../models/User');

const listAdmins = async () => {
  try {
    // Se connecter à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver tous les utilisateurs admin
    const admins = await User.find({ role: 'admin' });
    
    if (admins.length === 0) {
      console.log('❌ Aucun admin trouvé');
    } else {
      console.log(`✅ ${admins.length} admin(s) trouvé(s):`);
      admins.forEach((admin, index) => {
        console.log(`   ${index + 1}. Email: ${admin.email}`);
        console.log(`      Nom: ${admin.name}`);
        console.log(`      Rôle: ${admin.role}`);
        console.log(`      Actif: ${admin.isActive}`);
        console.log(`      Email vérifié: ${admin.emailVerified}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

listAdmins();
