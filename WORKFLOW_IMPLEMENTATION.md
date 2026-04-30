# 🚀 Implémentation Workflow Multi-Signatures avec OTP

## 📋 Vue d'ensemble

Implémentation complète d'un système de workflow multi-signatures avec vérification OTP (One-Time Password) par email, inspiré des fonctionnalités d'OpenSign™.

## 🏗️ Structure du Projet

### Backend
```
backend/
├── models/
│   └── SignatureWorkflow.js     # Modèle MongoDB pour les workflows
├── controllers/
│   └── workflowController.js    # Logique métier des workflows
├── routes/
│   └── workflow.js              # Routes API
└── server.js                    # Intégration des routes
```

### Frontend
```
frontend/src/
├── pages/
│   ├── WorkflowSignature.jsx    # Page de signature
│   └── WorkflowSignature.css    # Styles de la page
├── components/
│   ├── CreateWorkflow.jsx       # Modal de création
│   └── CreateWorkflow.css      # Styles du modal
```

## 🔧 Installation et Configuration

### 1. Variables d'Environnement

Ajouter à votre fichier `.env`:
```env
# Configuration Email (Gmail)
EMAIL_USER=votre.email@gmail.com
EMAIL_PASS=votre-app-password-gmail
FRONTEND_URL=http://localhost:3000
```

### 2. Configuration Gmail

1. Activer la vérification en deux étapes sur votre compte Gmail
2. Générer un "App Password" depuis les paramètres de sécurité Google
3. Utiliser cet App Password dans `EMAIL_PASS`

### 3. Dépendances

Backend (déjà installé):
```bash
npm install nodemailer
```

Frontend (déjà installé):
```bash
npm install react-signature-canvas
```

## 📚 API Endpoints

### Workflow Management
- `POST /api/workflow/create` - Créer un nouveau workflow
- `GET /api/workflow/:id` - Obtenir les détails d'un workflow
- `GET /api/workflow/` - Lister les workflows de l'utilisateur

### Signature Process
- `POST /api/workflow/verify-otp` - Vérifier le code OTP
- `POST /api/workflow/sign` - Signer le document
- `POST /api/workflow/reject` - Refuser la signature
- `POST /api/workflow/resend-otp` - Renvoyer le code OTP

## 🔄 Flux de Travail

### 1. Création du Workflow
```javascript
POST /api/workflow/create
{
  "documentId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "emails": ["user1@email.com", "user2@email.com", "user3@email.com"]
}
```

### 2. Processus de Signature
1. Le premier signataire reçoit un email avec code OTP
2. Vérification du OTP (6 chiffres, valide 5 minutes)
3. Signature sur le canvas
4. Passage automatique au signataire suivant
5. Répétition jusqu'à completion ou refus

### 3. États du Workflow
- `pending` - En attente de première signature
- `in_progress` - Signatures en cours
- `completed` - Toutes les signatures collectées
- `cancelled` - Annulé suite à un refus

## 🎨 Interface Utilisateur

### Page de Signature (`/workflow/:workflowId`)
- Barre de progression visuelle
- Section de vérification OTP
- Canvas de signature tactile
- Actions: Signer, Effacer, Refuser
- Statut en temps réel

### Modal de Création
- Saisie des emails des signataires
- Validation des formats d'email
- Information sur le processus
- Confirmation de création

## 📧 Emails Envoyés

### Email d'Invitation
- Sujet: "📄 Signature requise - Document [nom]"
- Code OTP bien visible
- Lien direct vers la page de signature
- Design HTML responsive

### Sécurité des Emails
- OTP unique par workflow
- Expiration après 5 minutes
- Possibilité de renvoi
- Logs d'envoi conservés

## 🔒 Sécurité

### Authentification
- Toutes les routes protégées par JWT
- Vérification des permissions
- Logs d'accès avec IP et timestamp

### Validation des Données
- Validation stricte des emails
- Vérification des formats de signature
- Protection contre les injections

### Audit Trail
- Journalisation complète des actions
- Horodatages de chaque étape
- Conservation des raisons de refus
- Traçabilité complète

## 📊 Base de Données

### Collection `signatureworkflows`
```javascript
{
  documentId: ObjectId,
  steps: [{
    userId: ObjectId,
    email: String,
    order: Number,
    status: String, // pending, signed, rejected
    otpCode: String,
    otpExpires: Date,
    signedAt: Date,
    signatureData: String, // Base64
    rejectionReason: String
  }],
  currentStep: Number,
  status: String, // pending, in_progress, completed, cancelled
  createdAt: Date,
  completedAt: Date,
  createdBy: ObjectId
}
```

## 🚀 Utilisation

### 1. Intégration dans l'App React

Ajouter la route dans votre `App.jsx`:
```jsx
<Route path="/workflow/:workflowId" element={<WorkflowSignature />} />
```

### 2. Utilisation du Composant

```jsx
import CreateWorkflow from './components/CreateWorkflow';

// Dans votre composant de document
const [showWorkflow, setShowWorkflow] = useState(false);

<button onClick={() => setShowWorkflow(true)}>
  Créer un Workflow
</button>

{showWorkflow && (
  <CreateWorkflow
    documentId={document._id}
    onWorkflowCreated={(data) => {
      console.log('Workflow créé:', data);
    }}
    onClose={() => setShowWorkflow(false)}
  />
)}
```

## 🧪 Tests

### Test Manuel
1. Créer un workflow avec 2-3 emails
2. Vérifier la réception des emails OTP
3. Tester le processus de signature
4. Tester le refus de signature
5. Vérifier la progression du workflow

### Points à Vérifier
- ✅ Envoi des emails
- ✅ Validation OTP
- ✅ Sauvegarde des signatures
- ✅ Mise à jour du statut
- ✅ Gestion des erreurs
- ✅ Interface responsive

## 🔄 Maintenance

### Logs Importants
- `🚀 Création workflow par {email}`
- `📧 Envoi invitation à {email}`
- `✅ OTP validé pour {email}`
- `✍️ Signature du document`
- `❌ Rejet signature`

### Monitoring
- Surveiller les taux d'échec d'envoi d'emails
- Monitorer les temps de signature
- Analyser les taux de refus
- Vérifier les performances des workflows

## 🎯 Prochaines Améliorations

1. **Templates de Workflows** - Workflows réutilisables
2. **Signatures Séquentielles et Parallèles** - Options de configuration
3. **Notifications Push** - Notifications en temps réel
4. **Signature avancée** - Plusieurs types de signatures
5. **Analytics Dashboard** - Statistiques détaillées
6. **Integration API** - Connecteurs externes

---

## 📞 Support

Pour toute question ou problème, consultez les logs du backend ou contactez l'équipe de développement.

**Implémentation terminée avec succès !** ✅
