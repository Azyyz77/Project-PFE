# Tâches à Faire - Par Ordre de Priorité

**Date**: 5 Mai 2026  
**Objectif**: Liste concrète des tâches pour compléter le projet

---

## 🔴 PRIORITÉ 1 - CRITIQUE (30h)

### Tâche 1: Ajouter les Rôles Manquants (2h)

**Fichiers à modifier**:

1. **Migration SQL** (30 min)
```bash
Créer: backend/migrations/add_missing_roles.sql
```

```sql
USE STA_SAV_DB;
GO

-- Supprimer l'ancienne contrainte
ALTER TABLE Utilisateur 
  DROP CONSTRAINT CK_Utilisateur_Role;
GO

-- Ajouter la nouvelle contrainte avec tous les rôles
ALTER TABLE Utilisateur
  ADD CONSTRAINT CK_Utilisateur_Role 
  CHECK (role IN (
    'CLIENT',
    'AGENT',
    'ADMIN',
    'DIRECTION',
    'CONTROLEUR_GESTION',
    'DIRECTEUR_TECHNIQUE',
    'RESPONSABLE_SERVICE_RAPIDE',
    'RESPONSABLE_ATELIER',
    'DIRECTEUR_GENERAL_ADJOINT'
  ));
GO

PRINT 'Rôles mis à jour avec succès';
```

2. **Middleware Backend** (30 min)
```bash
Modifier: backend/middleware/authorizeRoles.js
```

Ajouter les nouveaux rôles dans les constantes.

3. **Types Frontend** (30 min)
```bash
Modifier: frontend/types/auth.ts
```

```typescript
export type UserRole = 
  | 'CLIENT'
  | 'AGENT'
  | 'ADMIN'
  | 'DIRECTION'
  | 'CONTROLEUR_GESTION'
  | 'DIRECTEUR_TECHNIQUE'
  | 'RESPONSABLE_SERVICE_RAPIDE'
  | 'RESPONSABLE_ATELIER'
  | 'DIRECTEUR_GENERAL_ADJOINT';
```

4. **Page Admin Utilisateurs** (30 min)
```bash
Modifier: frontend/app/dashboard/admin/users/page.tsx
```

Ajouter les nouveaux rôles dans le dropdown de sélection.

**Commandes**:
```bash
# Exécuter la migration
cd backend
sqlcmd -S localhost -U dali -P Daligh2004 -d STA_SAV_DB -i migrations/add_missing_roles.sql

# Redémarrer le backend
npm start

# Tester
# Créer un utilisateur avec chaque nouveau rôle
```

---

### Tâche 2: Application Mobile - Écran Véhicules (3h)

**Fichiers à créer**:

1. **Écran Liste Véhicules** (1h30)
```bash
Créer: mobile/CheryMobile/src/screens/VehiclesScreen.tsx
```

**Fonctionnalités**:
- Liste des véhicules du client
- Bouton "Ajouter véhicule"
- Affichage: Marque, Modèle, Immatriculation
- Navigation vers détails

2. **Écran Détails Véhicule** (1h)
```bash
Créer: mobile/CheryMobile/src/screens/VehicleDetailScreen.tsx
```

**Fonctionnalités**:
- Afficher toutes les infos véhicule
- Bouton "Modifier"
- Bouton "Supprimer"
- Historique du véhicule

3. **Écran Ajouter Véhicule** (30 min)
```bash
Créer: mobile/CheryMobile/src/screens/AddVehicleScreen.tsx
```

**Fonctionnalités**:
- Formulaire ajout véhicule
- Sélection marque/modèle/version
- Validation

**API à utiliser**:
- `GET /api/vehicles/user/:userId`
- `POST /api/vehicles`
- `PUT /api/vehicles/:id`
- `DELETE /api/vehicles/:id`

---

### Tâche 3: Application Mobile - Écran Rendez-vous (5h)

**Fichiers à créer**:

1. **Écran Prendre RDV** (3h)
```bash
Créer: mobile/CheryMobile/src/screens/BookAppointmentScreen.tsx
```

**Fonctionnalités**:
- Sélection véhicule
- Sélection agence
- Sélection date
- Sélection créneau horaire
- Sélection interventions (types + sous-types)
- Tableau récapitulatif
- Bouton "Confirmer"

2. **Écran Liste RDV** (1h30)
```bash
Créer: mobile/CheryMobile/src/screens/AppointmentsScreen.tsx
```

**Fonctionnalités**:
- Liste des rendez-vous
- Filtres: À venir, Passés, Tous
- Statuts colorés
- Navigation vers détails

3. **Écran Détails RDV** (30 min)
```bash
Créer: mobile/CheryMobile/src/screens/AppointmentDetailScreen.tsx
```

**Fonctionnalités**:
- Détails complets du RDV
- Interventions demandées
- Statut
- Bouton "Annuler" (si possible)

**API à utiliser**:
- `GET /api/appointments/my`
- `POST /api/appointments`
- `GET /api/appointments/:id`
- `PUT /api/appointments/:id/cancel`
- `GET /api/appointments/slots`

---

### Tâche 4: Application Mobile - Écran Réclamations (4h)

**Fichiers à créer**:

1. **Écran Liste Réclamations** (1h30)
```bash
Créer: mobile/CheryMobile/src/screens/ComplaintsScreen.tsx
```

**Fonctionnalités**:
- Liste des réclamations
- Statuts colorés
- Numéro de réclamation
- Date de création
- Navigation vers détails

2. **Écran Nouvelle Réclamation** (2h)
```bash
Créer: mobile/CheryMobile/src/screens/NewComplaintScreen.tsx
```

**Fonctionnalités**:
- Sélection véhicule
- Sélection type de problème
- Description
- Upload photos (optionnel)
- Bouton "Soumettre"

3. **Écran Détails Réclamation** (30 min)
```bash
Créer: mobile/CheryMobile/src/screens/ComplaintDetailScreen.tsx
```

**Fonctionnalités**:
- Détails complets
- Historique des statuts
- Réponses de l'agence
- Photos attachées

**API à utiliser**:
- `GET /api/complaints/my-complaints`
- `POST /api/complaints`
- `GET /api/complaints/:id`

---

### Tâche 5: Application Mobile - Écran Profil (2h)

**Fichiers à créer**:

1. **Écran Profil** (1h30)
```bash
Créer: mobile/CheryMobile/src/screens/ProfileScreen.tsx
```

**Fonctionnalités**:
- Affichage infos utilisateur
- Bouton "Modifier profil"
- Bouton "Changer mot de passe"
- Bouton "Déconnexion"
- Préférences notifications

2. **Écran Modifier Profil** (30 min)
```bash
Créer: mobile/CheryMobile/src/screens/EditProfileScreen.tsx
```

**Fonctionnalités**:
- Formulaire modification
- Validation
- Bouton "Enregistrer"

**API à utiliser**:
- `GET /api/users/:id`
- `PUT /api/users/:id`

---

### Tâche 6: Application Mobile - Navigation (1h)

**Fichiers à modifier**:

1. **Configuration Navigation** (1h)
```bash
Modifier: mobile/CheryMobile/App.tsx
```

**À ajouter**:
- Stack Navigator pour tous les écrans
- Tab Navigator pour navigation principale
- Icônes pour chaque onglet

**Onglets principaux**:
- Accueil
- Véhicules
- Rendez-vous
- Réclamations
- Profil

---

### Tâche 7: Intégration Business Central - Service de Base (4h)

**Fichiers à créer**:

1. **Service Business Central** (3h)
```bash
Créer: backend/services/businessCentralService.js
```

```javascript
const axios = require('axios');

class BusinessCentralService {
  constructor() {
    this.baseUrl = process.env.BC365_API_URL;
    this.apiKey = process.env.BC365_API_KEY;
    this.companyId = process.env.BC365_COMPANY_ID;
  }

  async syncClient(clientData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/companies(${this.companyId})/customers`,
        {
          number: clientData.id,
          displayName: `${clientData.prenom} ${clientData.nom}`,
          phoneNumber: clientData.telephone,
          email: clientData.email
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur sync client BC365:', error);
      throw error;
    }
  }

  async syncVehicle(vehicleData) {
    // Similaire pour véhicule
  }

  async syncInvoice(invoiceData) {
    // Similaire pour facture
  }
}

module.exports = new BusinessCentralService();
```

2. **Variables d'environnement** (30 min)
```bash
Modifier: backend/.env
```

```env
# Business Central 365
BC365_API_URL=https://api.businesscentral.dynamics.com/v2.0/[tenant-id]/[environment]
BC365_API_KEY=your_api_key_here
BC365_COMPANY_ID=your_company_id_here
BC365_ENABLED=false
```

3. **Documentation** (30 min)
```bash
Créer: docs/INTEGRATION_BUSINESS_CENTRAL.md
```

**Contenu**:
- Configuration requise
- Variables d'environnement
- Endpoints disponibles
- Exemples d'utilisation
- Troubleshooting

---

### Tâche 8: Intégration Business Central - Tests (2h)

**Fichiers à créer**:

1. **Script de test** (1h)
```bash
Créer: backend/test-business-central.js
```

```javascript
const bcService = require('./services/businessCentralService');

async function testBC365() {
  console.log('Test connexion Business Central 365...');
  
  try {
    // Test 1: Sync client
    const testClient = {
      id: 1,
      prenom: 'Test',
      nom: 'Client',
      telephone: '+21612345678',
      email: 'test@example.com'
    };
    
    const result = await bcService.syncClient(testClient);
    console.log('✅ Sync client réussi:', result);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testBC365();
```

2. **Documentation tests** (1h)
```bash
Modifier: docs/INTEGRATION_BUSINESS_CENTRAL.md
```

Ajouter section "Tests et Validation".

---

### Tâche 9: Tests Finaux Mobile (3h)

**Tests à effectuer**:

1. **Tests fonctionnels** (2h)
- [ ] Login/Register fonctionne
- [ ] Liste véhicules s'affiche
- [ ] Ajout véhicule fonctionne
- [ ] Prise RDV fonctionne
- [ ] Liste RDV s'affiche
- [ ] Création réclamation fonctionne
- [ ] Profil s'affiche et se modifie
- [ ] Navigation entre écrans fluide

2. **Tests sur devices** (1h)
- [ ] Test sur Android (émulateur)
- [ ] Test sur iOS (émulateur)
- [ ] Test sur device réel Android
- [ ] Test sur device réel iOS

---

## 🟡 PRIORITÉ 2 - IMPORTANT (18h)

### Tâche 10: Système de Facturation (12h)

**Sous-tâches**:

1. **Migration Base de Données** (1h)
```bash
Créer: backend/migrations/create_invoicing_system.sql
```

2. **Contrôleur Backend** (3h)
```bash
Créer: backend/controllers/invoiceController.js
```

**Fonctions**:
- `createInvoice()`
- `getInvoices()`
- `getInvoiceById()`
- `updateInvoiceStatus()`
- `generateInvoicePDF()`

3. **Routes Backend** (1h)
```bash
Créer: backend/routes/invoiceRoutes.js
```

4. **API Frontend** (1h)
```bash
Créer: frontend/lib/api/invoices.ts
```

5. **Page Liste Factures Client** (2h)
```bash
Créer: frontend/app/client/invoices/page.tsx
```

6. **Page Détails Facture** (2h)
```bash
Créer: frontend/app/client/invoices/[id]/page.tsx
```

7. **Génération PDF** (2h)
```bash
Installer: npm install pdfkit
Créer: backend/services/pdfService.js
```

---

### Tâche 11: Notifications Automatiques (6h)

**Sous-tâches**:

1. **Service de Notifications** (2h)
```bash
Créer: backend/services/notificationService.js
```

**Fonctions**:
- `sendAppointmentConfirmation()`
- `sendAppointmentReminder()`
- `sendAppointmentCancellation()`
- `sendComplaintUpdate()`

2. **Templates Email** (2h)
```bash
Créer: backend/templates/emails/
  - appointment-confirmation.html
  - appointment-reminder.html
  - appointment-cancellation.html
  - complaint-update.html
```

3. **Scheduler** (1h)
```bash
Installer: npm install node-cron
Créer: backend/services/schedulerService.js
```

**Tâches planifiées**:
- Rappels RDV 24h avant (tous les jours à 9h)

4. **Tests** (1h)
- Tester chaque type de notification
- Vérifier les templates
- Vérifier le scheduler

---

## 🟢 PRIORITÉ 3 - OPTIONNEL (8h)

### Tâche 12: Documentation Utilisateur (4h)

**Fichiers à créer**:

1. **Guide Client** (2h)
```bash
Créer: docs/GUIDE_UTILISATEUR_CLIENT.md
```

**Sections**:
- Inscription et connexion
- Ajouter un véhicule
- Prendre un rendez-vous
- Suivre mes rendez-vous
- Faire une réclamation
- Consulter mes factures

2. **Guide Agent** (2h)
```bash
Créer: docs/GUIDE_UTILISATEUR_AGENT.md
```

**Sections**:
- Connexion
- Gérer les rendez-vous
- Valider les véhicules
- Traiter les réclamations
- Affecter des ouvriers
- Consulter les statistiques

---

### Tâche 13: Documentation Technique (4h)

**Fichiers à créer**:

1. **Guide Installation** (1h)
```bash
Créer: docs/GUIDE_INSTALLATION.md
```

2. **Guide Déploiement** (1h)
```bash
Créer: docs/GUIDE_DEPLOIEMENT.md
```

3. **Architecture Technique** (2h)
```bash
Créer: docs/ARCHITECTURE_TECHNIQUE.md
```

---

## 📋 Checklist Globale

### Phase 1 - Conformité (30h)
- [ ] Rôles manquants ajoutés (2h)
- [ ] App mobile - Véhicules (3h)
- [ ] App mobile - Rendez-vous (5h)
- [ ] App mobile - Réclamations (4h)
- [ ] App mobile - Profil (2h)
- [ ] App mobile - Navigation (1h)
- [ ] Intégration BC365 - Service (4h)
- [ ] Intégration BC365 - Tests (2h)
- [ ] Tests finaux mobile (3h)
- [ ] Documentation BC365 (2h)
- [ ] Tests d'intégration (2h)

### Phase 2 - Fonctionnalités (18h)
- [ ] Facturation - Migration (1h)
- [ ] Facturation - Backend (4h)
- [ ] Facturation - Frontend (4h)
- [ ] Facturation - PDF (2h)
- [ ] Facturation - Tests (1h)
- [ ] Notifications - Service (2h)
- [ ] Notifications - Templates (2h)
- [ ] Notifications - Scheduler (1h)
- [ ] Notifications - Tests (1h)

### Phase 3 - Documentation (8h)
- [ ] Guide utilisateur CLIENT (2h)
- [ ] Guide utilisateur AGENT (2h)
- [ ] Guide installation (1h)
- [ ] Guide déploiement (1h)
- [ ] Architecture technique (2h)

---

## 🎯 Ordre d'Exécution Recommandé

### Jour 1-2 (16h)
1. Rôles manquants (2h)
2. App mobile - Véhicules (3h)
3. App mobile - Rendez-vous (5h)
4. App mobile - Réclamations (4h)
5. Tests (2h)

### Jour 3-4 (14h)
6. App mobile - Profil (2h)
7. App mobile - Navigation (1h)
8. Intégration BC365 (6h)
9. Tests finaux (3h)
10. Documentation BC365 (2h)

### Jour 5-6 (18h) - OPTIONNEL
11. Facturation complète (12h)
12. Notifications (6h)

### Jour 7 (8h) - OPTIONNEL
13. Documentation (8h)

---

**Total minimum**: 30 heures (Jours 1-4)  
**Total recommandé**: 48 heures (Jours 1-6)  
**Total complet**: 56 heures (Jours 1-7)
