# Test de la Modification de Véhicule

## Problème Rencontré

Erreur "Accès non autorisé" lors du chargement de la page de modification.

## Solution Appliquée

Ajout de logs de débogage dans `backend/controllers/vehicleController.js` pour identifier le problème de comparaison des IDs.

### Modification effectuée:

```javascript
const getVehicleById = async (req, res) => {
  // ...
  const currentUserIdInt = parseInt(req.user.id, 10);
  const vehicleClientIdInt = parseInt(vehicle.client_id, 10);
  
  if (vehicleClientIdInt !== currentUserIdInt && !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès non autorisé' });
  }
  // ...
};
```

**Changement**: Conversion explicite de `vehicle.client_id` en entier avant comparaison.

## Comment Tester

### 1. Vérifier que le backend est démarré
```bash
# Le backend doit afficher:
🚀 Serveur monolithique démarré sur le port 3000
✅ Connecté à SQL Server (Database: STA_SAV_DB)
```

### 2. Aller sur la liste des véhicules
- URL: `http://localhost:3001/client/vehicles`
- Vous devez être connecté en tant que CLIENT

### 3. Cliquer sur le bouton "Modifier" (icône crayon)
- Cela vous redirige vers `/client/vehicles/{id}/edit`

### 4. Vérifier les logs du backend
Dans le terminal du backend, vous devriez voir:
```
[getVehicleById] vehicle.client_id: 3 type: number
[getVehicleById] req.user.id: 3 type: number
[getVehicleById] req.user.role: CLIENT
[getVehicleById] currentUserIdInt: 3
[getVehicleById] vehicleClientIdInt: 3
[getVehicleById] Match: true
```

### 5. Si l'erreur persiste

#### Cas 1: Les IDs ne correspondent pas
```
[getVehicleById] currentUserIdInt: 3
[getVehicleById] vehicleClientIdInt: 5
[getVehicleById] Match: false
```
**Problème**: Vous essayez de modifier un véhicule qui ne vous appartient pas.
**Solution**: Modifiez uniquement vos propres véhicules.

#### Cas 2: Type de données incorrect
```
[getVehicleById] vehicle.client_id: 3 type: string
[getVehicleById] req.user.id: 3 type: number
```
**Problème**: Les types ne correspondent pas.
**Solution**: La conversion `parseInt()` devrait résoudre ce problème.

### 6. Test de modification complète

Une fois la page chargée:
1. ✅ Vérifier que tous les champs sont pré-remplis
2. ✅ Modifier le numéro de châssis
3. ✅ Changer la couleur
4. ✅ Remplacer une image
5. ✅ Cliquer sur "Enregistrer les modifications"
6. ✅ Vérifier le message de succès
7. ✅ Vérifier la redirection vers `/client/vehicles`
8. ✅ Vérifier que les modifications sont enregistrées

## Commandes Utiles

### Redémarrer le backend
```bash
# Arrêter tous les processus Node
Get-Process node | Stop-Process -Force

# Démarrer le backend
cd backend
node server.js
```

### Voir les logs en temps réel
Les logs s'affichent automatiquement dans le terminal où le backend tourne.

### Tester l'API directement
```bash
# Récupérer un véhicule (remplacer {id} et {token})
curl http://localhost:3000/api/vehicles/{id} -H "Authorization: Bearer {token}"
```

## Résolution des Problèmes Courants

### Erreur: "Accès non autorisé"
- Vérifiez que vous êtes connecté
- Vérifiez que le véhicule vous appartient
- Vérifiez les logs du backend pour voir les IDs

### Erreur: "Véhicule non trouvé"
- Vérifiez que l'ID dans l'URL est correct
- Vérifiez que le véhicule existe dans la base de données

### Erreur: "Token invalide"
- Reconnectez-vous
- Vérifiez que le token n'a pas expiré

### Le formulaire ne se pré-remplit pas
- Vérifiez les logs du backend
- Vérifiez la console du navigateur (F12)
- Vérifiez que l'API retourne bien les données

## Prochaines Étapes

Une fois le test réussi:
1. Retirer les logs de débogage du backend (optionnel)
2. Tester la suppression de véhicule
3. Tester avec différents utilisateurs
4. Tester avec un ADMIN/AGENT (devrait pouvoir modifier tous les véhicules)
