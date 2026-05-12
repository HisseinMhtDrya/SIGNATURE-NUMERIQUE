const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Test de connexion MongoDB...');
console.log('MONGO_URI configuré:', process.env.MONGO_URI ? '✅' : '❌');

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI non défini dans les variables d\'environnement');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté avec succès !');
    console.log('🎉 Votre URI est correct et accessible');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    console.log('\n🔧 Solutions possibles :');
    console.log('1. Vérifiez l\'accès réseau dans MongoDB Atlas (0.0.0.0/0)');
    console.log('2. Vérifiez les identifiants utilisateur');
    console.log('3. Encodez les caractères spéciaux dans le mot de passe');
    process.exit(1);
  });