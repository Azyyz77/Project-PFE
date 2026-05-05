# 🔧 Fix: Erreur Mise à Jour Plage Horaire

**Date**: 5 mai 2026  
**Erreur**: `Erreur serveur` lors de `updateTimeSlot`  
**Statut**: ⚠️ DIAGNOSTIC EN COURS

---

## 🐛 Erreur Rencontrée

```
Error Message: Erreur serveur
at Object.put (lib/api/axios.ts:158:24)
at async Object.updateTimeSlot (lib/api/timeslots.ts:45:22)
at async handleSubmit (app/dashboard/admin/timeslots/page.tsx:40:9)
```

**Contexte** : L'utilisateur essaie de modifier une plage horaire depuis `/dashboard/admin/timeslots`

---

## 🔍 Diagnostic

### 1. Routes Configurées ✅
```javascript
// backend/routes/timeSlotRoutes.js
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), timeSlotController.updateTimeSlot);

// backend/server.js
app.use('/api/timeslots', timeSlotRoutes);
```

**Résultat** : Routes correctement configurées

### 2. Contrôleur Vérifié ✅
```javascript
// backend/controllers/timeSlotController.js
exports.updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { jour_semaine, heure_ouverture, heure_fermeture, capacite } = req.body;
    
    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('jour_semaine', sql.TinyInt, jour_semaine)
      .input('heure_ouverture', sql.Time, heure_ouverture)
      .input('heure_fermeture', sql.Time, heure_fermeture)
      .input('capacite', sql.Int, capacite)
      .query(`
        UPDATE PlageHoraire
        SET jour_semaine = @jour_semaine, heure_ouverture = @heure_ouverture,
            heure_fermeture = @heure_fermeture, capacite = @capacite
        WHERE id = @id
      `);

    res.json({ message: 'Plage horaire mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la plage horaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
```

**Résultat** : Code correct

### 3. Frontend API Client ✅
```typescript
// frontend/lib/api/timeslots.ts
updateTimeSlot: async (id: number, data: Partial<TimeSlot>): Promise<{ message: string }> => {
  const response = await api.put(`/timeslots/${id}`, data);
  return response.data;
}
```

**Résultat** : Appel API correct

---

## 🎯 Causes Possibles

### Cause 1: Backend Non Redémarré ⚠️
Le backend tourne avec l'ancienne version du code après les modifications du `workerController.js`.

**Solution** : Redémarrer le backend

### Cause 2: Erreur SQL ⚠️
Possible problème avec le format des données (heure_ouverture, heure_fermeture).

**Solution** : Vérifier les logs du backend

### Cause 3: Permissions ⚠️
L'utilisateur n'a peut-être pas le rôle ADMIN.

**Solution** : Vérifier le rôle de l'utilisateur

### Cause 4: Format des Heures ⚠️
Le format des heures envoyé par le frontend ne correspond pas au format SQL TIME.

**Solution** : Vérifier le format des données

---

## ✅ Solutions

### Solution 1: Redémarrer le Backend (PRIORITAIRE)

```bash
# Arrêter le backend
# Ctrl+C dans le terminal où il tourne

# OU tuer le processus
taskkill /PID 21452 /F

# Redémarrer
cd backend
npm run dev
```

**Pourquoi ?** Le backend doit être redémarré pour charger toutes les modifications récentes.

---

### Solution 2: Vérifier les Logs du Backend

Après avoir essayé de mettre à jour une plage horaire, vérifier les logs du backend :

```bash
# Dans le terminal du backend, rechercher :
Erreur lors de la mise à jour de la plage horaire: [détails de l'erreur]
```

**Erreurs possibles** :
- `Invalid column name` → Problème de structure de table
- `Conversion failed` → Problème de format de données
- `Permission denied` → Problème de permissions

---

### Solution 3: Vérifier le Format des Heures

Le frontend envoie les heures au format `HH:mm` (ex: "08:00"), mais SQL Server attend `HH:mm:ss`.

**Fix dans le contrôleur** :

```javascript
exports.updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    let { jour_semaine, heure_ouverture, heure_fermeture, capacite } = req.body;

    // Ajouter :00 si nécessaire
    if (heure_ouverture && !heure_ouverture.includes(':00')) {
      heure_ouverture = heure_ouverture + ':00';
    }
    if (heure_fermeture && !heure_fermeture.includes(':00')) {
      heure_fermeture = heure_fermeture + ':00';
    }

    const pool = await getConnection();
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('jour_semaine', sql.TinyInt, jour_semaine)
      .input('heure_ouverture', sql.Time, heure_ouverture)
      .input('heure_fermeture', sql.Time, heure_fermeture)
      .input('capacite', sql.Int, capacite)
      .query(`
        UPDATE PlageHoraire
        SET jour_semaine = @jour_semaine, heure_ouverture = @heure_ouverture,
            heure_fermeture = @heure_fermeture, capacite = @capacite
        WHERE id = @id
      `);

    res.json({ message: 'Plage horaire mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la plage horaire:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error.message // Ajouter le message d'erreur pour debug
    });
  }
};
```

---

### Solution 4: Vérifier la Structure de la Table

```bash
sqlcmd -S localhost -U dali -P Daligh2004 -d STA_SAV_DB -Q "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PlageHoraire'"
```

**Résultat attendu** :
```
COLUMN_NAME          DATA_TYPE
id                   bigint
agence_id            bigint
jour_semaine         tinyint
heure_ouverture      time
heure_fermeture      time
capacite             int
```

---

### Solution 5: Tester Manuellement l'API

```bash
# Test avec curl (après redémarrage du backend)
curl -X PUT http://localhost:3000/api/timeslots/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre_token>" \
  -d '{
    "jour_semaine": 1,
    "heure_ouverture": "08:00:00",
    "heure_fermeture": "17:00:00",
    "capacite": 5
  }'
```

---

## 🧪 Tests de Validation

### Test 1: Mise à Jour Simple
1. Aller sur `/dashboard/admin/timeslots`
2. Cliquer sur "Modifier" pour une plage existante
3. Changer la capacité de 4 à 5
4. Cliquer sur "Mettre à jour"
5. **Résultat attendu** : "Plage horaire mise à jour avec succès"

### Test 2: Mise à Jour des Horaires
1. Modifier l'heure d'ouverture de 08:00 à 09:00
2. Cliquer sur "Mettre à jour"
3. **Résultat attendu** : Mise à jour réussie

### Test 3: Vérification en Base
```sql
SELECT * FROM PlageHoraire WHERE id = 1
```
**Résultat attendu** : Les modifications sont bien enregistrées

---

## 📝 Checklist de Dépannage

- [ ] **Redémarrer le backend** (PRIORITAIRE)
- [ ] Vérifier les logs du backend pour l'erreur exacte
- [ ] Vérifier que l'utilisateur a le rôle ADMIN
- [ ] Vérifier le format des heures (HH:mm vs HH:mm:ss)
- [ ] Vérifier la structure de la table PlageHoraire
- [ ] Tester l'API manuellement avec curl
- [ ] Vérifier que la connexion à la base de données fonctionne

---

## 🚀 Action Immédiate

**ÉTAPE 1** : Redémarrer le backend
```bash
cd backend
# Ctrl+C pour arrêter
npm run dev
```

**ÉTAPE 2** : Réessayer la mise à jour depuis l'interface

**ÉTAPE 3** : Si l'erreur persiste, vérifier les logs du backend

---

## 📞 Support

Si le problème persiste après le redémarrage :

1. **Copier les logs du backend** (l'erreur complète)
2. **Copier les données envoyées** (depuis la console du navigateur)
3. **Vérifier la structure de la table** avec la requête SQL ci-dessus

---

**Action prioritaire : Redémarrer le backend maintenant ! 🚀**
