# Guide d'implémentation des fonctionnalités manquantes

## ✅ DÉJÀ IMPLÉMENTÉ

### 1. Validation des véhicules (AGENT) ✅
**Backend**:
- ✅ `backend/controllers/vehicleValidationController.js`
- ✅ `backend/routes/vehicleValidationRoutes.js`
- ✅ Routes ajoutées dans `backend/server.js`

**Frontend**:
- ✅ `frontend/lib/api/vehicleValidation.ts`
- ⏳ `frontend/app/dashboard/agent/vehicles/validation/page.tsx` (À CRÉER)

---

### 2. Gestion des permissions (ADMIN) ✅
**Backend**:
- ✅ `backend/controllers/permissionController.js`
- ✅ `backend/middleware/permissionMiddleware.js`
- ✅ `backend/routes/permissionRoutes.js`
- ✅ Routes ajoutées dans `backend/server.js`
- ✅ Script d'initialisation: `backend/scripts/initializePermissions.js`
- ✅ 86 permissions initialisées en base de données

**Frontend**:
- ✅ `frontend/lib/api/permissions.ts`
- ✅ `frontend/app/dashboard/admin/permissions/page.tsx`
- ✅ Navigation ajoutée dans le menu admin

**Documentation**:
- ✅ `docs/PERMISSION_MIDDLEWARE_GUIDE.md`
- ✅ `docs/PERMISSIONS_SYSTEM_COMPLETE.md`

---

### 3. Gestion des statuts dynamiques (ADMIN) ✅
**Backend**:
- ✅ `backend/controllers/statusController.js`
- ✅ `backend/routes/statusRoutes.js`
- ✅ Routes ajoutées dans `backend/server.js`
- ✅ Permissions appliquées (SETTINGS.READ, SETTINGS.UPDATE)

**Frontend**:
- ✅ `frontend/lib/api/statuses.ts`
- ✅ `frontend/app/dashboard/admin/statuses/page.tsx`
- ✅ Navigation ajoutée dans le menu admin
- ✅ Onglets pour RDV, Intervention, Réclamation
- ✅ Modals d'ajout, édition et statistiques

**Documentation**:
- ✅ `docs/STATUS_MANAGEMENT_COMPLETE.md`

**Tables utilisées**: `StatutRDV`, `StatutIntervention`, `StatutReclamation`

---

## 🔴 PRIORITÉ HAUTE - À IMPLÉMENTER

### 4. Diagnostic technique (AGENT) ✅

**Backend**:
- ✅ `backend/controllers/diagnosticController.js`
- ✅ `backend/controllers/predefinedProblemController.js`
- ✅ `backend/routes/diagnosticRoutes.js`
- ✅ `backend/routes/predefinedProblemRoutes.js`
- ✅ Routes ajoutées dans `backend/server.js`
- ✅ Migration: `backend/migrations/create_diagnostic_tables.sql`
- ✅ 30 problèmes prédéfinis insérés

**Frontend**:
- ✅ `frontend/lib/api/diagnostics.ts`
- ✅ `frontend/lib/api/predefinedProblems.ts`
- ⏳ `frontend/app/dashboard/agent/diagnostics/page.tsx` (À CRÉER)
- ⏳ `frontend/app/dashboard/admin/problems/page.tsx` (À CRÉER)

**Documentation**:
- ✅ `docs/DIAGNOSTIC_SYSTEM_COMPLETE.md`

**Tables utilisées**: `Diagnostic`, `ProblemesDiagnostic`, `ProblemePredéfini`

---

**Backend à créer**:
```javascript
// backend/controllers/diagnosticController.js
- createDiagnostic(rdv_id, problemes) - Créer diagnostic
- getDiagnosticByRDV(rdv_id) - Obtenir diagnostic
- updateDiagnostic(id, data) - Modifier
- addProbleme(diagnostic_id, probleme_id, description) - Ajouter problème
- removeProbleme(diagnostic_id, probleme_id) - Retirer problème

// backend/controllers/predefinedProblemController.js
- getProblemes() - Liste problèmes prédéfinis
- createProbleme(nom, description, categorie) - Créer
- updateProbleme(id, data) - Modifier
- deleteProbleme(id) - Supprimer

// backend/routes/diagnosticRoutes.js
- POST /api/agent/diagnostics
- GET /api/agent/diagnostics/rdv/:rdvId
- PUT /api/agent/diagnostics/:id
- POST /api/agent/diagnostics/:id/problemes
- DELETE /api/agent/diagnostics/:id/problemes/:problemeId

// backend/routes/predefinedProblemRoutes.js
- GET /api/admin/problems
- POST /api/admin/problems
- PUT /api/admin/problems/:id
- DELETE /api/admin/problems/:id
```

**Frontend à créer**:
```typescript
// frontend/lib/api/diagnostics.ts
- createDiagnostic(data)
- getDiagnostic(rdvId)
- updateDiagnostic(id, data)
- addProbleme(diagnosticId, problemeId, description)

// frontend/lib/api/predefinedProblems.ts
- getProblems()
- createProblem(data)
- updateProblem(id, data)
- deleteProblem(id)

// frontend/app/dashboard/agent/diagnostics/page.tsx
- Liste des diagnostics
- Formulaire de diagnostic
- Sélection de problèmes prédéfinis

// frontend/app/dashboard/admin/problems/page.tsx
- Gestion des problèmes prédéfinis
```

**Tables utilisées**: `ProblemesDiagnostic`, `ProblemePredéfini`

---

### 5. Historique véhicule (CLIENT)

**Backend à créer**:
```javascript
// backend/controllers/vehicleHistoryController.js
- getVehicleHistory(vehicleId) - Historique complet
- getVehicleInterventions(vehicleId) - Interventions
- getVehicleAppointments(vehicleId) - Rendez-vous
- exportHistory(vehicleId, format) - Export PDF/Excel

// backend/routes/vehicleHistoryRoutes.js
- GET /api/vehicles/:id/history
- GET /api/vehicles/:id/interventions
- GET /api/vehicles/:id/appointments
- GET /api/vehicles/:id/history/export
```

**Frontend à créer**:
```typescript
// frontend/lib/api/vehicleHistory.ts
- getHistory(vehicleId)
- getInterventions(vehicleId)
- getAppointments(vehicleId)
- exportHistory(vehicleId, format)

// frontend/app/client/vehicles/[id]/history/page.tsx
- Timeline des interventions
- Liste des rendez-vous
- Statistiques du véhicule
- Bouton export
```

**Vue utilisée**: `VW_HistoriqueVehicule`

---

### 6. Statistiques avancées (DIRECTION)

**Backend à créer**:
```javascript
// backend/controllers/directionStatsController.js
- getAgencyStats() - Stats par agence
- getGlobalStats(dateDebut, dateFin) - Stats globales
- getRevenueStats() - Revenus
- getSatisfactionStats() - Satisfaction client
- getPerformanceStats() - Performance agents
- exportStats(format) - Export

// backend/routes/directionStatsRoutes.js
- GET /api/direction/stats/agencies
- GET /api/direction/stats/global
- GET /api/direction/stats/revenue
- GET /api/direction/stats/satisfaction
- GET /api/direction/stats/performance
- GET /api/direction/stats/export
```

**Frontend à créer**:
```typescript
// frontend/lib/api/directionStats.ts
- getAgencyStats()
- getGlobalStats(filters)
- getRevenueStats(filters)
- getSatisfactionStats(filters)

// frontend/app/dashboard/direction/agencies/page.tsx
- Tableau comparatif des agences
- Graphiques de performance
- Filtres par période

// frontend/app/dashboard/direction/kpi/page.tsx
- Tableaux de bord KPI
- Graphiques interactifs
```

**Vue utilisée**: `VW_StatsAgence`

---

## 🟡 PRIORITÉ MOYENNE - À PLANIFIER

### 7. Upload de fichiers (CLIENT, AGENT)

**Backend à créer**:
```javascript
// backend/middleware/uploadMiddleware.js
- Configuration multer
- Validation types de fichiers
- Gestion taille max
- Stockage dans /uploads

// backend/controllers/attachmentController.js
- uploadFile(entite_type, entite_id, file) - Upload
- getAttachments(entite_type, entite_id) - Liste
- deleteAttachment(id) - Supprimer
- downloadAttachment(id) - Télécharger

// backend/routes/attachmentRoutes.js
- POST /api/attachments/upload
- GET /api/attachments/:entiteType/:entiteId
- DELETE /api/attachments/:id
- GET /api/attachments/:id/download
```

**Frontend à créer**:
```typescript
// frontend/components/FileUpload.tsx
- Composant drag & drop
- Preview des images
- Barre de progression
- Validation côté client

// frontend/lib/api/attachments.ts
- uploadFile(file, entiteType, entiteId)
- getAttachments(entiteType, entiteId)
- deleteAttachment(id)
- downloadAttachment(id)
```

**Table utilisée**: `PieceJointe`

---

### 8. Commander packages dans RDV (CLIENT)

**Backend à modifier**:
```javascript
// backend/controllers/appointmentController.js
- Modifier createAppointment() pour accepter package_ids
- Calculer prix total
- Enregistrer dans RDV_Package
- Retourner détails packages

// Ajouter dans la réponse:
{
  appointment: {...},
  interventions: [...],
  packages: [
    { id, nom, prix, quantite }
  ],
  prix_total: 450.00
}
```

**Frontend à modifier**:
```typescript
// frontend/app/client/rendez-vous/page.tsx
- Ajouter sélection de packages
- Afficher prix estimatif
- Calculer total
- Envoyer package_ids avec le RDV
```

**Table utilisée**: `RDV_Package`

---

### 9. Planning visuel (AGENT)

**Backend à créer**:
```javascript
// backend/controllers/planningController.js
- getPlanning(agenceId, dateDebut, dateFin) - Planning
- getAgentPlanning(agentId, date) - Planning agent
- updateSlot(rdvId, newDateTime) - Déplacer RDV

// backend/routes/planningRoutes.js
- GET /api/agent/planning
- GET /api/agent/planning/agent/:agentId
- PUT /api/agent/planning/rdv/:id/move
```

**Frontend à créer**:
```typescript
// frontend/app/dashboard/agent/planning/page.tsx
- Calendrier mensuel/hebdomadaire/journalier
- Drag & drop des RDV
- Filtres par agence/agent
- Légende des statuts

// frontend/components/agent-dashboard/Calendar.tsx
- Composant calendrier réutilisable
- Gestion des événements
```

**Vue utilisée**: `VW_PlanningRDV`

---

### 10. Gestion des agences (ADMIN)

**Backend à créer**:
```javascript
// backend/controllers/agencyController.js
- getAgencies() - Liste
- getAgency(id) - Détails
- createAgency(data) - Créer
- updateAgency(id, data) - Modifier
- deleteAgency(id) - Supprimer
- getAgencyStats(id) - Statistiques

// backend/routes/agencyRoutes.js
- GET /api/admin/agencies
- GET /api/admin/agencies/:id
- POST /api/admin/agencies
- PUT /api/admin/agencies/:id
- DELETE /api/admin/agencies/:id
- GET /api/admin/agencies/:id/stats
```

**Frontend à créer**:
```typescript
// frontend/lib/api/agencies.ts
- getAgencies()
- getAgency(id)
- createAgency(data)
- updateAgency(id, data)
- deleteAgency(id)

// frontend/app/dashboard/admin/agencies/page.tsx
- Tableau des agences
- Formulaire CRUD
- Carte avec localisation
```

**Table utilisée**: `Agence`

---

### 11. Logs et audit (ADMIN)

**Backend à créer**:
```javascript
// backend/middleware/auditMiddleware.js
- Intercepter toutes les modifications
- Logger dans HistoriqueRDV ou nouvelle table AuditLog
- Enregistrer: utilisateur, action, entité, ancien/nouveau

// backend/controllers/auditController.js
- getAuditLogs(filters) - Liste des logs
- getEntityHistory(entiteType, entiteId) - Historique entité
- exportLogs(filters, format) - Export

// backend/routes/auditRoutes.js
- GET /api/admin/audit
- GET /api/admin/audit/:entiteType/:entiteId
- GET /api/admin/audit/export
```

**Frontend à créer**:
```typescript
// frontend/lib/api/audit.ts
- getAuditLogs(filters)
- getEntityHistory(entiteType, entiteId)
- exportLogs(filters, format)

// frontend/app/dashboard/admin/audit/page.tsx
- Tableau des logs
- Filtres avancés
- Timeline des modifications
```

**Table utilisée**: `HistoriqueRDV` (ou créer `AuditLog`)

---

## 🟢 PRIORITÉ BASSE - Nice to have

### 12. Problèmes prédéfinis (CLIENT, ADMIN)
### 13. Suivi temps réel (CLIENT)
### 14. Chat client-agent (CLIENT, AGENT)
### 15. Backup/Restauration (ADMIN)
### 16. Prévisions (DIRECTION)

---

## 📊 RÉSUMÉ DES EFFORTS

| Fonctionnalité | Backend | Frontend | Total | Priorité |
|----------------|---------|----------|-------|----------|
| Validation véhicules | ✅ 1j | ⏳ 1j | 2j | 🔴 |
| Permissions | ⏳ 3j | ⏳ 2j | 5j | 🔴 |
| Statuts dynamiques | ⏳ 2j | ⏳ 1j | 3j | 🔴 |
| Diagnostic | ⏳ 3j | ⏳ 2j | 5j | 🔴 |
| Historique véhicule | ⏳ 1j | ⏳ 1j | 2j | 🔴 |
| Stats direction | ⏳ 2j | ⏳ 2j | 4j | 🔴 |
| Upload fichiers | ⏳ 2j | ⏳ 2j | 4j | 🟡 |
| Packages dans RDV | ⏳ 1j | ⏳ 1j | 2j | 🟡 |
| Planning visuel | ⏳ 2j | ⏳ 2j | 4j | 🟡 |
| Gestion agences | ⏳ 2j | ⏳ 1j | 3j | 🟡 |
| Audit logs | ⏳ 3j | ⏳ 2j | 5j | 🟡 |

**Total estimé**: ~40 jours de développement

---

## 🎯 PLAN D'EXÉCUTION RECOMMANDÉ

### Sprint 1 (Semaine 1-2): Fondations
1. ✅ Validation véhicules (FAIT)
2. ✅ Gestion des permissions (FAIT)
3. ✅ Gestion des statuts dynamiques (FAIT)

### Sprint 2 (Semaine 3-4): Fonctionnalités métier
1. ⏳ Diagnostic technique
2. ⏳ Historique véhicule
3. ⏳ Upload de fichiers

### Sprint 3 (Semaine 5-6): Améliorations
1. ⏳ Stats direction
2. ⏳ Packages dans RDV
3. ⏳ Planning visuel

### Sprint 4 (Semaine 7-8): Finalisation
1. ⏳ Gestion agences
2. ⏳ Audit logs
3. ⏳ Tests et corrections

---

## 📝 NOTES IMPORTANTES

1. **Validation véhicules** est déjà implémentée côté backend
2. Il reste à créer la page frontend pour l'utiliser
3. Toutes les autres fonctionnalités nécessitent backend + frontend
4. Les vues SQL existantes peuvent être réutilisées
5. Le système de permissions est critique pour la sécurité
6. L'audit trail est important pour la traçabilité

**Prochaine étape**: Créer la page frontend de validation des véhicules
