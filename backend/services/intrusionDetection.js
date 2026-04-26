const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class IntrusionDetection {
  constructor() {
    this.alerts = [];
    this.rules = this.loadSnortRules();
    this.suspiciousPatterns = this.getSuspiciousPatterns();
    this.logFile = path.join(__dirname, '../logs/intrusion.log');
    this.ensureLogDirectory();
  }

  // Charger les règles Snort
  loadSnortRules() {
    return [
      {
        id: 1,
        name: 'SQL Injection Attempt',
        pattern: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b)/i,
        severity: 'high',
        description: 'Tentative d injection SQL détectée'
      },
      {
        id: 2,
        name: 'XSS Attempt',
        pattern: /(<script|javascript:|onload=|onerror=|alert\()/i,
        severity: 'high',
        description: 'Tentative XSS détectée'
      },
      {
        id: 3,
        name: 'Path Traversal',
        pattern: /(\.\.\/|\.\.\\|%2e%2f|%2e%5c)/i,
        severity: 'medium',
        description: 'Tentative de path traversal détectée'
      },
      {
        id: 4,
        name: 'Command Injection',
        pattern: /(;\s*(rm|del|format|shutdown|reboot)|\|\s*(cat|type|dir)/i,
        severity: 'high',
        description: 'Tentative d injection de commande détectée'
      },
      {
        id: 5,
        name: 'Brute Force Login',
        pattern: /login.*failed/i,
        severity: 'medium',
        description: 'Activité de brute force détectée'
      }
    ];
  }

  // Patterns suspects
  getSuspiciousPatterns() {
    return {
      multipleFailedLogins: { threshold: 5, window: 300000 }, // 5 échecs en 5 minutes
      rapidRequests: { threshold: 100, window: 60000 }, // 100 requêtes en 1 minute
      unusualUserAgent: /bot|crawler|scanner|exploit/i,
      suspiciousIPs: this.getKnownMaliciousIPs(),
      largePayload: { threshold: 1024 * 1024 } // 1MB
    };
  }

  // IPs malveillantes connues
  getKnownMaliciousIPs() {
    return [
      '192.168.1.100', // Exemple d'IP malveillante
      '10.0.0.50'
    ];
  }

  // S'assurer que le répertoire de logs existe
  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  // Analyser une requête HTTP
  analyzeRequest(req) {
    const analysis = {
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      body: req.body,
      headers: req.headers,
      alerts: []
    };

    // Vérifier les règles Snort
    for (const rule of this.rules) {
      if (this.testRule(rule, analysis)) {
        analysis.alerts.push({
          type: 'rule_match',
          rule: rule.name,
          severity: rule.severity,
          description: rule.description,
          timestamp: new Date()
        });
      }
    }

    // Vérifier les patterns suspects
    analysis.alerts.push(...this.checkSuspiciousPatterns(analysis));

    // Vérifier l'IP
    if (this.isSuspiciousIP(analysis.ip)) {
      analysis.alerts.push({
        type: 'suspicious_ip',
        severity: 'high',
        description: `IP suspecte détectée: ${analysis.ip}`,
        timestamp: new Date()
      });
    }

    // Vérifier le payload
    if (this.isLargePayload(analysis)) {
      analysis.alerts.push({
        type: 'large_payload',
        severity: 'medium',
        description: 'Payload trop volumineux détecté',
        timestamp: new Date()
      });
    }

    return analysis;
  }

  // Tester une règle spécifique
  testRule(rule, analysis) {
    const testData = [
      analysis.url,
      JSON.stringify(analysis.body),
      JSON.stringify(analysis.headers)
    ].join(' ');

    return rule.pattern.test(testData);
  }

  // Vérifier les patterns suspects
  checkSuspiciousPatterns(analysis) {
    const alerts = [];

    // User-Agent suspect
    if (this.suspiciousPatterns.unusualUserAgent.test(analysis.userAgent)) {
      alerts.push({
        type: 'suspicious_user_agent',
        severity: 'medium',
        description: `User-Agent suspect: ${analysis.userAgent}`,
        timestamp: new Date()
      });
    }

    return alerts;
  }

  // Vérifier si une IP est suspecte
  isSuspiciousIP(ip) {
    return this.suspiciousPatterns.suspiciousIPs.includes(ip);
  }

  // Vérifier si le payload est trop volumineux
  isLargePayload(analysis) {
    const bodySize = JSON.stringify(analysis.body).length;
    return bodySize > this.suspiciousPatterns.largePayload.threshold;
  }

  // Détecter les anomalies de comportement
  detectBehaviorAnomalies(requests) {
    const anomalies = [];
    const now = Date.now();

    // Grouper les requêtes par IP
    const requestsByIP = this.groupRequestsByIP(requests);

    for (const [ip, ipRequests] of Object.entries(requestsByIP)) {
      // Vérifier les requêtes rapides
      const recentRequests = ipRequests.filter(req => 
        now - req.timestamp < this.suspiciousPatterns.rapidRequests.window
      );

      if (recentRequests.length > this.suspiciousPatterns.rapidRequests.threshold) {
        anomalies.push({
          type: 'rapid_requests',
          ip,
          count: recentRequests.length,
          severity: 'high',
          description: `${recentRequests.length} requêtes en ${this.suspiciousPatterns.rapidRequests.window/1000} secondes`,
          timestamp: new Date()
        });
      }

      // Vérifier les échecs de connexion multiples
      const failedLogins = recentRequests.filter(req => 
        req.url.includes('/login') && 
        req.body && 
        req.body.error === 'Identifiants incorrects'
      );

      if (failedLogins.length > this.suspiciousPatterns.multipleFailedLogins.threshold) {
        anomalies.push({
          type: 'multiple_failed_logins',
          ip,
          count: failedLogins.length,
          severity: 'high',
          description: `${failedLogins.length} tentatives de connexion échouées`,
          timestamp: new Date()
        });
      }
    }

    return anomalies;
  }

  // Grouper les requêtes par IP
  groupRequestsByIP(requests) {
    return requests.reduce((groups, req) => {
      const ip = req.ip || req.connection.remoteAddress;
      if (!groups[ip]) {
        groups[ip] = [];
      }
      groups[ip].push(req);
      return groups;
    }, {});
  }

  // Journaliser une alerte
  logAlert(alert) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: alert.severity.toUpperCase(),
      type: alert.type,
      message: alert.description,
      data: alert
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFile, logLine);

    // Ajouter à la mémoire des alertes
    this.alerts.push(alert);
    
    // Garder seulement les 1000 dernières alertes en mémoire
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  // Traiter une requête et générer des alertes
  processRequest(req) {
    const analysis = this.analyzeRequest(req);
    
    // Journaliser toutes les alertes
    for (const alert of analysis.alerts) {
      this.logAlert(alert);
    }

    return analysis;
  }

  // Obtenir les alertes récentes
  getRecentAlerts(limit = 100, severity = null) {
    let alerts = [...this.alerts].reverse(); // Plus récentes d'abord
    
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    return alerts.slice(0, limit);
  }

  // Obtenir les statistiques des alertes
  getAlertStats() {
    const stats = {
      total: this.alerts.length,
      bySeverity: {},
      byType: {},
      recent24h: 0,
      recent7d: 0
    };

    const now = Date.now();
    const day24 = 24 * 60 * 60 * 1000;
    const week7 = 7 * 24 * 60 * 60 * 1000;

    for (const alert of this.alerts) {
      // Stats par sévérité
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      
      // Stats par type
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      
      // Stats récentes
      if (now - alert.timestamp < day24) {
        stats.recent24h++;
      }
      if (now - alert.timestamp < week7) {
        stats.recent7d++;
      }
    }

    return stats;
  }

  // Nettoyer les anciennes alertes
  cleanupOldAlerts(daysOld = 30) {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp > cutoffTime
    );
  }

  // Exporter les alertes en format CSV
  exportToCSV(startDate = null, endDate = null) {
    let alerts = [...this.alerts];
    
    if (startDate) {
      alerts = alerts.filter(alert => alert.timestamp >= new Date(startDate));
    }
    
    if (endDate) {
      alerts = alerts.filter(alert => alert.timestamp <= new Date(endDate));
    }

    const headers = ['timestamp', 'severity', 'type', 'description', 'ip', 'url'];
    const csvContent = [
      headers.join(','),
      ...alerts.map(alert => [
        alert.timestamp.toISOString(),
        alert.severity,
        alert.type,
        `"${alert.description}"`,
        alert.ip || '',
        alert.url || ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  // Middleware Express pour l'IDS
  static middleware() {
    const ids = new IntrusionDetection();
    
    return (req, res, next) => {
      // Analyser la requête
      const analysis = ids.processRequest(req);
      
      // Ajouter l'analyse à la requête pour usage ultérieur
      req.idsAnalysis = analysis;
      
      // Continuer le traitement normal
      next();
    };
  }
}

module.exports = IntrusionDetection;
