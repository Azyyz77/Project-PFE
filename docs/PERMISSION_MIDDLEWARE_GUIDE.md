# Guide d'utilisation des middlewares de permissions

## 📋 Vue d'ensemble

Le système de permissions permet de contrôler finement l'accès aux différentes fonctionnalités selon le rôle de l'utilisateur. Ce guide explique comment appliquer les middlewares de permissions aux routes existantes.

## 🔧 Middlewares disponibles

### 1. `requirePermission(module, action)`

Vérifie qu'un utilisateur a UNE permission spécifique.

```javascript
const { requirePermission } = require('../middleware/permissionMiddleware');

// L'utilisateur doit avoir la permission USERS.CREATE
router.post('/users', 
  authMiddleware, 
  requirePermission('USERS', 'CREATE'), 
  createUser
);
```

### 2. `requireAnyPermission([permissions])`

Vérifie qu'un utilisateur a AU MOINS UNE des permissions listées (logique OR).

```javascript
const { requireAnyPermission } = require('../middleware/permissionMiddleware');

// L'utilisateur doit avoir REPORTS.READ OU REPORTS.EXPORT
router.get('/reports', 
  authMiddleware, 
  requireAnyPermission([
    { module: 'REPORTS', action: 'READ' },
    { module: 'REPORTS', action: 'EXPORT' }
  ]), 
  getReports
);
```

### 3. `requireAllPermissions([permissions])`

Vérifie qu'un utilisateur a TOUTES les permissions listées (logique AND).

```javascript
const { requireAllPermissions } = require('../middleware/permissionMiddleware');

// L'utilisateur doit avoir USERS.DELETE ET SETTINGS.UPDATE
router.delete('/critical-action', 
  authMiddleware, 
  requireAllPermissions([
    { module: 'USERS', action: 'DELETE' },
    { module: 'SETTINGS', action: 'UPDATE' }
  ]), 
  criticalAction
);
```

### 4. `checkUserPermission(userId, module, action)`

Fonction helper pour vérifier une permission dans un contrôleur (pas un middleware).

```javascript
const { checkUserPermission } = require('../middleware/permissionMiddleware');

async function someController(req, res) {
  const hasPermission = await checkUserPermission(req.user.id, 'USERS', 'DELETE');
  
  if (!hasPermission) {
    return res.status(403).json({ error: 'Permission refusée' });
  }
  
  // Continuer...
}
```

## 📦 Modules disponibles

| Code | Description |
|------|-------------|
| `USERS` | Gestion des utilisateurs |
| `VEHICLES` | Gestion des véhicules |
| `APPOINTMENTS` | Gestion des rendez-vous |
| `INTERVENTIONS` | Gestion des interventions |
| `COMPLAINTS` | Gestion des réclamations |
| `CATALOG` | Gestion du catalogue |
| `PACKAGES` | Gestion des packages |
| `PROMOTIONS` | Gestion des promotions |
| `DOCUMENTS` | Gestion des documents |
| `NOTIFICATIONS` | Gestion des notifications |
| `REPORTS` | Rapports et statistiques |
| `SETTINGS` | Paramètres système |
| `PERMISSIONS` | Gestion des permissions |
| `AGENCIES` | Gestion des agences |
| `TIMESLOTS` | Gestion des plages horaires |

## 🎯 Actions disponibles

| Code | Description |
|------|-------------|
| `CREATE` | Créer une ressource |
| `READ` | Consulter une ressource |
| `UPDATE` | Modifier une ressource |
| `DELETE` | Supprimer une ressource |
| `VALIDATE` | Valider une ressource |
| `EXPORT` | Exporter des données |

## 🚀 Exemples d'application

### Routes utilisateurs (userRoutes.js)

```javascript
const { requirePermission } = require('../middleware/permissionMiddleware');

// Lecture - tous les rôles peuvent lire leur propre profil
router.get('/profile', authMiddleware, getUserProfile);

// Création - seuls ADMIN peuvent créer des utilisateurs
router.post('/', 
  authMiddleware, 
  requirePermission('USERS', 'CREATE'), 
  createUser
);

// Modification - seuls ADMIN peuvent modifier
router.put('/:id', 
  authMiddleware, 
  requirePermission('USERS', 'UPDATE'), 
  updateUser
);

// Suppression - seuls ADMIN peuvent supprimer
router.delete('/:id', 
  authMiddleware, 
  requirePermission('USERS', 'DELETE'), 
  deleteUser
);
```

### Routes véhicules (vehicleRoutes.js)

```javascript
const { requirePermission, requireAnyPermission } = require('../middleware/permissionMiddleware');

// Lecture - CLIENT, AGENT, ADMIN, DIRECTION
router.get('/', 
  authMiddleware, 
  requirePermission('VEHICLES', 'READ'), 
  getVehicles
);

// Création - seuls CLIENT
router.post('/', 
  authMiddleware, 
  requirePermission('VEHICLES', 'CREATE'), 
  createVehicle
);

// Validation - AGENT ou ADMIN
router.post('/:id/validate', 
  authMiddleware, 
  requirePermission('VEHICLES', 'VALIDATE'), 
  validateVehicle
);
```

### Routes rendez-vous (appointmentRoutes.js)

```javascript
const { requirePermission } = require('../middleware/permissionMiddleware');

// Création - CLIENT
router.post('/', 
  authMiddleware, 
  requirePermission('APPOINTMENTS', 'CREATE'), 
  createAppointment
);

// Lecture - tous
router.get('/', 
  authMiddleware, 
  requirePermission('APPOINTMENTS', 'READ'), 
  getAppointments
);

// Modification - CLIENT, AGENT, ADMIN
router.put('/:id', 
  authMiddleware, 
  requirePermission('APPOINTMENTS', 'UPDATE'), 
  updateAppointment
);

// Suppression - seuls ADMIN
router.delete('/:id', 
  authMiddleware, 
  requirePermission('APPOINTMENTS', 'DELETE'), 
  deleteAppointment
);

// Validation - AGENT ou ADMIN
router.post('/:id/validate', 
  authMiddleware, 
  requirePermission('APPOINTMENTS', 'VALIDATE'), 
  validateAppointment
);
```

### Routes catalogue (adminCatalogRoutes.js)

```javascript
const { requirePermission } = require('../middleware/permissionMiddleware');

// Lecture - tous peuvent consulter
router.get('/', 
  authMiddleware, 
  requirePermission('CATALOG', 'READ'), 
  getCatalog
);

// Création - seuls ADMIN
router.post('/', 
  authMiddleware, 
  requirePermission('CATALOG', 'CREATE'), 
  createCatalogItem
);

// Modification - seuls ADMIN
router.put('/:id', 
  authMiddleware, 
  requirePermission('CATALOG', 'UPDATE'), 
  updateCatalogItem
);

// Suppression - seuls ADMIN
router.delete('/:id', 
  authMiddleware, 
  requirePermission('CATALOG', 'DELETE'), 
  deleteCatalogItem
);
```

### Routes rapports (adminReportsRoutes.js)

```javascript
const { requireAnyPermission } = require('../middleware/permissionMiddleware');

// Lecture ou export - AGENT, ADMIN, DIRECTION
router.get('/', 
  authMiddleware, 
  requireAnyPermission([
    { module: 'REPORTS', action: 'READ' },
    { module: 'REPORTS', action: 'EXPORT' }
  ]), 
  getReports
);

// Export - ADMIN, DIRECTION
router.get('/export', 
  authMiddleware, 
  requirePermission('REPORTS', 'EXPORT'), 
  exportReports
);
```

## 🔒 Comportement spécial pour ADMIN

**Important**: Les utilisateurs avec le rôle `ADMIN` ont automatiquement accès à TOUTES les permissions, même si elles ne sont pas explicitement définies dans la table Permission.

Ceci est géré dans le middleware:

```javascript
// Les ADMIN ont tous les droits par défaut
if (userRole === 'ADMIN') {
  return next();
}
```

## ⚠️ Réponses d'erreur

### 401 - Non authentifié

```json
{
  "error": "Non authentifié",
  "message": "Vous devez être connecté pour accéder à cette ressource"
}
```

### 403 - Permission refusée

```json
{
  "error": "Permission refusée",
  "message": "Vous n'avez pas la permission d'effectuer cette action (USERS.DELETE)",
  "required_permission": {
    "module": "USERS",
    "action": "DELETE"
  }
}
```

### 500 - Erreur serveur

```json
{
  "error": "Erreur lors de la vérification des permissions",
  "message": "Connection timeout"
}
```

## 📝 Checklist d'implémentation

Pour chaque route sensible:

- [ ] Identifier le module concerné
- [ ] Identifier l'action (CREATE, READ, UPDATE, DELETE, VALIDATE, EXPORT)
- [ ] Ajouter `authMiddleware` en premier
- [ ] Ajouter le middleware de permission approprié
- [ ] Tester avec différents rôles
- [ ] Vérifier les messages d'erreur

## 🧪 Tests

### Test manuel avec Postman/Thunder Client

1. **Créer un utilisateur CLIENT**
2. **Se connecter et récupérer le token**
3. **Essayer d'accéder à une route ADMIN** (ex: POST /api/admin/users)
4. **Vérifier la réponse 403**

```bash
# Exemple avec curl
curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <CLIENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test","prenom":"User","email":"test@test.com"}'

# Réponse attendue: 403 Forbidden
```

## 📊 Matrice des permissions par rôle

| Module | Action | CLIENT | AGENT | ADMIN | DIRECTION |
|--------|--------|--------|-------|-------|-----------|
| USERS | CREATE | ❌ | ❌ | ✅ | ❌ |
| USERS | READ | ❌ | ❌ | ✅ | ✅ |
| USERS | UPDATE | ❌ | ❌ | ✅ | ❌ |
| USERS | DELETE | ❌ | ❌ | ✅ | ❌ |
| VEHICLES | CREATE | ✅ | ❌ | ❌ | ❌ |
| VEHICLES | READ | ✅ | ✅ | ✅ | ✅ |
| VEHICLES | UPDATE | ✅ | ❌ | ❌ | ❌ |
| VEHICLES | VALIDATE | ❌ | ✅ | ✅ | ❌ |
| APPOINTMENTS | CREATE | ✅ | ❌ | ❌ | ❌ |
| APPOINTMENTS | READ | ✅ | ✅ | ✅ | ✅ |
| APPOINTMENTS | UPDATE | ✅ | ✅ | ✅ | ❌ |
| APPOINTMENTS | DELETE | ❌ | ❌ | ✅ | ❌ |
| APPOINTMENTS | VALIDATE | ❌ | ✅ | ✅ | ❌ |
| INTERVENTIONS | CREATE | ❌ | ✅ | ✅ | ❌ |
| INTERVENTIONS | READ | ❌ | ✅ | ✅ | ✅ |
| INTERVENTIONS | UPDATE | ❌ | ✅ | ✅ | ❌ |
| INTERVENTIONS | DELETE | ❌ | ❌ | ✅ | ❌ |
| COMPLAINTS | CREATE | ✅ | ❌ | ❌ | ❌ |
| COMPLAINTS | READ | ✅ | ✅ | ✅ | ✅ |
| COMPLAINTS | UPDATE | ❌ | ✅ | ✅ | ❌ |
| CATALOG | CREATE | ❌ | ❌ | ✅ | ❌ |
| CATALOG | READ | ✅ | ✅ | ✅ | ✅ |
| CATALOG | UPDATE | ❌ | ❌ | ✅ | ❌ |
| CATALOG | DELETE | ❌ | ❌ | ✅ | ❌ |
| PACKAGES | CREATE | ❌ | ❌ | ✅ | ❌ |
| PACKAGES | READ | ❌ | ❌ | ✅ | ✅ |
| PACKAGES | UPDATE | ❌ | ❌ | ✅ | ❌ |
| PACKAGES | DELETE | ❌ | ❌ | ✅ | ❌ |
| PROMOTIONS | CREATE | ❌ | ❌ | ✅ | ❌ |
| PROMOTIONS | READ | ✅ | ❌ | ✅ | ✅ |
| PROMOTIONS | UPDATE | ❌ | ❌ | ✅ | ❌ |
| PROMOTIONS | DELETE | ❌ | ❌ | ✅ | ❌ |
| DOCUMENTS | CREATE | ❌ | ✅ | ✅ | ❌ |
| DOCUMENTS | READ | ✅ | ✅ | ✅ | ✅ |
| DOCUMENTS | UPDATE | ❌ | ❌ | ✅ | ❌ |
| DOCUMENTS | DELETE | ❌ | ❌ | ✅ | ❌ |
| NOTIFICATIONS | CREATE | ❌ | ❌ | ✅ | ❌ |
| NOTIFICATIONS | READ | ❌ | ❌ | ✅ | ❌ |
| REPORTS | READ | ❌ | ✅ | ✅ | ✅ |
| REPORTS | EXPORT | ❌ | ❌ | ✅ | ✅ |
| SETTINGS | READ | ❌ | ❌ | ✅ | ❌ |
| SETTINGS | UPDATE | ❌ | ❌ | ✅ | ❌ |
| PERMISSIONS | CREATE | ❌ | ❌ | ✅ | ❌ |
| PERMISSIONS | READ | ❌ | ❌ | ✅ | ❌ |
| PERMISSIONS | UPDATE | ❌ | ❌ | ✅ | ❌ |
| PERMISSIONS | DELETE | ❌ | ❌ | ✅ | ❌ |
| AGENCIES | CREATE | ❌ | ❌ | ✅ | ❌ |
| AGENCIES | READ | ❌ | ❌ | ✅ | ✅ |
| AGENCIES | UPDATE | ❌ | ❌ | ✅ | ❌ |
| AGENCIES | DELETE | ❌ | ❌ | ✅ | ❌ |
| TIMESLOTS | CREATE | ❌ | ❌ | ✅ | ❌ |
| TIMESLOTS | READ | ❌ | ❌ | ✅ | ❌ |
| TIMESLOTS | UPDATE | ❌ | ❌ | ✅ | ❌ |
| TIMESLOTS | DELETE | ❌ | ❌ | ✅ | ❌ |

## 🎯 Prochaines étapes

1. ✅ Permissions initialisées dans la base de données
2. ✅ Middlewares créés et documentés
3. ✅ Page frontend de gestion créée
4. ⏳ **Appliquer les middlewares aux routes existantes**
5. ⏳ Tester avec différents rôles
6. ⏳ Documenter les cas d'usage spécifiques

## 📚 Ressources

- **Backend Controller**: `backend/controllers/permissionController.js`
- **Middlewares**: `backend/middleware/permissionMiddleware.js`
- **Routes**: `backend/routes/permissionRoutes.js`
- **Frontend API**: `frontend/lib/api/permissions.ts`
- **Frontend Page**: `frontend/app/dashboard/admin/permissions/page.tsx`
- **Script d'initialisation**: `backend/scripts/initializePermissions.js`
