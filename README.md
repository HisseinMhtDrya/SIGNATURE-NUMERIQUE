# 🖋️ Système de Signature Numérique Sécurisée
## Projet Sécurité Informatique - Master 1 2026

## 🎯 Fonctionnalités
- ✅ Signature numérique RSA 2048 + SHA-256
- ✅ Vérification intégrité automatique
- ✅ Traçabilité complète (IP, User-Agent, timestamps)
- ✅ Interface web React responsive
- ✅ Authentification JWT + bcrypt
- ✅ Upload sécurisé (PDF, DOC, DOCX)
- ✅ Protection CSRF, Rate Limiting, Helmet

## 🛠️ Technologies
- **Frontend**: React 18, Axios, React-Dropzone
- **Backend**: Node.js, Express, MongoDB
- **Sécurité**: JWT, bcrypt, RSA, SHA-256
- **Déploiement**: Docker, docker-compose

## 🚀 Installation & Démarrage

### Prérequis
- Node.js 18+
- MongoDB 6+
- Git

### Installation locale

```bash
# Cloner le projet
git clone <repository-url>
cd Projet-Signature-Numerique-2026

# Backend
cd backend
npm install
npm run dev

# Frontend (terminal séparé)
cd ../frontend
npm install
npm start
```

### Installation avec Docker

```bash
# Lancer tous les services
cd deployment
docker-compose up -d

# Vérifier les services
docker-compose ps
```

## 📊 Points d'accès API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/documents` | Upload document |
| POST | `/api/signatures/:id/sign` | Signer document |
| POST | `/api/signatures/:doc/verify/:sig` | Vérifier signature |
| GET | `/api/signatures/:id/history` | Historique signatures |

## 🔐 Sécurité implémentée

### Authentification
- **JWT** avec expiration 7 jours
- **Hashage bcrypt** (12 rounds)
- **Clés RSA 2048 bits** pour signatures

### Protection
- **Rate limiting** (100 requêtes/15min)
- **Helmet** pour en-têtes HTTP sécurisés
- **CORS** configuré
- **Validation fichiers** (10MB max, types autorisés)

### Cryptographie
- **SHA-256** pour intégrité documents
- **RSA 2048** pour signatures numériques
- **Hashage** mots de passe bcrypt

## 📁 Structure du projet

```
Projet-Signature-Numerique-2026/
├── backend/                 # API Node.js
│   ├── models/             # Schémas MongoDB
│   ├── routes/             # Routes API
│   ├── middleware/         # Middleware auth
│   ├── crypto/             # Fonctions cryptographiques
│   ├── uploads/            # Fichiers uploadés
│   └── server.js           # Serveur principal
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── App.js          # Application principale
│   │   └── index.css       # Styles globaux
│   └── public/             # Fichiers statiques
├── deployment/             # Configuration Docker
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── deploy.sh
├── docs/                   # Documentation technique
├── presentation/           # Contenu présentation
└── README.md
```

## 🎨 Interface utilisateur

### Page de connexion/inscription
- Formulaire d'authentification sécurisé
- Génération automatique clés RSA
- Stockage local token JWT

### Tableau de bord
- Zone de drag-drop pour upload
- Grille documents avec aperçu
- Actions rapides (signer, vérifier, télécharger)
- Historique signatures détaillé

### Fonctionnalités
- **Upload**: Glisser-déposer fichiers
- **Signature**: Clic bouton avec vérification intégrité
- **Vérification**: Validation automatique signature
- **Historique**: Traçabilité complète des actions

## 🧪 Tests & Validation

### Tests unitaires
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Tests d'intégration
- Upload documents variés
- Signature multiple utilisateurs
- Vérification intégrité
- Tests sécurité (injection, XSS)

## 🚨 Points d'attention

### Sécurité
- ⚠️ Clés privées stockées en base (production: utiliser vault)
- ⚠️ JWT secret à personnaliser en production
- ⚠️ Configurer HTTPS en production

### Performance
- ⚠️ Taille fichiers limitée à 10MB
- ⚠️ Rate limiting à ajuster selon usage
- ⚠️ Index MongoDB à optimiser

## 📈 Scalabilité

### Options déploiement
- **Cloud**: AWS, Azure, Google Cloud
- **PaaS**: Heroku, Railway, Render
- **Conteneurs**: Kubernetes, Docker Swarm

### Optimisations
- Cache Redis pour sessions
- CDN pour fichiers statiques
- Base de données clusterisée
- Load balancer haute disponibilité

## 🤝 Contribuer

1. Fork le projet
2. Créer branche fonctionnalité
3. Commiter changements
4. Pusher branche
5. Créer Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir fichier LICENSE pour détails.

## 👥 Équipe

- **Développement**: Équipe Master 1 Sécurité
- **Encadrement**: Professeur Sécurité Informatique
- **Année**: 2026

---

**Note**: Projet réalisé dans le cadre du cours de Sécurité Informatique - Master 1
