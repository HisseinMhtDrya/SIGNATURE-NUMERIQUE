const express = require('express');
const SecurityScanner = require('../services/securityScanner');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Lancer un scan de sécurité complet
router.post('/scan', auth, adminAuth, async (req, res) => {
  try {
    const scanner = new SecurityScanner();
    const { report, reportPath } = await scanner.runFullScan();
    
    res.json({
      message: 'Scan de sécurité terminé',
      report,
      reportPath,
      summary: {
        vulnerabilities: report.summary.totalVulnerabilities,
        openPorts: report.summary.openPorts,
        vulnerableDependencies: report.summary.vulnerableDependencies,
        suspiciousFiles: report.summary.suspiciousFiles
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scanner de ports uniquement
router.post('/scan/ports', auth, adminAuth, async (req, res) => {
  try {
    const { target, ports } = req.body;
    const scanner = new SecurityScanner();
    const results = await scanner.scanPorts(target, ports);
    
    res.json({
      message: 'Scan de ports terminé',
      target,
      ports: results,
      summary: {
        total: results.length,
        open: results.filter(p => p.status === 'open').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyse des dépendances uniquement
router.post('/scan/dependencies', auth, adminAuth, async (req, res) => {
  try {
    const scanner = new SecurityScanner();
    const results = await scanner.scanDependencies();
    
    res.json({
      message: 'Analyse des dépendances terminée',
      dependencies: results,
      summary: {
        total: results.length,
        vulnerable: results.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyse des fichiers uploadés uniquement
router.post('/scan/files', auth, adminAuth, async (req, res) => {
  try {
    const scanner = new SecurityScanner();
    const results = await scanner.scanUploadedFiles();
    
    res.json({
      message: 'Analyse des fichiers terminée',
      files: results,
      summary: {
        total: results.length,
        suspicious: results.filter(f => f.risk === 'high').length,
        large: results.filter(f => f.type === 'large_file').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyse des headers HTTP uniquement
router.post('/scan/headers', auth, adminAuth, async (req, res) => {
  try {
    const { target } = req.body;
    const scanner = new SecurityScanner();
    const results = await scanner.analyzeHttpHeaders(target);
    
    res.json({
      message: 'Analyse des headers terminée',
      target,
      headers: results,
      summary: {
        total: results.length,
        critical: results.filter(h => h.severity === 'high').length,
        medium: results.filter(h => h.severity === 'medium').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir le dernier rapport de sécurité
router.get('/report', auth, adminAuth, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../security-report.json');
    
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
      res.json({
        message: 'Rapport de sécurité trouvé',
        report,
        reportPath
      });
    } else {
      res.status(404).json({ error: 'Aucun rapport de sécurité trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer le rapport de sécurité
router.delete('/report', auth, adminAuth, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../security-report.json');
    
    if (fs.existsSync(reportPath)) {
      fs.unlinkSync(reportPath);
      res.json({ message: 'Rapport de sécurité supprimé' });
    } else {
      res.status(404).json({ error: 'Aucun rapport de sécurité trouvé' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
