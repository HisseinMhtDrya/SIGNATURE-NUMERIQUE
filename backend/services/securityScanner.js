const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecurityScanner {
  constructor() {
    this.results = {
      vulnerabilities: [],
      ports: [],
      dependencies: [],
      files: []
    };
    this.nvdApiKey = process.env.NVD_API_KEY || '';
  }

  // Scanner de ports automatisé
  async scanPorts(target = 'localhost', ports = [22, 80, 443, 3000, 5000, 27017]) {
    console.log(`🔍 Scan de ports sur ${target}...`);
    
    const results = [];
    for (const port of ports) {
      try {
        const result = await this.checkPort(target, port);
        if (result.open) {
          results.push({
            port,
            service: this.getServiceName(port),
            status: 'open',
            banner: result.banner
          });
        }
      } catch (error) {
        console.error(`Erreur scan port ${port}:`, error.message);
      }
    }
    
    this.results.ports = results;
    return results;
  }

  // Vérification d'un port spécifique
  checkPort(host, port) {
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(3000);
      
      socket.on('connect', () => {
        resolve({ open: true, banner: 'Service detected' });
        socket.destroy();
      });
      
      socket.on('timeout', () => {
        resolve({ open: false });
        socket.destroy();
      });
      
      socket.on('error', () => {
        resolve({ open: false });
      });
      
      socket.connect(port, host);
    });
  }

  // Obtenir le nom du service par port
  getServiceName(port) {
    const services = {
      22: 'SSH',
      80: 'HTTP',
      443: 'HTTPS',
      3000: 'Node.js',
      5000: 'Express.js',
      27017: 'MongoDB'
    };
    return services[port] || 'Unknown';
  }

  // Analyse des dépendances package.json
  async scanDependencies() {
    console.log('📦 Analyse des dépendances...');
    
    const packageJsonPath = path.join(__dirname, '../package.json');
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      const vulnDeps = [];
      for (const [name, version] of Object.entries(dependencies)) {
        const vulns = await this.checkVulnerability(name, version);
        if (vulns.length > 0) {
          vulnDeps.push({
            name,
            version,
            vulnerabilities: vulns
          });
        }
      }
      
      this.results.dependencies = vulnDeps;
      return vulnDeps;
    } catch (error) {
      console.error('Erreur lecture package.json:', error);
      return [];
    }
  }

  // Vérification CVE via NVD API
  async checkVulnerability(packageName, version) {
    try {
      const searchUrl = `https://services.nvd.nist.gov/rest/json/cves/1.0?keyword=${encodeURIComponent(packageName)}&cvssV3Severity=HIGH`;
      
      const response = await this.makeRequest(searchUrl);
      if (response && response.result && response.result.CVE_Items) {
        return response.result.CVE_Items.map(cve => ({
          id: cve.cve.CVE_data_meta.ID,
          description: cve.cve.description.description_data[0]?.value || 'No description',
          severity: cve.impact?.baseMetricV3?.cvssV3?.baseSeverity || 'Unknown',
          published: cve.publishedDate
        }));
      }
    } catch (error) {
      console.error(`Erreur vérification ${packageName}:`, error.message);
    }
    return [];
  }

  // Scan des fichiers uploadés
  async scanUploadedFiles() {
    console.log('📁 Scan des fichiers uploadés...');
    
    const uploadsPath = path.join(__dirname, '../uploads');
    const suspiciousFiles = [];
    
    try {
      if (!fs.existsSync(uploadsPath)) {
        return [];
      }
      
      const files = fs.readdirSync(uploadsPath);
      
      for (const file of files) {
        const filePath = path.join(uploadsPath, file);
        const stats = fs.statSync(filePath);
        
        // Vérifier les extensions suspectes
        const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
        const ext = path.extname(file).toLowerCase();
        
        if (suspiciousExtensions.includes(ext)) {
          suspiciousFiles.push({
            filename: file,
            path: filePath,
            size: stats.size,
            type: 'suspicious_extension',
            risk: 'high'
          });
        }
        
        // Vérifier la taille des fichiers
        if (stats.size > 50 * 1024 * 1024) { // 50MB
          suspiciousFiles.push({
            filename: file,
            path: filePath,
            size: stats.size,
            type: 'large_file',
            risk: 'medium'
          });
        }
        
        // Calculer le hash pour détection
        const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
        suspiciousFiles.push({
          filename: file,
          hash,
          size: stats.size,
          scanned: new Date()
        });
      }
      
      this.results.files = suspiciousFiles;
      return suspiciousFiles;
    } catch (error) {
      console.error('Erreur scan fichiers:', error);
      return [];
    }
  }

  // Analyse des headers HTTP
  async analyzeHttpHeaders(target = 'http://localhost:5000') {
    console.log('🌐 Analyse des headers HTTP...');
    
    try {
      const response = await this.makeRequest(target);
      const headers = response.headers;
      
      const securityIssues = [];
      
      // Vérifier les headers de sécurité
      const securityHeaders = [
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security',
        'content-security-policy',
        'x-content-type-options'
      ];
      
      for (const header of securityHeaders) {
        if (!headers[header]) {
          securityIssues.push({
            type: 'missing_security_header',
            header,
            severity: 'medium',
            description: `Header ${header} manquant`
          });
        }
      }
      
      // Vérifier la version du serveur
      if (headers.server) {
        securityIssues.push({
          type: 'server_disclosure',
          header: 'server',
          value: headers.server,
          severity: 'low',
          description: 'Version du serveur exposée'
        });
      }
      
      return securityIssues;
    } catch (error) {
      console.error('Erreur analyse headers:', error);
      return [];
    }
  }

  // Génération de rapport
  generateReport() {
    const report = {
      scanDate: new Date(),
      summary: {
        totalVulnerabilities: this.results.vulnerabilities.length,
        openPorts: this.results.ports.length,
        vulnerableDependencies: this.results.dependencies.length,
        suspiciousFiles: this.results.files.length
      },
      details: this.results
    };
    
    return report;
  }

  // Sauvegarder le rapport en JSON
  async saveReport() {
    const report = this.generateReport();
    const reportPath = path.join(__dirname, '../security-report.json');
    
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Rapport sauvegardé: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('Erreur sauvegarde rapport:', error);
      return null;
    }
  }

  // Fonction utilitaire pour faire des requêtes HTTP
  makeRequest(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => resolve({ headers: response.headers, data: JSON.parse(data) }));
      });
      
      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Timeout'));
      });
    });
  }

  // Scanner complet
  async runFullScan() {
    console.log('🚀 Lancement du scan de sécurité complet...');
    
    await Promise.all([
      this.scanPorts(),
      this.scanDependencies(),
      this.scanUploadedFiles(),
      this.analyzeHttpHeaders()
    ]);
    
    const reportPath = await this.saveReport();
    
    return {
      report: this.generateReport(),
      reportPath
    };
  }
}

module.exports = SecurityScanner;
