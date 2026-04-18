# Tableaux NON utilisés et Fonctionnalités manquantes par utilisateur

## 🔴 TABLEAUX COMPLÈTEMENT NON UTILISÉS

Basé sur l'analyse du code backend et frontend, voici les tableaux qui n'ont **AUCUNE** implémentation:

### 1. **Permission** ❌
- **Aucun fichier** ne fait référence à cette table
- **Aucun controller** pour gérer les permissions
- **Aucune route** API
- **Impact**: Système de permissions très basique (seulement par rôle)

### 2. **HistoriqueRDV** ❌
- **Aucun fichier** ne fait référence à cette table
- **Aucun logging** des changements de statut
- **Impact**: Impossible de tracer qui a modifié quoi

### 3. **PieceJointe** ❌
- **Aucun fichier** ne fait référence à cette table
- **Aucun système** d'upload de fichiers génériques
- **Impact**: Pas de gestion centralisée des pièces jointes

### 4. **RDV_Package** ❌
- **Aucun fichier** ne fait référence à cette table
- **Impossible** de commander des packages via rendez-vous
- **Impact**: Les packages ne peuvent pas être liés aux RDV

### 5. **StatutRDV** ❌
- Table existe mais **jamais interrogée**
- Statuts codés en dur dans le code: `'PLANIFIE'`, `'CONFIRME'`, etc.
- **Impact**: Impossible d'ajouter/modifier des statuts dynamiquement

### 6. **StatutIntervention** ❌
- Table existe mais **jamais interrogée**
- Statuts codés en dur: `'EN_ATTENTE'`, `'EN_COURS'`, `'TERMINEE'`
- **Impact**: Impossible de gérer les statuts dynamiquement

### 7. **StatutReclamation** ❌
- Table existe mais **jamais interrogée**
- Statuts codés en dur: `'SOUMISE'`, `'EN_COURS'`, `'TRAITEE'`, `'CLOTUREE'`
- **Impact**: Impossible de gérer les statuts dynamiquement

### 8. **TypeNotification** ❌
- Table existe mais **jamais interrogée**
- Types codés en dur: `'EMAIL'`, `'SMS'`, `'PUSH'`
- **Impact**: Impossible de gérer les types dynamiquement

### 9. **appointment_logs** ❌ (visible dans l'image)
- **Aucun fichier** ne fait référence à cette table
- **Doublon** potentiel avec HistoriqueRDV

### 10. **ProblemePredéfini** ❌ (visible dans l'image)
- **Aucun fichier** ne fait référence à cette table
- **Impact**: Clients doivent décrire manuellement les problèmes

### 11. **ProblemesDiagnostic** ❌ (visible dans l'image)
- **Aucun fichier** ne fait référence à cette table
- **Impact**: Pas de suivi des diagnostics techniques

### 12. **PiecesJointes** ❌ (visible dans l'image - doublon?)
- **Aucun fichier** ne fait référence à cette table
- Probablement un doublon de PieceJointe

---

## 📋 VUES SQL NON UTILISÉES

### 1. **VW_PlanningRDV** ❌
- Vue existe mais **jamais utilisée** dans le code
- Pourrait optimiser l'affichage du planning

### 2. **VW_ReclamationsOuvertes** ❌
- Vue existe mais **jamais utilisée**
- Pourrait optimiser la liste des réclamations

### 3. **VW_StatsAgence** ❌
- Vue existe mais **jamais utilisée**
- Pourrait optimiser les statistiques

### 4. **VW_HistoriqueVehicule** ❌
- Vue existe mais **jamais utilisée**
- Pourrait optimiser l'historique véhicule

---

## 🎯 FONCTIONNALITÉS MANQUANTES PAR UTILISATEUR

### 👤 CLIENT

#### ✅ Fonctionnalités implémentées:
1. ✅ Inscription / Connexion
2. ✅ Gestion du profil
3. ✅ Gestion des véhicules (CRUD)
4. ✅ Prise de rendez-vous
5. ✅ Consultation des rendez-vous
6. ✅ Annulation de rendez-vous
7. ✅ Réclamations (CRUD)
8. ✅ Consultation du catalogue (packages, interventions)
9. ✅ Consultation des promotions
10. ✅ Notifications
11. ✅ Chatbot SAV
12. ✅ Feedback / Avis
13. ✅ Consultation des documents
14. ✅ Vérification téléphone (WhatsApp OTP)

#### ❌ Fonctionnalités manquantes:

**1. Historique complet du véhicule** 🔴 PRIORITÉ HAUTE
```
Fichiers à créer:
- backend/controllers/vehicleHistoryController.js
- backend/routes/vehicleHistoryRoutes.js
- frontend/app/client/vehicles/[id]/history/page.tsx
- frontend/lib/api/vehicleHistory.ts

Utiliser la vue: VW_HistoriqueVehicule
```

**2. Commander des packages lors du rendez-vous** 🟡 PRIORITÉ MOYENNE
```
Fichiers à modifier:
- backend/controllers/appointmentController.js (ajouter package_ids)
- frontend/app/client/rendez-vous/page.tsx (sélection packages)
- Utiliser la table: RDV_Package
```

**3. Upload de photos (véhicule, problème)** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- backend/middleware/uploadMiddleware.js (multer)
- backend/controllers/attachmentController.js
- backend/routes/attachmentRoutes.js
- frontend/components/FileUpload.tsx
- Utiliser la table: PieceJointe
```

**4. Sélection de problèmes prédéfinis** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- backend/controllers/problemController.js
- backend/routes/problemRoutes.js
- frontend/components/ProblemSelector.tsx
- Utiliser la table: ProblemePredéfini
```

**5. Suivi en temps réel du rendez-vous** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- backend/services/realtimeService.js (WebSocket)
- frontend/components/AppointmentTracker.tsx
```

**6. Historique des modifications de RDV** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- backend/controllers/historyController.js
- frontend/app/client/rendez-vous/[id]/history/page.tsx
- Utiliser la table: HistoriqueRDV
```

---

### 👨‍🔧 AGENT SAV

#### ✅ Fonctionnalités implémentées:
1. ✅ Connexion
2. ✅ Dashboard avec statistiques
3. ✅ Liste des rendez-vous
4. ✅ Confirmation de rendez-vous
5. ✅ Changement de statut RDV
6. ✅ Gestion des réclamations
7. ✅ Liste des clients
8. ✅ Consultation du catalogue
9. ✅ Gestion des interventions

#### ❌ Fonctionnalités manquantes:

**1. Validation des véhicules** 🔴 PRIORITÉ HAUTE
```
Fichiers à créer:
- backend/controllers/vehicleValidationController.js
- backend/routes/vehicleValidationRoutes.js
- frontend/app/dashboard/agent/vehicles/validation/page.tsx
- frontend/lib/api/vehicleValidation.ts

Endpoints:
- GET /api/agent/vehicles/pending (véhicules en attente)
- POST /api/agent/vehicles/:id/validate (valider)
- POST /api/agent/vehicles/:id/reject (refuser)
```

**2. Diagnostic technique** 🔴 PRIORITÉ HAUTE
```
Fichiers à créer:
- backend/controllers/diagnosticController.js
- backend/routes/diagnosticRoutes.js
- frontend/app/dashboard/agent/diagnostics/page.tsx
- frontend/lib/api/diagnostics.ts
- Utiliser la table: ProblemesDiagnostic
```

**3. Gestion des pièces jointes** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- frontend/app/dashboard/agent/attachments/page.tsx
- Utiliser la table: PieceJointe
```

**4. Historique des actions** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- frontend/app/dashboard/agent/history/page.tsx
- Utiliser la table: HistoriqueRDV
```

**5. Planning visuel (calendrier)** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- frontend/app/dashboard/agent/planning/page.tsx
- frontend/components/agent-dashboard/Calendar.tsx
- Utiliser la vue: VW_PlanningRDV
```

**6. Gestion des ordres de réparation** 🟢 PRIORITÉ BASSE
```
Fichiers à modifier:
- frontend/app/dashboard/agent/repair-orders/page.tsx (améliorer)
- Ajouter détails des pièces, temps, coûts
```

**7. Chat avec les clients** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- backend/services/chatService.js (WebSocket)
- frontend/app/dashboard/agent/messages/page.tsx
```

---

### 👨‍💼 ADMIN

#### ✅ Fonctionnalités implémentées:
1. ✅ Connexion
2. ✅ Dashboard avec statistiques
3. ✅ Gestion des utilisateurs (CRUD)
4. ✅ Gestion des marques/modèles/versions
5. ✅ Gestion des types d'interventions
6. ✅ Gestion des plages horaires
7. ✅ Gestion des packages
8. ✅ Gestion des promotions
9. ✅ Gestion des couleurs
10. ✅ Rapports et statistiques
11. ✅ Paramètres système

#### ❌ Fonctionnalités manquantes:

**1. Gestion des permissions** 🔴 PRIORITÉ HAUTE
```
Fichiers à créer:
- backend/controllers/permissionController.js
- backend/routes/permissionRoutes.js
- backend/middleware/permissionMiddleware.js
- frontend/app/dashboard/admin/permissions/page.tsx
- frontend/lib/api/permissions.ts
- Utiliser la table: Permission

Endpoints:
- GET /api/admin/permissions (liste)
- GET /api/admin/permissions/role/:roleId (par rôle)
- POST /api/admin/permissions (créer)
- PUT /api/admin/permissions/:id (modifier)
- DELETE /api/admin/permissions/:id (supprimer)
```

**2. Gestion des statuts (dynamique)** 🔴 PRIORITÉ HAUTE
```
Fichiers à créer:
- backend/controllers/statusController.js
- backend/routes/statusRoutes.js
- frontend/app/dashboard/admin/statuses/page.tsx
- frontend/lib/api/statuses.ts
- Utiliser les tables: StatutRDV, StatutIntervention, StatutReclamation

Endpoints:
- GET /api/admin/statuses/rdv
- GET /api/admin/statuses/intervention
- GET /api/admin/statuses/reclamation
- POST /api/admin/statuses/:type (créer)
- PUT /api/admin/statuses/:type/:code (modifier)
- DELETE /api/admin/statuses/:type/:code (supprimer)
```

**3. Gestion des types de notifications** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- backend/controllers/notificationTypeController.js
- backend/routes/notificationTypeRoutes.js
- frontend/app/dashboard/admin/notification-types/page.tsx
- Utiliser la table: TypeNotification
```

**4. Gestion des agences** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- backend/controllers/agencyController.js
- backend/routes/agencyRoutes.js
- frontend/app/dashboard/admin/agencies/page.tsx
- frontend/lib/api/agencies.ts

Endpoints:
- GET /api/admin/agencies
- POST /api/admin/agencies
- PUT /api/admin/agencies/:id
- DELETE /api/admin/agencies/:id
```

**5. Logs et audit trail** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- backend/middleware/auditMiddleware.js
- backend/controllers/auditController.js
- backend/routes/auditRoutes.js
- frontend/app/dashboard/admin/audit/page.tsx
- Utiliser la table: HistoriqueRDV (ou créer AuditLog)
```

**6. Gestion des problèmes prédéfinis** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- backend/controllers/predefinedProblemController.js
- backend/routes/predefinedProblemRoutes.js
- frontend/app/dashboard/admin/problems/page.tsx
- Utiliser la table: ProblemePredéfini
```

**7. Backup et restauration** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- backend/controllers/backupController.js
- backend/routes/backupRoutes.js
- frontend/app/dashboard/admin/backup/page.tsx
```

**8. Configuration email/SMS** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- frontend/app/dashboard/admin/communication/page.tsx
- Gérer les templates d'emails/SMS
```

---

### 👔 DIRECTION

#### ✅ Fonctionnalités implémentées:
1. ✅ Connexion
2. ✅ Dashboard avec statistiques (lecture seule)
3. ✅ Consultation des rapports

#### ❌ Fonctionnalités manquantes:

**1. Statistiques avancées par agence** 🔴 PRIORITÉ HAUTE
```
Fichiers à créer:
- frontend/app/dashboard/direction/agencies/page.tsx
- frontend/lib/api/directionStats.ts
- Utiliser la vue: VW_StatsAgence

Métriques:
- Taux de satisfaction par agence
- Temps moyen de traitement
- Revenus par agence
- Taux d'occupation
```

**2. Rapports personnalisés** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- frontend/app/dashboard/direction/reports/custom/page.tsx
- backend/controllers/customReportController.js
- Générateur de rapports avec filtres
```

**3. Tableaux de bord KPI** 🟡 PRIORITÉ MOYENNE
```
Fichiers à créer:
- frontend/app/dashboard/direction/kpi/page.tsx
- Graphiques interactifs
- Export PDF/Excel
```

**4. Comparaison périodes** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- frontend/app/dashboard/direction/comparison/page.tsx
- Comparer mois/trimestre/année
```

**5. Prévisions et tendances** 🟢 PRIORITÉ BASSE
```
Fichiers à créer:
- frontend/app/dashboard/direction/forecasts/page.tsx
- Analyse prédictive
```

---

## 📊 RÉSUMÉ DES PRIORITÉS

### 🔴 PRIORITÉ HAUTE (À implémenter immédiatement)

| Fonctionnalité | Utilisateur | Tables concernées | Effort |
|----------------|-------------|-------------------|--------|
| **Gestion des permissions** | ADMIN | Permission | 3-5 jours |
| **Gestion des statuts dynamiques** | ADMIN | StatutRDV, StatutIntervention, StatutReclamation | 2-3 jours |
| **Validation des véhicules** | AGENT | Vehicule | 2-3 jours |
| **Diagnostic technique** | AGENT | ProblemesDiagnostic | 3-4 jours |
| **Historique véhicule** | CLIENT | VW_HistoriqueVehicule | 1-2 jours |
| **Statistiques par agence** | DIRECTION | VW_StatsAgence | 2-3 jours |

### 🟡 PRIORITÉ MOYENNE (À planifier)

| Fonctionnalité | Utilisateur | Tables concernées | Effort |
|----------------|-------------|-------------------|--------|
| **Upload de fichiers** | CLIENT, AGENT | PieceJointe | 3-4 jours |
| **Commander packages dans RDV** | CLIENT | RDV_Package | 2-3 jours |
| **Planning visuel** | AGENT | VW_PlanningRDV | 2-3 jours |
| **Gestion des agences** | ADMIN | Agence | 2-3 jours |
| **Logs et audit** | ADMIN | HistoriqueRDV | 3-4 jours |
| **Rapports personnalisés** | DIRECTION | - | 3-5 jours |

### 🟢 PRIORITÉ BASSE (Nice to have)

| Fonctionnalité | Utilisateur | Tables concernées | Effort |
|----------------|-------------|-------------------|--------|
| **Problèmes prédéfinis** | CLIENT, ADMIN | ProblemePredéfini | 1-2 jours |
| **Suivi temps réel** | CLIENT | - | 3-5 jours |
| **Chat client-agent** | CLIENT, AGENT | - | 5-7 jours |
| **Backup/Restauration** | ADMIN | - | 2-3 jours |
| **Prévisions** | DIRECTION | - | 5-7 jours |

---

## 🎯 PLAN D'ACTION RECOMMANDÉ

### Phase 1: Corrections critiques (Semaine 1-2)
1. ✅ Vérification téléphone (FAIT)
2. ⏳ Gestion des permissions (ADMIN)
3. ⏳ Gestion des statuts dynamiques (ADMIN)
4. ⏳ Validation des véhicules (AGENT)

### Phase 2: Fonctionnalités essentielles (Semaine 3-4)
1. ⏳ Diagnostic technique (AGENT)
2. ⏳ Historique véhicule (CLIENT)
3. ⏳ Upload de fichiers (CLIENT, AGENT)
4. ⏳ Statistiques avancées (DIRECTION)

### Phase 3: Améliorations (Semaine 5-6)
1. ⏳ Commander packages dans RDV (CLIENT)
2. ⏳ Planning visuel (AGENT)
3. ⏳ Gestion des agences (ADMIN)
4. ⏳ Rapports personnalisés (DIRECTION)

### Phase 4: Optimisations (Semaine 7-8)
1. ⏳ Logs et audit (ADMIN)
2. ⏳ Problèmes prédéfinis (CLIENT, ADMIN)
3. ⏳ Améliorations UX
4. ⏳ Tests et corrections

---

## 📝 NOTES IMPORTANTES

1. **12 tableaux** sont complètement non utilisés
2. **4 vues SQL** ne sont jamais interrogées
3. **Tous les statuts** sont codés en dur (mauvaise pratique)
4. **Aucun système de permissions** granulaires
5. **Aucun historique** des modifications
6. **Aucun système d'upload** de fichiers génériques

**Taux d'utilisation réel**: ~60% des tableaux sont utilisés
