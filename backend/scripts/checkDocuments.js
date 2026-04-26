const mongoose = require('mongoose');
require('dotenv').config();

const Document = require('../models/Document');
const Signature = require('../models/Signature');
const User = require('../models/User');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier les documents
    const documents = await Document.find({}).populate('owner', 'name email');
    console.log(`\n📄 ${documents.length} document(s) trouvé(s):`);
    documents.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.name}`);
      console.log(`      Propriétaire: ${doc.owner ? doc.owner.name : 'Inconnu'} (${doc.owner ? doc.owner.email : 'N/A'})`);
      console.log(`      Créé le: ${doc.createdAt}`);
      console.log('');
    });

    // Vérifier les signatures
    const signatures = await Signature.find({})
      .populate('user', 'name email')
      .populate('document', 'name');
    
    console.log(`\n✍️ ${signatures.length} signature(s) trouvée(s):`);
    signatures.forEach((sig, index) => {
      console.log(`   ${index + 1}. Document: ${sig.document ? sig.document.name : 'Inconnu'}`);
      console.log(`      Signé par: ${sig.user ? sig.user.name : 'Inconnu'}`);
      console.log(`      Signé le: ${sig.signedAt}`);
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

checkData();
