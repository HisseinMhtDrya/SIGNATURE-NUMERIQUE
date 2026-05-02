const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => {
    console.error('❌ MongoDB erreur:', err);
    process.exit(1);
  });

const resetOtpStatus = async () => {
  try {
    console.log('🔄 Réinitialisation du statut OTP des utilisateurs...');
    
    // Option 1: Réinitialiser tous les utilisateurs (sauf admin)
    const result = await User.updateMany(
      { email: { $ne: 'hisseinmhtdrya@gmail.com' } }, // Exclure l'admin
      { isOtpVerified: false }
    );
    
    console.log(`✅ ${result.modifiedCount} utilisateurs réinitialisés`);
    
    // Option 2: Marquer tous les utilisateurs comme déjà vérifiés
    // Décommentez la ligne suivante si vous voulez que tout le monde se connecte directement
    /*
    const verifiedResult = await User.updateMany(
      { email: { $ne: 'hisseinmhtdrya@gmail.com' } },
      { isOtpVerified: true }
    );
    console.log(`✅ ${verifiedResult.modifiedCount} utilisateurs marqués comme vérifiés`);
    */
    
    // Afficher le statut actuel
    const users = await User.find({}, { email: 1, isOtpVerified: 1, role: 1 });
    console.log('\n📊 Statut actuel des utilisateurs:');
    users.forEach(user => {
      const status = user.isOtpVerified ? '✅ Vérifié' : '🔴 Non vérifié';
      const role = user.role === 'admin' ? '👑' : '👤';
      console.log(`${role} ${user.email} - ${status}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetOtpStatus();
