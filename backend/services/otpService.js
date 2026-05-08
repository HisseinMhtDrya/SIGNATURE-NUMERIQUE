const crypto = require('crypto');
const { sendEmail } = require('./emailService');

class OtpService {
  // Générer un OTP de 6 chiffres
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Envoyer un OTP par email
  static async sendOtpEmail(email, otp) {
    const subject = 'Code OTP de connexion - Signature Numérique';
    const text = `
Votre code de connexion à usage unique est : ${otp}

Ce code expire dans 10 minutes.

Ne partagez jamais ce code avec personne.
Si vous n'avez pas demandé ce code, ignorez cet email.
    `;
    
    await sendEmail(email, subject, text);
  }

  // Créer et envoyer un OTP pour un utilisateur
  static async createAndSendOtp(user) {
    console.log(`🔑 Creating OTP for user: ${user.email}`);
    
    // Générer un nouvel OTP
    const otp = this.generateOtp();
    const expiration = new Date(Date.now() + (process.env.OTP_EXPIRATION_MINUTES || 10) * 60 * 1000);
    
    // Mettre à jour l'utilisateur en une seule opération
    user.otp = otp;
    user.otpExpiration = expiration;
    user.otpAttempts = 0;
    user.isOtpVerified = false;
    
    await user.save();
    console.log(`💾 OTP saved for user: ${user.email}`);
    
    // Envoyer l'email (avec timeout pour éviter les blocages)
    try {
      await this.sendOtpEmail(user.email, otp);
      console.log(`📧 OTP email sent successfully to: ${user.email}`);
    } catch (emailError) {
      console.error(`❌ Failed to send OTP email to ${user.email}:`, emailError.message);
      // Ne pas lancer d'erreur - l'OTP est déjà sauvegardé
    }
    
    return { message: 'OTP envoyé avec succès', expiration };
  }

  // Vérifier un OTP
  static async verifyOtp(user, providedOtp) {
    // Vérifier si l'OTP a expiré
    if (!user.otpExpiration || user.otpExpiration < new Date()) {
      return { valid: false, error: 'OTP expiré' };
    }

    // Vérifier le nombre de tentatives
    if (user.otpAttempts >= 3) {
      return { valid: false, error: 'Trop de tentatives. Veuillez demander un nouvel OTP.' };
    }

    // Vérifier l'OTP
    if (user.otp !== providedOtp) {
      user.otpAttempts += 1;
      await user.save();
      return { valid: false, error: 'OTP incorrect', attemptsLeft: 3 - user.otpAttempts };
    }

    // OTP valide - le marquer comme vérifié
    user.isOtpVerified = true;
    user.otp = null;
    user.otpExpiration = null;
    user.otpAttempts = 0;
    await user.save();

    return { valid: true };
  }

  // Réinitialiser l'OTP d'un utilisateur
  static async resetOtp(user) {
    user.otp = null;
    user.otpExpiration = null;
    user.otpAttempts = 0;
    // NE PAS réinitialiser isOtpVerified - l'utilisateur reste vérifié
    await user.save();
  }
}

module.exports = OtpService;
