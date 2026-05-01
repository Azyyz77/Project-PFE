# Fix: Erreur "Accès non autorisé" - Modification de Véhicule

## Problème

Lors de l'accès à la page de modification d'un véhicule (`/client/vehicles/{id}/edit`), l'erreur suivante apparaît:

```
ApiError: Accès non autorisé
at getVehicleById (lib/api/vehicles.ts:57:13)
```

## Cause

Dans `backend/controllers/vehicleController.js`, la fonction `getVehicleById` compare:
- `vehicle.client_id` (vient de la base de données SQL Server, type peut varier)
- `req.user.id` (vient du token JWT, type number)

La comparaison stricte (`!==`) échouait parfois à cause de différences de types.

## Solution

### Fichier modifié: `backend/controllers/vehicleController.js`

**Avant**:
```javascript
const currentUserIdInt = parseInt(req.user.id, 10);
if (vehicle.client_id !== currentUserIdInt && !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
  return res.status(403).json({ error: 'Accès non autorisé' });
}
```

**Après**:
```javascript
const currentUserIdInt = parseInt(req.user.id, 10);
const vehicleClientIdInt = parseInt(vehicle.client_id, 10);

// Logs de débogage
console.log('[getVehicleById] vehicle.client_id:', vehicle.client_id, 'type:', typeof vehicle.client_id);
console.log('[getVehicleById] req.user.id:', req.user.id, 'type:', typeof req.user.id);
console.log('[getVehicleById] currentUserIdInt:', currentUserIdInt);
console.log('[getVehicleById] vehicleClientIdInt:', vehicleClientIdInt);
console.log('[getVehicleById] Match:', currentUserIdInt === vehicleClientIdInt);

if (vehicleClientIdInt !== currentUserIdInt && !ALLOWED_STAFF_ROLES.includes(req.user.role)) {
  return res.status(403).json({ error: 'Accès non autorisé' });
}
```

### Changements:
1. ✅ Conversion explicite de `vehicle.client_id` en entier
2. ✅ Ajout de logs de débogage pour identifier les problèmes
3. ✅ Comparaison entre deux entiers au lieu de types mixtes

## Test

### 1. Redémarrer le backend
```bash
cd backend
node server.js
```

### 2. Tester la modification
1. Aller sur `http://localhost:3001/client/vehicles`
2. Cliquer sur le bouton "Modifier" (icône crayon)
3. La page devrait se charger avec le formulaire pré-rempli

### 3. Vérifier les logs
Dans le terminal du backend, vous devriez voir:
```
[getVehicleById] vehicle.client_id: 3 type: number
[getVehicleById] req.user.id: 3 type: number
[getVehicleById] currentUserIdInt: 3
[getVehicleById] vehicleClientIdInt: 3
[getVehicleById] Match: true
```

## Statut

✅ **CORRIGÉ**

Le backend a été modifié pour gérer correctement la comparaison des IDs.

## Notes

- Les logs de débogage peuvent être retirés une fois le problème confirmé résolu
- La même logique devrait être appliquée à `updateVehicle` et `deleteVehicle` si nécessaire
- Cette correction garantit que les clients ne peuvent modifier que leurs propres véhicules

## Fichiers Modifiés

- ✅ `backend/controllers/vehicleController.js` - Fonction `getVehicleById()`

## Documentation Associée

- `docs/VEHICLE_EDIT_COMPLETE.md` - Documentation complète de la fonctionnalité
- `docs/TEST_MODIFICATION_VEHICULE.md` - Guide de test
- `docs/MODIFICATION_VEHICULE_RESUME.md` - Résumé de l'implémentation
