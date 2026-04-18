# 🔧 Fix: Erreur "Invalid column name 'utilisateur_id'"

## 📋 Problème

L'erreur suivante apparaît lors de l'accès à l'historique véhicule:
```
RequestError: Invalid column name 'utilisateur_id'.
```

## 🔍 Cause

Le serveur backend exécute une **version cachée** du code qui utilise encore `utilisateur_id` au lieu de `client_id`. Le code source a été corrigé mais le serveur Node.js n'a pas été redémarré.

## ✅ Solution

### Étape 1: Arrêter le serveur backend

Dans le terminal où le serveur backend tourne, appuyez sur `Ctrl+C` pour l'arrêter.

### Étape 2: Vérifier que le code est correct

Le code dans `backend/controllers/vehicleHistoryController.js` utilise maintenant `client_id`:

```javascript
// ✅ CORRECT
.query('SELECT id FROM Vehicule WHERE id = @vehicleId AND client_id = @userId');
```

### Étape 3: Redémarrer le serveur

```bash
cd backend
npm start
```

Ou si vous utilisez nodemon:
```bash
cd backend
npm run dev
```

### Étape 4: Tester

Exécutez le script de test:
```bash
cd backend
node test-vehicle-history.js
```

Ou testez directement dans le navigateur en accédant à:
- Liste: `http://localhost:3000/client/vehicle-history`
- Détail: `http://localhost:3000/client/vehicles/[ID]/history`

## 📊 Vérification de la base de données

La table `Vehicule` utilise bien `client_id`:

```sql
CREATE TABLE [dbo].[Vehicule](
    [id] [bigint] IDENTITY(1,1) NOT NULL,
    [client_id] [bigint] NOT NULL,  -- ✅ Correct
    ...
)
```

## 🎯 Endpoints corrigés

Tous les endpoints suivants utilisent maintenant `client_id`:

1. **GET** `/api/vehicles/:id/history` - Historique complet
2. **GET** `/api/vehicles/:id/interventions` - Liste des interventions
3. **GET** `/api/vehicles/:id/appointments` - Liste des rendez-vous
4. **GET** `/api/vehicles/:id/history/export` - Export de l'historique

## 🔐 Sécurité

Chaque endpoint vérifie que:
- L'utilisateur est authentifié
- Si l'utilisateur est CLIENT, le véhicule lui appartient (via `client_id`)
- Les ADMIN et AGENT peuvent accéder à tous les véhicules

## 📝 Notes importantes

1. **Redémarrage obligatoire**: Node.js ne recharge pas automatiquement les modules sans redémarrage
2. **Nodemon recommandé**: Pour le développement, utilisez nodemon pour le rechargement automatique
3. **Cache navigateur**: Si l'erreur persiste, videz le cache du navigateur (Ctrl+Shift+R)

## 🚀 Prochaines étapes

Une fois le serveur redémarré:

1. ✅ Tester la liste des véhicules
2. ✅ Tester l'historique d'un véhicule spécifique
3. ✅ Vérifier les rendez-vous
4. ⏳ Implémenter la table Intervention (actuellement retourne un tableau vide)

## 🐛 Si l'erreur persiste

1. Vérifiez que vous êtes dans le bon dossier: `cd backend`
2. Vérifiez qu'aucun autre processus n'utilise le port 5000
3. Supprimez `node_modules` et réinstallez:
   ```bash
   rm -rf node_modules
   npm install
   npm start
   ```
4. Vérifiez les logs du serveur pour d'autres erreurs

---

**Date de correction**: 2026-04-17
**Fichiers modifiés**: 
- `backend/controllers/vehicleHistoryController.js`
- `backend/test-vehicle-history.js` (nouveau)
