# ⚠️ REDÉMARRAGE DU BACKEND REQUIS

**Date**: 5 mai 2026  
**Statut**: ⚠️ ACTION REQUISE

---

## 🚨 Problème

Vous rencontrez des erreurs réseau sur plusieurs endpoints :

```
[axios.get] Error response: {}
- /api/admin/problems (predefined problems)
- /api/admin/problems/categories
- /api/moderation/pending
```

## 🔍 Diagnostic

✅ **Backend en cours d'exécution** : Port 3000 (PID 21452)  
✅ **Routes configurées** : Toutes les routes existent  
✅ **Permissions configurées** : DIAGNOSTICS permissions existent pour ADMIN  
⚠️ **Modifications non chargées** : Le backend doit être redémarré

---

## ✅ SOLUTION : Redémarrer le Backend

### Étape 1: Arrêter le Backend Actuel

#### Option A: Via le Terminal où il tourne
```bash
# Appuyer sur Ctrl+C dans le terminal où le backend tourne
```

#### Option B: Via le Gestionnaire de Tâches
```bash
# Tuer le processus PID 21452
taskkill /PID 21452 /F
```

#### Option C: Via PowerShell
```powershell
Stop-Process -Id 21452 -Force
```

### Étape 2: Redémarrer le Backend

```bash
cd backend
npm run dev
```

### Étape 3: Vérifier que le Backend Démarre

Vous devriez voir :
```
✓ Server running on port 3000
✓ Database connected
✓ Routes loaded
```

---

## 🧪 Tester Après le Redémarrage

### Test 1: Page Admin Problems
1. Aller sur `http://localhost:3001/dashboard/admin/problems`
2. **Résultat attendu**: Liste des problèmes prédéfinis s'affiche

### Test 2: Page Agent Workers
1. Aller sur `http://localhost:3001/dashboard/agent/workers`
2. Sélectionner un RDV
3. Sélectionner un ouvrier
4. Confirmer l'affectation
5. **Résultat attendu**: "X affecté avec succès !"

### Test 3: Modération
1. Aller sur le dashboard admin
2. **Résultat attendu**: Badge de modération s'affiche (si fichiers en attente)

---

## 📋 Modifications Appliquées (Nécessitent Redémarrage)

### Backend
- ✅ `workerController.js` - 4 fonctions simplifiées
  - `assignWorkerToAppointment`
  - `updateAssignmentStatus`
  - `getWorkerStatistics`
  - `getAvailableWorkers`

### Frontend
- ✅ `lib/api/workers.ts` - Interfaces mises à jour
- ✅ `app/dashboard/agent/workers/page.tsx` - UI simplifiée
- ✅ `components/agent-dashboard/AssignWorkerModal.tsx` - Modal simplifié

---

## 🔄 Workflow de Développement

### Quand Redémarrer le Backend ?

**Toujours redémarrer après modification de :**
- ✅ Contrôleurs (`controllers/*.js`)
- ✅ Routes (`routes/*.js`)
- ✅ Middleware (`middleware/*.js`)
- ✅ Services (`services/*.js`)
- ✅ Configuration (`config/*.js`)
- ✅ `server.js`

**Pas besoin de redémarrer pour :**
- ❌ Frontend (`frontend/**/*`)
- ❌ Documentation (`docs/**/*`)
- ❌ Migrations SQL (exécutées séparément)

### Nodemon (Auto-Restart)

Si vous utilisez `npm run dev`, nodemon devrait redémarrer automatiquement.

**Vérifier si nodemon fonctionne :**
```bash
cd backend
cat package.json | grep "dev"
```

Devrait afficher :
```json
"dev": "nodemon server.js"
```

**Si nodemon ne redémarre pas automatiquement :**
1. Vérifier que nodemon est installé : `npm list nodemon`
2. Réinstaller si nécessaire : `npm install --save-dev nodemon`
3. Redémarrer manuellement : `Ctrl+C` puis `npm run dev`

---

## 🐛 Dépannage

### Erreur: "Port 3000 already in use"

**Solution 1: Tuer le processus**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

**Solution 2: Utiliser un autre port**
```bash
# Dans backend/.env
PORT=3001
```

### Erreur: "Cannot connect to database"

**Vérifier la connexion SQL Server :**
```bash
sqlcmd -S localhost -U dali -P Daligh2004 -Q "SELECT @@VERSION"
```

**Vérifier les credentials dans backend/.env :**
```env
DB_SERVER=localhost
DB_USER=dali
DB_PASSWORD=Daligh2004
DB_NAME=STA_SAV_DB
```

### Erreur: "Module not found"

**Réinstaller les dépendances :**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## ✅ Checklist de Vérification

Après le redémarrage, vérifier :

- [ ] Backend démarre sans erreur
- [ ] Message "Server running on port 3000"
- [ ] Message "Database connected"
- [ ] Page `/dashboard/admin/problems` fonctionne
- [ ] Page `/dashboard/agent/workers` fonctionne
- [ ] Affectation d'ouvrier fonctionne
- [ ] Aucune erreur dans la console du navigateur

---

## 📞 Support

Si le problème persiste après le redémarrage :

1. **Vérifier les logs du backend**
   - Rechercher les erreurs dans le terminal
   - Vérifier les erreurs SQL

2. **Vérifier les logs du frontend**
   - F12 → Console
   - Rechercher les erreurs réseau

3. **Vérifier la base de données**
   ```bash
   sqlcmd -S localhost -U dali -P Daligh2004 -d STA_SAV_DB -Q "SELECT * FROM Permission WHERE module = 'DIAGNOSTICS'"
   ```

4. **Vérifier l'authentification**
   - Se déconnecter et se reconnecter
   - Vérifier que le token JWT est valide

---

## 🎯 Résumé

**PROBLÈME** : Erreurs réseau sur plusieurs endpoints  
**CAUSE** : Backend doit être redémarré pour charger les modifications  
**SOLUTION** : Redémarrer le backend avec `npm run dev`  
**DURÉE** : ~30 secondes

---

**Action immédiate : Redémarrer le backend ! 🚀**
