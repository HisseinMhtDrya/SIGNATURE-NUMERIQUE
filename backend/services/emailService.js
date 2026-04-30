const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Vérification de la connexion SMTP
transporter.verify(function (error, success) {
    console.log('Vérification de la connexion SMTP...');
    if (error) {
        console.error('Erreur de connexion SMTP:', error);
        console.log('Configuration utilisée:', {
            host: transporter.options.host,
            port: transporter.options.port,
            secure: transporter.options.secure,
            user: process.env.EMAIL_USER
        });
        console.error('Erreur de configuration du transporteur email:', error);
    } else {
        console.log("Le serveur SMTP est prêt à envoyer des emails");
        console.log('Configuration SMTP:', {
            host: transporter.options.host,
            port: transporter.options.port,
            secure: transporter.options.secure,
            user: process.env.EMAIL_USER
        });
    }
});

const OtpLogger = require('./otpLogger');

const sendEmail = async (email, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé avec succès à ${email}: ${subject}`);
  } catch (error) {
    console.error('❌ Erreur d\'envoi d\'email SMTP:', error.message);
    
    // En cas d'erreur SMTP, utiliser le logger OTP comme fallback
    if (subject.includes('OTP')) {
      const otpMatch = text.match(/Votre code de connexion à usage unique est : (\d{6})/);
      if (otpMatch) {
        const otp = otpMatch[1];
        const expiration = new Date(Date.now() + 10 * 60 * 1000);
        
        // Logger l'OTP pour le développement
        OtpLogger.logOtp(email, otp, expiration);
        
        console.log('\n� FALLBACK EMAIL - OTP ENREGISTRÉ DANS LES LOGS');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Code OTP: ${otp}`);
        console.log('⏰ Ce code expire dans 10 minutes');
        console.log('📂 Consultez le fichier logs/otp-logs.json\n');
        
        return; // Ne pas lancer d'erreur en mode développement
      }
    }
    
    // Si ce n'est pas un OTP, lancer l'erreur
    throw new Error(`Problème lors de l'envoi de l'email: ${error.message}`);
  }
};

module.exports = { transporter, sendEmail };
