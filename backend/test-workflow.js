const mongoose = require('mongoose');
const SignatureWorkflow = require('./models/SignatureWorkflow');
const Document = require('./models/Document');
const User = require('./models/User');
const { sendInvite } = require('./controllers/workflowController');
require('dotenv').config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => {
    console.error('❌ MongoDB erreur:', err);
    process.exit(1);
  });

const testWorkflow = async () => {
  try {
    console.log('🧪 Test création workflow...');
    
    // Trouver un document et un utilisateur
    const document = await Document.findOne();
    const user = await User.findOne({ email: 'hisseinmhtdrya@gmail.com' });
    
    if (!document) {
      console.log('❌ Aucun document trouvé');
      return;
    }
    
    if (!user) {
      console.log('❌ Utilisateur admin non trouvé');
      return;
    }
    
    console.log(`📄 Document: ${document.name}`);
    console.log(`👤 Utilisateur: ${user.email}`);
    
    // Créer un workflow de test
    const emails = ['test@example.com', 'test2@example.com']; // Emails de test
    
    const steps = emails.map((email, index) => ({
      email: email.toLowerCase().trim(),
      order: index + 1,
      userId: null
    }));

    const workflow = new SignatureWorkflow({
      documentId: document._id,
      steps,
      currentStep: 0,
      status: 'pending',
      createdBy: user._id
    });

    await workflow.save();
    console.log(`✅ Workflow créé: ${workflow._id}`);
    
    // Tester l'envoi d'invitation
    console.log('📧 Test envoi invitation au premier signataire...');
    await sendInvite(workflow._id, steps[0].email);
    
    console.log('🎉 Test terminé avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur test:', error);
  } finally {
    mongoose.connection.close();
  }
};

testWorkflow();
