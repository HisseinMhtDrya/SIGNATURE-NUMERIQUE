const { transporter, sendEmail } = require('../services/emailService');
const OtpService = require('../services/otpService');
const User = require('../models/User');
require('dotenv').config();

const testEmailSending = async () => {
  try {
    console.log('🧪 TEST D\'ENVOI D\'EMAIL OTP');
    console.log('=====================================\n');

    // 1. Tester la connexion SMTP
    console.log('1️⃣ Test de connexion SMTP...');
    await new Promise((resolve, reject) => {
      transporter.verify((error, success) => {
        if (error) {
          console.error('❌ Erreur SMTP:', error);
          reject(error);
        } else {
          console.log('✅ Connexion SMTP réussie');
          resolve(success);
        }
      });
    });

    // 2. Créer un utilisateur test
    console.log('\n2️⃣ Création utilisateur test...');
    const testUser = {
      email: 'test@example.com',
      otp: '123456',
      otpExpiration: new Date(Date.now() + 10 * 60 * 1000)
    };

    // 3. Générer et envoyer un OTP
    console.log('\n3️⃣ Génération et envoi OTP...');
    const otp = OtpService.generateOtp();
    console.log(`🔑 OTP généré: ${otp}`);

    // 4. Envoyer l'email
    console.log('\n4️⃣ Envoi de l\'email...');
    await sendEmail(
      testUser.email,
      'Code OTP de connexion - Signature Numérique',
      `
Votre code de connexion à usage unique est : ${otp}

Ce code expire dans 10 minutes.

Ne partagez jamais ce code avec personne.
Si vous n'avez pas demandé ce code, ignorez cet email.
      `.trim()
    );

    console.log('✅ Email envoyé avec succès !');

    // 5. Afficher la configuration
    console.log('\n5️⃣ Configuration utilisée:');
    console.log({
      service: process.env.EMAIL_SERVICE,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '***配置***' : 'NON CONFIGURÉ',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true
    });

    console.log('\n🎉 Test terminé avec succès !');

  } catch (error) {
    console.error('\n❌ Erreur lors du test:', error.message);
    console.error('Code erreur:', error.code);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 SOLUTION POUR EAUTH:');
      console.log('1. Vérifiez que l\'email et le mot de passe sont corrects');
      console.log('2. Assurez-vous d\'utiliser un "App Password" Gmail');
      console.log('3. Activez "Less secure app access" dans les paramètres Gmail');
      console.log('4. Vérifiez que le compte Gmail n\'a pas de restrictions 2FA');
    }
  }
};

testEmailSending();
