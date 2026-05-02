const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 Test de configuration email...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Configuré' : '❌ Manquant');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Configuré' : '❌ Manquant');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('\n❌ Veuillez configurer EMAIL_USER et EMAIL_PASS dans le fichier .env');
  process.exit(1);
}

// Créer le transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Vérifier la connexion
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de connexion email:', error);
    console.log('\n💡 Solutions possibles:');
    console.log('1. Vérifier que EMAIL_USER est correct');
    console.log('2. Utiliser un App Password Gmail (pas le mot de passe normal)');
    console.log('3. Activer "Less secure app access" dans les paramètres Gmail');
    console.log('4. Vérifier que 2FA est activé et utiliser un App Password');
  } else {
    console.log('✅ Serveur email prêt à envoyer des messages');
    
    // Test d'envoi
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Envoyer à soi-même pour tester
      subject: '🧪 Test Email - Signature Numérique',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">🧪 Test de configuration email</h2>
          <p>Ceci est un test pour vérifier que l'envoi d'emails fonctionne correctement.</p>
          <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #155724;">✅ Succès</h3>
            <p>La configuration email est correcte !</p>
          </div>
          <p style="color: #6c757d; font-size: 12px;">
            Test effectué le ${new Date().toLocaleString()}
          </p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Erreur envoi test:', error);
      } else {
        console.log('✅ Email de test envoyé avec succès!');
        console.log('📧 Message ID:', info.messageId);
        console.log('🔗 Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    });
  }
});
