#  Sécurité - Signature Numérique

une sécurité robuste et complète contre les attaques courantes.

---

## 🔒 **Protections Implémentées**

### **1. Sécurité des Headers (Helmet.js)**
- ✅ **Content Security Policy** - Prévention XSS
- ✅ **HTTP Strict Transport Security (HSTS)** - Force HTTPS
- ✅ **X-Frame-Options** - Anti-clickjacking
- ✅ **X-Content-Type-Options** - Anti-MIME sniffing
- ✅ **Referrer Policy** - Contrôle des infos de référence

### **2. Protection contre les injections**
- ✅ **XSS Protection** - Nettoyage automatique des entrées
- ✅ **MongoDB Sanitization** - Anti-injection NoSQL
- ✅ **Input Validation** - Validation des tailles et headers

### **3. Contrôle d'accès**
- ✅ **Rate Limiting** - 100 requêtes/15min par IP/utilisateur
- ✅ **CORS Configuré** - Origines autorisées uniquement
- ✅ **JWT Authentication** - Tokens sécurisés
- ✅ **2FA/TOTP** - Double authentification

### **4. Protection contre les attaques**
- ✅ **Brute Force Protection** - 5 tentatives max/15min
- ✅ **CSRF Protection** - Tokens anti-CSRF
- ✅ **Security Headers** - Headers OWASP complets

---

## 🚀 **Améliorations Apportées**

### **1. Migration vers HTTPS**
- ✅ Configuration HTTPS pour le backend
- ✅ Support des certificats SSL en production
- ✅ Variables d'environnement pour dev/prod
- ✅ CORS mis à jour pour HTTPS

### **2. Centralisation des URLs**
- ✅ Fichier `config/api.js` centralisé
- ✅ Variables d'environnement `.env.development` et `.env.production`
- ✅ URLs dynamiques selon l'environnement

### **3. Suppression des liens superflus**
- ✅ Plus de double affichage dans la console
- ✅ URLs centralisées et propres

---

## 📊 **Test de Sécurité OWASP Top 10**

| Attaque | Protection | Statut |
|---------|------------|---------|
| **A01: Injection** | MongoDB Sanitization | ✅ PROTÉGÉ |
| **A02: Auth** | JWT + 2FA + Rate Limit | ✅ PROTÉGÉ |
| **A03: Data Exposure** | HTTPS + Headers | ✅ PROTÉGÉ |
| **A04: XML External Entities** | Non applicable | ✅ PROTÉGÉ |
| **A05: Misconfig** | Configuration sécurisée | ✅ PROTÉGÉ |
| **A06: Vuln Components** | Dépendances à jour | ✅ PROTÉGÉ |
| **A07: Auth/Session** | JWT sécurisé | ✅ PROTÉGÉ |
| **A08: Crypto** | Hash bcrypt + JWT | ✅ PROTÉGÉ |
| **A09: CRLF Injection** | Input validation | ✅ PROTÉGÉ |
| **A10: SSRF** | CORS + CSP | ✅ PROTÉGÉ |




PAGE D'INSCRIPTION:
<img width="1102" height="1428" alt="Capture d&#39;écran 2026-04-30 055211" src="https://github.com/user-attachments/assets/576ec783-34e4-4a0b-8755-ebfe17759f6e" />

PAGE DE CONNEXION:

<img width="1196" height="1362" alt="Capture d&#39;écran 2026-04-30 055141" src="https://github.com/user-attachments/assets/200a832c-2701-41b2-811e-b9f3ccc067f0" />


PAGE D'AUTHENTIFICATION:
<img width="1250" height="1650" alt="Capture d&#39;écran 2026-04-30 055103" src="https://github.com/user-attachments/assets/878d4fd0-8818-4715-b5cd-99f4f8515d42" />
INVITATION DES SIGNATURES:
<img width="2182" height="1716" alt="Capture d&#39;écran 2026-05-02 101147" src="https://github.com/user-attachments/assets/64cccdb5-a1ad-42d2-9850-1f10967b96cb" />

VALIDATION SIGNATURE:
<img width="2063" height="1452" alt="Capture d&#39;écran 2026-05-02 101231" src="https://github.com/user-attachments/assets/17c5fabd-7eaf-4530-9fd7-34ba93154ecf" />
SECURITER API:
<img width="1956" height="1814" alt="Capture d&#39;écran 2026-04-29 135642" src="https://github.com/user-attachments/assets/20206c47-58b7-47ab-baba-4b09994f4d24" />

