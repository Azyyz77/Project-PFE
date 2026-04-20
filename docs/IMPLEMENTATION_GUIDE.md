# Guide d'implémentation des fonctionnalités manquantes

## ✅ DÉJÀ IMPLÉMENTÉ

### 1. Validation des véhicules (AGENT) ✅ COMPLET

**Backend**:
- ✅ `backend/controllers/vehicleValidationController.js`
- ✅ `backend/routes/vehicleValidationRoutes.js`
- ✅ Routes ajoutées dans `backend/server.js`

**Frontend**:
- ✅ `frontend/lib/api/vehicleValidation.ts`
- ✅ `frontend/app/dashboard/agent/vehicles/validation/page.tsx`
- ✅ Navigation ajoutée dans le menu agent

**Documentation**:
- ✅ `docs/VEHICLE_VALIDATION_GUIDE.md`

**Statut**: ✅ Complètement implémenté

**Fonctionnalités**:
- ✅ Liste des véhicules en attente de validation
- ✅ Formulaire de validation avec vérification des documents
- ✅ Historique des validations (onglets: En attente, Validés, Refusés)
- ✅ Filtres et recherche (immatriculation, châssis, client, marque)
- ✅ Statistiques en temps réel (total, en attente, validés, refusés, délai moyen)
- ✅ Modal de détails avec toutes les informations
- ✅ Validation avec commentaire optionnel
- ✅ Refus avec raison obligatoire
- ✅ Notifications automatiques (push + WhatsApp)

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

### 4. Diagnostic technique (AGENT) ⚠️ PARTIELLEMENT IMPLÉMENTÉ

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

**Statut**: Backend complet, Frontend à créer

**Tables utilisées**: `Diagnostic`, `ProblemesDiagnostic`, `ProblemePredéfini`

---

### 5. Historique véhicule (CLIENT) ✅ COMPLET

**Backend**:
- ✅ `backend/controllers/vehicleHistoryController.js`
- ✅ `backend/routes/vehicleHistoryRoutes.js`
- ✅ Routes ajoutées dans `backend/server.js`

**Frontend**:
- ✅ `frontend/lib/api/vehicleHistory.ts`
- ✅ `frontend/app/client/vehicle-history/page.tsx`
- ✅ `frontend/app/client/vehicles/[id]/history/page.tsx`

**Statut**: ✅ Complètement implémenté

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

### 10. Gestion des agences (ADMIN) ✅ COMPLET

**Backend**:
- ✅ `backend/controllers/agencyController.js`
- ✅ `backend/routes/agencyRoutes.js`
- ✅ Routes ajoutées dans `backend/server.js`

**Frontend**:
- ✅ `frontend/lib/api/agencies.ts`
- ✅ `frontend/app/dashboard/admin/agencies/page.tsx`
- ✅ Navigation ajoutée dans le menu admin

**Statut**: ✅ Complètement implémenté

**Table utilisée**: `Agence`

---

### 11. Logs et audit (ADMIN) ✅ COMPLET

**Backend**:
- ✅ `backend/middleware/auditMiddleware.js`
- ✅ `backend/controllers/auditController.js`
- ✅ `backend/routes/auditRoutes.js`
- ✅ Routes ajoutées dans `backend/server.js`
- ✅ Migration: `backend/migrations/create_audit_log_table.sql`
- ✅ Table `AuditLog` créée avec 17 colonnes et 6 indexes

**Frontend**:
- ✅ `frontend/lib/api/audit.ts`
- ✅ `frontend/app/dashboard/admin/audit/page.tsx`
- ✅ Navigation ajoutée dans le menu admin (Shield icon)

**Documentation**:
- ✅ `AUDIT_SYSTEM_IMPLEMENTATION.md`
- ✅ `AUDIT_SYSTEM_SUMMARY.md`
- ✅ `AUDIT_DEPLOYMENT_CHECKLIST.md`
- ✅ `AUDIT_USER_GUIDE.md`
- ✅ `AUDIT_FINAL_STATUS.md`
- ✅ `AUDIT_QUICK_REFERENCE.md`

**Statut**: ✅ Complètement implémenté

**Table utilisée**: `AuditLog`

---

## 🟢 PRIORITÉ BASSE - Nice to have

### 12. Problèmes prédéfinis (CLIENT, ADMIN) ⏳ EN COURS

**Note**: Cette fonctionnalité est en cours d'implémentation. La table `ProblemePredefini` existe déjà dans la base de données avec des données de test.

**Backend**:
- ✅ Table `ProblemePredefini` créée (voir `add_missing_tables.sql`)
- ⏳ `backend/controllers/predefinedProblemController.js` (À CRÉER)
- ⏳ `backend/routes/predefinedProblemRoutes.js` (À CRÉER)

**Frontend**:
- ⏳ `frontend/lib/api/predefinedProblems.ts` (À CRÉER)
- ⏳ `frontend/app/dashboard/admin/predefined-problems/page.tsx` (À CRÉER)
- ⏳ `frontend/app/client/complaints/page.tsx` (À MODIFIER - ajouter sélection de problèmes)

**Intégration avec réclamations**:
- Permettre aux clients de sélectionner un problème prédéfini lors de la création d'une réclamation
- Ajouter une colonne `probleme_predefini_id` à la table `Reclamation`
- Afficher les solutions suggérées automatiquement

**Table utilisée**: `ProblemePredefini`

---

### 13. Suivi temps réel (CLIENT)
### 14. Chat client-agent (CLIENT, AGENT)
### 15. Backup/Restauration (ADMIN)
### 16. Prévisions (DIRECTION)

---

## 📊 RÉSUMÉ DES EFFORTS

| Fonctionnalité | Backend | Frontend | Total | Priorité | Statut |
|----------------|---------|----------|-------|----------|--------|
| Validation véhicules | ✅ Fait | ✅ Fait | 0j | 🔴 | ✅ Complet |
| Permissions | ✅ Fait | ✅ Fait | 0j | 🔴 | ✅ Complet |
| Statuts dynamiques | ✅ Fait | ✅ Fait | 0j | 🔴 | ✅ Complet |
| Diagnostic | ✅ Fait | ⏳ 2j | 2j | 🔴 | Backend OK |
| Historique véhicule | ✅ Fait | ✅ Fait | 0j | 🔴 | ✅ Complet |
| Stats direction | ⏳ 2j | ⏳ 2j | 4j | 🔴 | À faire |
| Upload fichiers | ⏳ 2j | ⏳ 2j | 4j | 🟡 | À faire |
| Packages dans RDV | ⏳ 1j | ⏳ 1j | 2j | 🟡 | À faire |
| Planning visuel | ⏳ 2j | ⏳ 2j | 4j | 🟡 | À faire |
| Gestion agences | ✅ Fait | ✅ Fait | 0j | 🟡 | ✅ Complet |
| Audit logs | ✅ Fait | ✅ Fait | 0j | 🟡 | ✅ Complet |
| Problèmes prédéfinis | ⏳ 2j | ⏳ 2j | 4j | � | En cours |

**Total restant**: ~20 jours de développement (réduit de 40j grâce aux implémentations déjà faites)

---

## 🎯 PLAN D'EXÉCUTION RECOMMANDÉ

### Sprint 1 (Semaine 1-2): Fondations ✅ TERMINÉ
1. ✅ Validation véhicules (Backend fait, Frontend à créer)
2. ✅ Gestion des permissions (COMPLET)
3. ✅ Gestion des statuts dynamiques (COMPLET)
4. ✅ Historique véhicule (COMPLET)
5. ✅ Gestion agences (COMPLET)
6. ✅ Audit logs (COMPLET)

### Sprint 2 (Semaine 3-4): Fonctionnalités métier ⏳ EN COURS
1. ⏳ Diagnostic technique (Backend fait, Frontend à créer)
2. ⏳ Problèmes prédéfinis (En cours d'implémentation)
3. ⏳ Upload de fichiers

### Sprint 3 (Semaine 5-6): Améliorations
1. ⏳ Stats direction
2. ⏳ Packages dans RDV
3. ⏳ Planning visuel

### Sprint 4 (Semaine 7-8): Finalisation
1. ⏳ Tests et corrections
2. ⏳ Documentation utilisateur
3. ⏳ Optimisations de performance

---

## 📝 NOTES IMPORTANTES

### ✅ Progrès réalisés
1. **Permissions** - Système complet avec 86 permissions initialisées
2. **Statuts dynamiques** - Gestion complète pour RDV, Interventions, Réclamations
3. **Historique véhicule** - Backend et frontend complets
4. **Gestion agences** - CRUD complet avec interface admin
5. **Audit logs** - Système complet avec middleware automatique, 6 docs de référence
6. **Validation véhicules** - Backend complet, frontend à créer
7. **Diagnostic technique** - Backend complet avec 30 problèmes prédéfinis, frontend à créer

### ⏳ En cours
- **Problèmes prédéfinis** - Table créée, intégration avec réclamations en cours

### 🔴 Priorités immédiates
1. Créer la page frontend de validation des véhicules (`frontend/app/dashboard/agent/vehicles/validation/page.tsx`)
2. Créer les pages frontend pour le diagnostic technique:
   - `frontend/app/dashboard/agent/diagnostics/page.tsx`
   - `frontend/app/dashboard/admin/problems/page.tsx`
3. Finaliser le système de problèmes prédéfinis et l'intégrer aux réclamations

### 🟡 Fonctionnalités manquantes importantes
1. **Stats direction** - Tableaux de bord pour la direction
2. **Upload fichiers** - Système de pièces jointes
3. **Packages dans RDV** - Commander des packages lors de la prise de RDV
4. **Planning visuel** - Calendrier interactif pour les agents

### 📊 Réduction de la charge de travail
- **Avant**: 40 jours estimés
- **Après implémentations**: 21 jours restants
- **Gain**: 19 jours (47.5% de réduction)

**Prochaine étape recommandée**: Finaliser le système de problèmes prédéfinis (en cours)
