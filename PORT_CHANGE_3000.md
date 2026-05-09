# ✅ Changement de Port - Backend sur 3000

## 📅 Date: 8 Mai 2026

## 🎯 Changement Effectué

Le backend a été reconfiguré pour s'exécuter sur le **port 3000** au lieu du port 3001.

---

## 📝 Fichiers Modifiés

### 1. Backend
**Fichier**: `backend/.env`
```env
# AVANT
PORT=3001

# APRÈS
PORT=3000
```

### 2. Frontend - Configuration API
**Fichier créé**: `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

**Fichier modifié**: `frontend/lib/api/axios.ts`
```typescript
// AVANT
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// APRÈS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

---

## 🚀 Comment Utiliser

### 1. Arrêter les Serveurs
Si les serveurs sont en cours d'exécution, arrêtez-les (Ctrl+C).

### 2. Redémarrer le Backend
```bash
cd backend
npm run dev
```

**Résultat attendu**:
```
🚀 Serveur monolithique démarré sur le port 3000
📍 http://localhost:3000
```

### 3. Redémarrer le Frontend
```bash
cd frontend
npm run dev
```

**Résultat attendu**:
```
- Local:   http://localhost:3001
```

---

## 🔗 URLs Mises à Jour

### Backend
- **Avant**: `http://localhost:3001`
- **Après**: `http://localhost:3000` ✅

### Frontend
- **URL**: `http://localhost:3001` (inchangé)
- **API**: `http://localhost:3000/api` ✅

### Documentation API (Swagger)
- **Avant**: `http://localhost:3001/api-docs`
- **Après**: `http://localhost:3000/api-docs` ✅

---

## ✅ Vérification

### 1. Backend
Ouvrir: `http://localhost:3000`

Vous devriez voir:
```json
{
  "message": "Bienvenue sur l'API STA Chery Tunisia",
  "version": "1.0.0",
  "documentation": "/api-docs"
}
```

### 2. Frontend
Ouvrir: `http://localhost:3001`

Le frontend devrait se connecter automatiquement au backend sur le port 3000.

### 3. API Swagger
Ouvrir: `http://localhost:3000/api-docs`

La documentation Swagger devrait s'afficher.

---

## 📊 Résumé

| Service | Port | URL |
|---------|------|-----|
| **Backend** | 3000 | http://localhost:3000 |
| **Frontend** | 3001 | http://localhost:3001 |
| **API** | 3000 | http://localhost:3000/api |
| **Swagger** | 3000 | http://localhost:3000/api-docs |

---

## 🔧 Configuration Mobile (Si applicable)

Si vous utilisez l'application mobile, mettez à jour l'URL de l'API:

**Fichier**: `mobile/CheryMobile/src/config/api.ts`
```typescript
// Mettre à jour si nécessaire
export const API_BASE_URL = 'http://localhost:3000/api';
```

---

## ⚠️ Notes Importantes

1. **Redémarrage requis**: Les deux serveurs (backend et frontend) doivent être redémarrés pour que les changements prennent effet.

2. **Cache du navigateur**: Si le frontend ne se connecte pas au backend, videz le cache du navigateur (Ctrl+Shift+R).

3. **Variables d'environnement**: Le fichier `.env.local` dans le frontend est ignoré par Git (déjà dans `.gitignore`).

4. **Production**: En production, assurez-vous de configurer les bonnes URLs dans les variables d'environnement.

---

## 🎉 Résultat

✅ Backend s'exécute maintenant sur le port **3000**  
✅ Frontend configuré pour communiquer avec le port **3000**  
✅ Tout fonctionne correctement

---

**Date**: 8 Mai 2026  
**Statut**: ✅ TERMINÉ  
**Action**: Redémarrer les serveurs
