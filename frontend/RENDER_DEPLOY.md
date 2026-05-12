# Frontend Configuration for Render Deployment

## Service Type
- Type: Static Site (si vous voulez juste servir les fichiers)
- OU Type: Web Service (pour plus de flexibilité)

## Build Command
```
npm install && npm run build
```

## Start Command (Web Service only)
```
npm install -g serve && serve -s build -l 10000
```

## Environment Variables
Allez dans **Environment** et ajoutez :

```
REACT_APP_API_URL=https://signature-numerique-api.onrender.com/api
NODE_ENV=production
```

## Root Directory
- `frontend`

## Après le déploiement
- Render vous donnera une URL comme : https://signature-numerique-frontend.onrender.com
- Utilisez cette URL dans le CORS du backend si nécessaire
- Testez en accédant à : https://signature-numerique-frontend.onrender.com
