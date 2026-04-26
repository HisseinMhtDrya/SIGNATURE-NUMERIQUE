const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/User');

const checkToken = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver l'utilisateur admin
    const admin = await User.findOne({ email: 'hisseinmhtdrya@gmail.com' });
    if (!admin) {
      console.log('❌ Admin non trouvé');
      process.exit(0);
    }

    console.log('✅ Admin trouvé:', admin.email);
    console.log('   ID:', admin._id);
    console.log('   Rôle:', admin.role);

    // Générer un nouveau token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Nouveau token généré:');
    console.log('   Token:', token);
    console.log('   Header: Authorization: Bearer ' + token);

    // Vérifier le token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token valide - User ID:', decoded.id);
    } catch (error) {
      console.error('❌ Token invalide:', error.message);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
    process.exit(0);
  }
};

checkToken();
