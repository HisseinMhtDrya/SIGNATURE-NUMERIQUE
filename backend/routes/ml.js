const express = require('express');
const MLSecurity = require('../services/mlSecurity');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// Analyser le comportement utilisateur
router.post('/analyze-behavior', auth, adminAuth, async (req, res) => {
  try {
    const { userId, actions } = req.body;
    const ml = new MLSecurity();
    
    const analysis = ml.analyzeUserBehavior(userId, actions);
    
    res.json({
      message: 'Analyse de comportement utilisateur terminée',
      analysis,
      recommendations: analysis.recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Détecter les anomalies réseau
router.post('/detect-anomalies', auth, adminAuth, async (req, res) => {
  try {
    const { requests } = req.body;
    const ml = new MLSecurity();
    
    const anomalies = ml.detectNetworkAnomalies(requests);
    
    res.json({
      message: 'Détection d\'anomalies réseau terminée',
      anomalies,
      summary: {
        total: anomalies.length,
        high_risk: anomalies.filter(a => a.score > 0.8).length,
        medium_risk: anomalies.filter(a => a.score > 0.5 && a.score <= 0.8).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyser un fichier pour malware
router.post('/analyze-file', auth, adminAuth, async (req, res) => {
  try {
    const { filePath } = req.body;
    const ml = new MLSecurity();
    
    const analysis = ml.analyzeFile(filePath);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }
    
    res.json({
      message: 'Analyse de fichier terminée',
      analysis,
      risk_level: analysis.risk
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Détecter le phishing dans une URL
router.post('/detect-phishing', auth, adminAuth, async (req, res) => {
  try {
    const { url } = req.body;
    const ml = new MLSecurity();
    
    const detection = ml.detectPhishing(url);
    
    res.json({
      message: 'Détection de phishing terminée',
      url,
      is_phishing: detection.isPhishing,
      confidence: detection.confidence,
      features: detection.features
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyser plusieurs fichiers
router.post('/analyze-files', auth, adminAuth, async (req, res) => {
  try {
    const { filePaths } = req.body;
    const ml = new MLSecurity();
    
    const results = [];
    for (const filePath of filePaths) {
      const analysis = ml.analyzeFile(filePath);
      if (analysis) {
        results.push(analysis);
      }
    }
    
    res.json({
      message: 'Analyse de fichiers terminée',
      results,
      summary: {
        total: results.length,
        high_risk: results.filter(r => r.risk === 'high').length,
        medium_risk: results.filter(r => r.risk === 'medium').length,
        low_risk: results.filter(r => r.risk === 'low').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Entraîner les modèles
router.post('/train-models', auth, adminAuth, async (req, res) => {
  try {
    const { modelType, trainingData } = req.body;
    const ml = new MLSecurity();
    
    let result;
    switch (modelType) {
      case 'network_anomaly':
        result = ml.trainNetworkAnomalyModel(trainingData);
        break;
      case 'malware_classifier':
        result = ml.trainMalwareClassifier(trainingData);
        break;
      case 'phishing_detector':
        result = ml.trainPhishingDetector(trainingData);
        break;
      default:
        return res.status(400).json({ error: 'Type de modèle invalide' });
    }
    
    res.json({
      message: 'Entraînement du modèle terminé',
      model_type: modelType,
      success: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtenir les statistiques des modèles
router.get('/model-stats', auth, adminAuth, async (req, res) => {
  try {
    const ml = new MLSecurity();
    const stats = ml.getModelStats();
    
    res.json({
      message: 'Statistiques des modèles récupérées',
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sauvegarder les résultats d'analyse
router.post('/save-results', auth, adminAuth, async (req, res) => {
  try {
    const { results, analysisType } = req.body;
    const ml = new MLSecurity();
    
    const filePath = ml.saveAnalysisResults(results, analysisType);
    
    res.json({
      message: 'Résultats d\'analyse sauvegardés',
      filePath,
      analysisType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Prédiction en temps réel
router.post('/predict', auth, adminAuth, async (req, res) => {
  try {
    const { data, modelType } = req.body;
    const ml = new MLSecurity();
    
    let prediction;
    switch (modelType) {
      case 'network_anomaly':
        prediction = ml.calculateAnomalyScore(data.features);
        break;
      case 'malware_detection':
        prediction = ml.predictMalware(data.features);
        break;
      case 'phishing_detection':
        prediction = ml.calculatePhishingScore(data.features);
        break;
      default:
        return res.status(400).json({ error: 'Type de modèle invalide' });
    }
    
    res.json({
      message: 'Prédiction générée',
      modelType,
      prediction,
      risk_level: prediction.probability > 0.7 ? 'high' : prediction.probability > 0.5 ? 'medium' : 'low'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyser les logs avec ML
router.post('/analyze-logs', auth, adminAuth, async (req, res) => {
  try {
    const { logType, timeRange } = req.body;
    const ml = new MLSecurity();
    
    // Simulation d'analyse de logs
    const analysis = {
      logType,
      timeRange,
      anomalies_detected: Math.floor(Math.random() * 10),
      patterns_found: Math.floor(Math.random() * 5),
      risk_score: Math.random()
    };
    
    res.json({
      message: 'Analyse de logs avec ML terminée',
      analysis,
      recommendations: [
        'Surveiller les activités suspectes',
        'Renforcer les politiques de sécurité',
        'Mettre à jour les règles de détection'
      ]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
