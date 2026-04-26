const express = require('express');
const IntrusionDetection = require('../services/intrusionDetection');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Obtenir les alertes récentes
router.get('/alerts', auth, adminAuth, async (req, res) => {
  try {
    const { limit, severity } = req.query;
    const ids = new IntrusionDetection();
    const alerts = ids.getRecentAlerts(
      parseInt(limit) || 100, 
      severity
    );
    
    res.json({
      message: 'Alertes récupérées avec succès',
      alerts,
      summary: {
        total: alerts.length,
        severity: severity || 'all'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les statistiques des alertes
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const ids = new IntrusionDetection();
    const stats = ids.getAlertStats();
    
    res.json({
      message: 'Statistiques des alertes générées',
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exporter les alertes en CSV
router.get('/export', auth, adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const ids = new IntrusionDetection();
    const csvContent = ids.exportToCSV(startDate, endDate);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=intrusion-alerts.csv');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Nettoyer les anciennes alertes
router.post('/cleanup', auth, adminAuth, async (req, res) => {
  try {
    const { daysOld } = req.body;
    const ids = new IntrusionDetection();
    ids.cleanupOldAlerts(daysOld || 30);
    
    res.json({
      message: `Alertes de plus de ${daysOld || 30} jours supprimées`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les alertes par IP
router.get('/alerts/ip/:ip', auth, adminAuth, async (req, res) => {
  try {
    const { ip } = req.params;
    const ids = new IntrusionDetection();
    const allAlerts = ids.getRecentAlerts(1000);
    const ipAlerts = allAlerts.filter(alert => alert.ip === ip);
    
    res.json({
      message: `Alertes pour l'IP ${ip}`,
      ip,
      alerts: ipAlerts,
      summary: {
        total: ipAlerts.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les alertes par type
router.get('/alerts/type/:type', auth, adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    const ids = new IntrusionDetection();
    const allAlerts = ids.getRecentAlerts(1000);
    const typeAlerts = allAlerts.filter(alert => alert.type === type);
    
    res.json({
      message: `Alertes de type ${type}`,
      type,
      alerts: typeAlerts,
      summary: {
        total: typeAlerts.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les alertes par sévérité
router.get('/alerts/severity/:severity', auth, adminAuth, async (req, res) => {
  try {
    const { severity } = req.params;
    const ids = new IntrusionDetection();
    const alerts = ids.getRecentAlerts(1000, severity);
    
    res.json({
      message: `Alertes de sévérité ${severity}`,
      severity,
      alerts,
      summary: {
        total: alerts.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
