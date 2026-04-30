const fs = require('fs');
const path = require('path');

class OtpLogger {
  static logOtp(email, otp, expiration) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      email: email,
      otp: otp,
      expiration: expiration.toISOString(),
      status: 'generated'
    };

    const logFile = path.join(__dirname, '../logs/otp-logs.json');
    
    try {
      let logs = [];
      if (fs.existsSync(logFile)) {
        const data = fs.readFileSync(logFile, 'utf8');
        logs = JSON.parse(data);
      }

      logs.push(logEntry);

      // Garder seulement les 100 derniers logs
      if (logs.length > 100) {
        logs = logs.slice(-100);
      }

      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
      
      // Afficher dans la console
      console.log('\n' + '='.repeat(60));
      console.log('🔓 OTP GÉNÉRÉ - MODE DÉVELOPPEMENT');
      console.log('='.repeat(60));
      console.log(`📧 Email   : ${email}`);
      console.log(`🔑 Code OTP: ${otp}`);
      console.log(`⏰ Expire  : ${expiration.toLocaleString()}`);
      console.log(`📅 Généré  : ${new Date().toLocaleString()}`);
      console.log('='.repeat(60));
      console.log('💡 UTILISEZ CE CODE POUR VOUS CONNECTER');
      console.log('='.repeat(60) + '\n');

      return logEntry;
    } catch (error) {
      console.error('Erreur lors du logging OTP:', error);
      return null;
    }
  }

  static getRecentOtps(email = null, limit = 10) {
    const logFile = path.join(__dirname, '../logs/otp-logs.json');
    
    try {
      if (!fs.existsSync(logFile)) {
        return [];
      }

      const data = fs.readFileSync(logFile, 'utf8');
      let logs = JSON.parse(data);

      // Filtrer par email si spécifié
      if (email) {
        logs = logs.filter(log => log.email === email);
      }

      // Trier par date décroissante et limiter
      return logs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la lecture des logs OTP:', error);
      return [];
    }
  }

  static clearOldLogs(daysOld = 7) {
    const logFile = path.join(__dirname, '../logs/otp-logs.json');
    
    try {
      if (!fs.existsSync(logFile)) {
        return;
      }

      const data = fs.readFileSync(logFile, 'utf8');
      let logs = JSON.parse(data);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      logs = logs.filter(log => new Date(log.timestamp) > cutoffDate);

      fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
      console.log(`🧹 Logs OTP de plus de ${daysOld} jours supprimés`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des logs OTP:', error);
    }
  }
}

module.exports = OtpLogger;
