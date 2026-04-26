const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class MLSecurity {
  constructor() {
    this.models = {};
    this.trainingData = [];
    this.loadModels();
  }

  // Charger les modèles ML pré-entrainés
  loadModels() {
    try {
      const modelPath = path.join(__dirname, '../models/ml');
      
      // Modèle de détection d'anomalies réseau
      this.models.networkAnomaly = {
        type: 'isolation_forest',
        threshold: 0.1,
        features: ['request_rate', 'error_rate', 'response_time', 'payload_size'],
        isTrained: false
      };

      // Modèle de classification de malware
      this.models.malwareClassifier = {
        type: 'random_forest',
        classes: ['benign', 'malware'],
        features: ['file_size', 'file_extension', 'entropy', 'header_analysis'],
        isTrained: false
      };

      // Modèle de détection de phishing
      this.models.phishingDetector = {
        type: 'logistic_regression',
        threshold: 0.7,
        features: ['url_length', 'domain_age', 'https_present', 'suspicious_words'],
        isTrained: false
      };

      console.log('🤖 Modèles ML chargés');
    } catch (error) {
      console.error('Erreur chargement modèles ML:', error);
    }
  }

  // Prétraitement des données réseau
  preprocessNetworkData(requests) {
    return requests.map(req => ({
      request_rate: this.calculateRequestRate(req.ip, requests),
      error_rate: this.calculateErrorRate(req.ip, requests),
      response_time: req.responseTime || 0,
      payload_size: JSON.stringify(req.body || {}).length,
      timestamp: req.timestamp,
      ip: req.ip,
      method: req.method,
      endpoint: req.url
    }));
  }

  // Calculer le taux de requêtes par IP
  calculateRequestRate(ip, requests, windowMs = 60000) { // 1 minute
    const now = Date.now();
    const recentRequests = requests.filter(req => 
      req.ip === ip && (now - req.timestamp) < windowMs
    );
    return recentRequests.length;
  }

  // Calculer le taux d'erreurs par IP
  calculateErrorRate(ip, requests, windowMs = 60000) {
    const now = Date.now();
    const recentRequests = requests.filter(req => 
      req.ip === ip && (now - req.timestamp) < windowMs
    );
    
    const errorRequests = recentRequests.filter(req => 
      req.statusCode >= 400
    );
    
    return recentRequests.length > 0 ? errorRequests.length / recentRequests.length : 0;
  }

  // Détecter les anomalies réseau
  detectNetworkAnomalies(requests) {
    if (!this.models.networkAnomaly.isTrained) {
      return this.trainNetworkAnomalyModel(requests);
    }

    const processedData = this.preprocessNetworkData(requests);
    const anomalies = [];

    for (const data of processedData) {
      const features = [
        data.request_rate,
        data.error_rate,
        data.response_time,
        data.payload_size
      ];

      const anomalyScore = this.calculateAnomalyScore(features);
      
      if (anomalyScore > this.models.networkAnomaly.threshold) {
        anomalies.push({
          ip: data.ip,
          timestamp: data.timestamp,
          score: anomalyScore,
          type: 'network_anomaly',
          details: {
            request_rate: data.request_rate,
            error_rate: data.error_rate,
            response_time: data.response_time,
            payload_size: data.payload_size
          }
        });
      }
    }

    return anomalies;
  }

  // Calculer le score d'anomalie
  calculateAnomalyScore(features) {
    // Simplification : scoring pondéré
    const weights = [0.3, 0.4, 0.2, 0.1];
    const normalizedFeatures = this.normalizeFeatures(features);
    
    let score = 0;
    for (let i = 0; i < features.length; i++) {
      score += normalizedFeatures[i] * weights[i];
    }
    
    return score;
  }

  // Normaliser les features
  normalizeFeatures(features) {
    const maxValues = [1000, 1.0, 5000, 1000000]; // Valeurs maximales attendues
    return features.map((feature, index) => Math.min(feature / maxValues[index], 1.0));
  }

  // Entraîner le modèle d'anomalie réseau
  trainNetworkAnomalyModel(requests) {
    console.log('🧠 Entraînement du modèle d\'anomalie réseau...');
    
    const processedData = this.preprocessNetworkData(requests);
    
    // Simulation d'entraînement Isolation Forest
    this.models.networkAnomaly.isTrained = true;
    
    console.log('✅ Modèle d\'anomalie réseau entraîné');
    return true;
  }

  // Analyser un fichier pour détection de malware
  analyzeFile(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);
      
      const features = this.extractFileFeatures(fileBuffer, stats);
      const prediction = this.predictMalware(features);
      
      return {
        filename: path.basename(filePath),
        size: stats.size,
        hash: crypto.createHash('sha256').update(fileBuffer).digest('hex'),
        features,
        prediction,
        risk: prediction.probability > 0.7 ? 'high' : prediction.probability > 0.5 ? 'medium' : 'low'
      };
    } catch (error) {
      console.error('Erreur analyse fichier:', error);
      return null;
    }
  }

  // Extraire les features d'un fichier
  extractFileFeatures(buffer, stats) {
    const entropy = this.calculateEntropy(buffer);
    const extension = path.extname(stats.name).toLowerCase();
    
    return {
      file_size: stats.size,
      file_extension: this.encodeExtension(extension),
      entropy: entropy,
      header_analysis: this.analyzeFileHeader(buffer)
    };
  }

  // Calculer l'entropie d'un fichier
  calculateEntropy(buffer) {
    const frequency = {};
    
    for (const byte of buffer) {
      frequency[byte] = (frequency[byte] || 0) + 1;
    }
    
    let entropy = 0;
    const length = buffer.length;
    
    for (const count of Object.values(frequency)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }

  // Encoder l'extension de fichier
  encodeExtension(extension) {
    const extensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.vbs', '.ps1'];
    return extensions.includes(extension) ? 1 : 0;
  }

  // Analyser l'en-tête du fichier
  analyzeFileHeader(buffer) {
    const header = buffer.slice(0, 20);
    const suspiciousPatterns = [
      Buffer.from('MZ'), // PE executable
      Buffer.from('\x7fELF'), // ELF executable
      Buffer.from('PK'), // ZIP archive
      Buffer.from('\x50\x4b\x05\x06') // ZIP archive
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (header.includes(pattern)) {
        return 1;
      }
    }
    
    return 0;
  }

  // Prédire si un fichier est un malware
  predictMalware(features) {
    if (!this.models.malwareClassifier.isTrained) {
      return { class: 'benign', probability: 0.5 };
    }

    // Simplification : scoring basé sur les features
    const weights = [0.2, 0.3, 0.3, 0.2];
    let score = 0;
    
    for (let i = 0; i < features.length; i++) {
      score += features[i] * weights[i];
    }
    
    const probability = Math.min(Math.max(score, 0), 1);
    
    return {
      class: probability > 0.5 ? 'malware' : 'benign',
      probability
    };
  }

  // Détecter le phishing dans une URL
  detectPhishing(url) {
    if (!this.models.phishingDetector.isTrained) {
      return { isPhishing: false, confidence: 0.5 };
    }

    const features = this.extractURLFeatures(url);
    const score = this.calculatePhishingScore(features);
    
    return {
      isPhishing: score > this.models.phishingDetector.threshold,
      confidence: score,
      features
    };
  }

  // Extraire les features d'une URL
  extractURLFeatures(url) {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      
      return {
        url_length: url.length,
        domain_length: domain ? domain.length : 0,
        https_present: urlObj.protocol === 'https:' ? 1 : 0,
        suspicious_words: this.countSuspiciousWords(url),
        has_subdomain: domain ? domain.split('.').length > 2 : 0,
        special_chars: (url.match(/[^a-zA-Z0-9]/g) || []).length
      };
    } catch (error) {
      return {
        url_length: 0,
        domain_length: 0,
        https_present: 0,
        suspicious_words: 0,
        has_subdomain: 0,
        special_chars: 0
      };
    }
  }

  // Compter les mots suspects dans une URL
  countSuspiciousWords(url) {
    const suspiciousWords = [
      'login', 'signin', 'account', 'update', 'verify', 'secure', 'bank',
      'paypal', 'click', 'confirm', 'suspended', 'blocked'
    ];
    
    return suspiciousWords.filter(word => 
      url.toLowerCase().includes(word)
    ).length;
  }

  // Calculer le score de phishing
  calculatePhishingScore(features) {
    const weights = [0.1, 0.1, 0.2, 0.3, 0.1, 0.1];
    let score = 0;
    
    for (let i = 0; i < features.length; i++) {
      score += features[i] * weights[i];
    }
    
    return Math.min(Math.max(score, 0), 1);
  }

  // Analyser le comportement utilisateur
  analyzeUserBehavior(userId, actions) {
    const features = this.extractBehaviorFeatures(actions);
    const anomalyScore = this.calculateBehaviorAnomalyScore(features);
    
    return {
      userId,
      anomalyScore,
      risk: anomalyScore > 0.7 ? 'high' : anomalyScore > 0.5 ? 'medium' : 'low',
      features,
      recommendations: this.generateSecurityRecommendations(anomalyScore)
    };
  }

  // Extraire les features de comportement
  extractBehaviorFeatures(actions) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const recentActions = actions.filter(action => 
      now - action.timestamp < dayMs
    );
    
    return {
      action_frequency: recentActions.length,
      unique_endpoints: new Set(recentActions.map(a => a.endpoint)).size,
      error_rate: recentActions.filter(a => a.status >= 400).length / recentActions.length,
      time_distribution: this.calculateTimeDistribution(recentActions),
      ip_changes: new Set(recentActions.map(a => a.ip)).size
    };
  }

  // Calculer la distribution temporelle
  calculateTimeDistribution(actions) {
    const hours = new Array(24).fill(0);
    
    for (const action of actions) {
      const hour = new Date(action.timestamp).getHours();
      hours[hour]++;
    }
    
    return hours;
  }

  // Calculer le score d'anomalie de comportement
  calculateBehaviorAnomalyScore(features) {
    const weights = [0.3, 0.2, 0.3, 0.1, 0.1];
    let score = 0;
    
    for (let i = 0; i < features.length; i++) {
      score += features[i] * weights[i];
    }
    
    return Math.min(Math.max(score, 0), 1);
  }

  // Générer des recommandations de sécurité
  generateSecurityRecommendations(anomalyScore) {
    if (anomalyScore > 0.8) {
      return [
        'Bloquer temporairement l\'utilisateur',
        'Exiger une authentification multi-facteurs',
        'Analyser manuellement les activités récentes'
      ];
    } else if (anomalyScore > 0.6) {
      return [
        'Surveiller les activités de l\'utilisateur',
        'Considérer une vérification supplémentaire'
      ];
    } else {
      return [
        'Activité normale',
        'Aucune action requise'
      ];
    }
  }

  // Sauvegarder les résultats d'analyse
  saveAnalysisResults(results, type = 'general') {
    const timestamp = new Date().toISOString();
    const filename = `ml-analysis-${type}-${timestamp}.json`;
    const filepath = path.join(__dirname, '../logs', filename);
    
    try {
      fs.writeFileSync(filepath, JSON.stringify({
        timestamp,
        type,
        results,
        models_used: Object.keys(this.models)
      }, null, 2));
      
      console.log(`📊 Analyse ML sauvegardée: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('Erreur sauvegarde analyse ML:', error);
      return null;
    }
  }

  // Obtenir les statistiques des modèles
  getModelStats() {
    return {
      models: Object.keys(this.models),
      trained_models: Object.entries(this.models)
        .filter(([name, model]) => model.isTrained)
        .map(([name]) => name),
      model_types: Object.entries(this.models)
        .map(([name, model]) => ({ name, type: model.type }))
    };
  }
}

module.exports = MLSecurity;
