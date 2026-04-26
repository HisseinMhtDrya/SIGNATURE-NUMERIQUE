const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');

    // Mettre à jour le compte hisseinmhtdrya@gmail.com en admin
    const result = await User.updateOne(
      { email: 'hisseinmhtdrya@gmail.com' },
      { role: 'admin' }
    );

    if (result.matchedCount > 0) {
      console.log('✅ Compte hisseinmhtdrya@gmail.com est maintenant administrateur');
      
      // Vérifier le compte
      const user = await User.findOne({ email: 'hisseinmhtdrya@gmail.com' });
      console.log('Informations du compte:', {
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } else {
      console.log('❌ Compte non trouvé');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur:', error);
    mongoose.connection.close();
  }
}

makeAdmin();
