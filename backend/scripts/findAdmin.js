const mongoose = require('mongoose');
require('dotenv').config();

// Importer le modèle User
const User = require('../models/User');

const findAdmin = async () => {
  try {
    // Se connecter à MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver tous les utilisateurs avec leur email exact
    const users = await User.find({});
    
    console.log(`✅ ${users.length} utilisateur(s) trouvé(s):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. Email: "${user.email}"`);
      console.log(`      Nom: ${user.name}`);
      console.log(`      Rôle: ${user.role}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

findAdmin();
