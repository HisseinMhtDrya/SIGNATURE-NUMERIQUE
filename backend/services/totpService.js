const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

class TOTPService {
  // Générer un secret TOTP pour un utilisateur
  static generateSecret(userEmail) {
    return speakeasy.generateSecret({
      name: `Signature Numérique - ${userEmail}`,
      issuer: 'Signature Numérique Security',
      length: 32
    });
  }

  // Générer le QR code pour le secret TOTP
  static generateQRCode(secret) {
    const otpauthUrl = speakeasy.getOTPAuthUri({
      secret: secret.base32,
      label: secret.name,
      issuer: secret.issuer
    });

    return new Promise((resolve, reject) => {
      qrcode.toDataURL(otpauthUrl, (err, url) => {
        if (err) reject(err);
        resolve(url);
      });
    });
  }

  // Vérifier un token TOTP
  static verifyToken(token, secret) {
    return speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token: token,
      window: 2, // Fenêtre de 30 secondes
      time: Math.floor(Date.now() / 1000)
    });
  }

  // Générer un token TOTP courant (pour tests)
  static generateCurrentToken(secret) {
    return speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32'
    });
  }
}

module.exports = TOTPService;
