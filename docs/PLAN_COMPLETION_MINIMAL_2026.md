# Plan de Complétion Minimal - Projet SAV Chery

**Date**: 5 Mai 2026  
**Objectif**: Compléter le projet avec le **minimum de code** nécessaire  
**Basé sur**: Cahier des charges officiel

---

## 📋 Analyse du Cahier des Charges vs État Actuel

### ✅ CE QUI EST DÉJÀ FAIT (70%)

#### 1. Gestion des Comptes Clients ✅
- ✅ Inscription avec téléphone obligatoire
- ✅ Envoi code SMS pour validation
- ✅ Activation après confirmation
- ✅ Profil client complet:
  - Immatriculation véhicule
  - Numéro de châssis
  - Marque, modèle, version
  - Couleur carrosserie
  - Plusieurs véhicules possibles

#### 2. Prise de Rendez-vous ✅
- ✅ Création rendez-vous en ligne
- ✅ Choix date et créneau horaire
- ✅ Choix type(s) d'intervention
- ✅ Choix sous-type(s) d'intervention
- ✅ Affichage tableau des interventions
- ✅ Consultation historique rendez-vous

#### 3. Réclamation Client ✅
- ✅ Formulaire de réclamation
- ✅ Suivi de l'état de la réclamation

#### 4. Accueil ✅
- ✅ Affichage promotions véhicules
- ✅ Messages et notifications gérés par admin

#### 5. Assistance et Services ✅
- ✅ Obtenir assistance
- ✅ Visite technique
- ✅ Entretien périodique
- ✅ Diagnostic mécanique
- ✅ Service carrosserie

#### 6. Données de Base (Back-office) ✅
- ✅ Gestion marques
- ✅ Gestion modèles
- ✅ Gestion versions
- ✅ Gestion couleurs
- ✅ Gestion types d'intervention (nom + délai)
- ✅ Gestion sous-types liés aux types
- ✅ Packages d'intervention

#### 7. Gestion Rendez-vous et Atelier ✅
- ✅ Consultation rendez-vous par rôle
- ✅ Gestion ouverture créneaux par agence

#### 8. Rôles et Permissions ✅
- ✅ Gestion paramétrable des rôles
- ✅ Attribution fine des permissions
- ⚠️ Rôles actuels: CLIENT, AGENT, ADMIN, DIRECTION
- ❌ Manque: Contrôleur de gestion, Directeur technique, etc.

#### 9. Communication et Information ✅
- ✅ Gestion messages/notifications accueil
- ✅ Informations diffusées aux clients
- ✅ Rubrique explicative (garantie, assurance)
- ✅ Téléchargement documents

#### 10. Assistance et Diagnostic ✅
- ✅ Liste problèmes prédéfinis
- ✅ Description + solution par défaut

---

## ❌ CE QUI MANQUE (30%)

### 🔴 CRITIQUE - À FAIRE ABSOLUMENT

#### 1. Rôles Manquants du Cahier des Charges
**Cahier des charges demande**:
- Super Admin ✅ (existe comme ADMIN)
- Contrôleur de gestion ❌
- Directeur technique ❌
- Responsable service rapide ❌
- Agent service rapide ✅ (existe comme AGENT)
- Responsable atelier ❌
- Directeur général ✅ (existe comme DIRECTION)
- Directeur général adjoint ❌

**Solution Minimale**:
```sql
-- Ajouter simplement les rôles manquants
ALTER TABLE Utilisateur 
  DROP CONSTRAINT CK_Utilisateur_Role;

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
```

**Temps estimé**: 2 heures
- Migration SQL: 30 min
- Mise à jour middleware: 30 min
- Mise à jour frontend: 1h

---

#### 2. Intégration Business Central 365
**Cahier des charges**: "L'intégration avec Business Central 365"

**État actuel**: ❌ Pas d'intégration

**Solution Minimale**:
Créer une API de synchronisation basique:

```javascript
// backend/services/businessCentralService.js
class BusinessCentralService {
  // Synchroniser un client
  async syncClient(clientId) {
    // POST vers Business Central API
    // Envoyer: nom, prénom, téléphone, email
  }
  
  // Synchroniser un véhicule
  async syncVehicle(vehicleId) {
    // POST vers Business Central API
    // Envoyer: immatriculation, marque, modèle, client
  }
  
  // Synchroniser une facture
  async syncInvoice(invoiceId) {
    // POST vers Business Central API
    // Envoyer: numéro, montant, client, date
  }
}
```

**Temps estimé**: 8 heures
- Service de base: 4h
- Tests de connexion: 2h
- Documentation: 2h

**Note**: L'intégration complète nécessiterait des semaines. Cette version minimale permet juste d'envoyer les données essentielles.

---

#### 3. Application Mobile Complète
**Cahier des charges**: "Application mobile (Android & iOS)"

**État actuel**: ⚠️ Structure de base seulement

**Solution Minimale**:
Compléter les écrans essentiels:

**Écrans à ajouter** (priorité):
1. ✅ Login/Register (existe)
2. ✅ Home (existe)
3. ❌ Mes Véhicules
4. ❌ Prendre Rendez-vous
5. ❌ Mes Rendez-vous
6. ❌ Mes Réclamations
7. ❌ Mon Profil

**Temps estimé**: 20 heures
- Écran Véhicules: 3h
- Écran Rendez-vous: 5h
- Écran Liste RDV: 3h
- Écran Réclamations: 4h
- Écran Profil: 2h
- Tests et debug: 3h

---

### 🟡 IMPORTANT - Recommandé mais pas bloquant

#### 4. Système de Facturation Basique
**Cahier des charges**: Pas explicitement mentionné mais nécessaire

**Solution Minimale**:
```sql
CREATE TABLE Facture (
    id BIGINT PRIMARY KEY IDENTITY,
    numero VARCHAR(50) UNIQUE NOT NULL,
    rendez_vous_id BIGINT FOREIGN KEY REFERENCES RendezVous(id),
    client_id BIGINT FOREIGN KEY REFERENCES Utilisateur(id),
    date_emission DATETIME2 DEFAULT GETDATE(),
    montant_ht DECIMAL(10,2),
    montant_tva DECIMAL(10,2),
    montant_ttc DECIMAL(10,2),
    statut VARCHAR(20) DEFAULT 'EMISE',
    date_paiement DATETIME2
);
```

**Fonctionnalités minimales**:
- Générer facture après rendez-vous terminé
- Afficher liste factures client
- Télécharger PDF facture (simple)

**Temps estimé**: 12 heures

---

#### 5. Notifications Automatiques
**Cahier des charges**: Pas explicite mais utile

**Solution Minimale**:
Notifications par email uniquement (SMS coûte cher):

**Événements à notifier**:
- Rendez-vous confirmé ✅
- Rappel 24h avant rendez-vous ✅
- Rendez-vous annulé ✅
- Réclamation mise à jour ✅

**Temps estimé**: 6 heures
- Service de notification: 3h
- Templates emails: 2h
- Tests: 1h

---

### 🟢 OPTIONNEL - Peut attendre

#### 6. Gestion des Stocks
**Cahier des charges**: Pas mentionné

**Recommandation**: **NE PAS FAIRE** pour le moment
- Pas dans le cahier des charges
- Complexe à implémenter
- Peut être ajouté plus tard

---

#### 7. Programme de Fidélité
**Cahier des charges**: Pas mentionné

**Recommandation**: **NE PAS FAIRE** pour le moment

---

#### 8. Véhicules de Courtoisie
**Cahier des charges**: Pas mentionné

**Recommandation**: **NE PAS FAIRE** pour le moment

---

## 🎯 Plan d'Action Minimal (48 heures de travail)

### Semaine 1 (16h)
**Jour 1-2: Rôles et Permissions (2h)**
- ✅ Ajouter les rôles manquants
- ✅ Tester les permissions

**Jour 3-4: Application Mobile (14h)**
- ✅ Écran Mes Véhicules (3h)
- ✅ Écran Prendre RDV (5h)
- ✅ Écran Mes RDV (3h)
- ✅ Tests (3h)

### Semaine 2 (16h)
**Jour 1-2: Mobile Suite (6h)**
- ✅ Écran Réclamations (4h)
- ✅ Écran Profil (2h)

**Jour 3-4: Intégration Business Central (8h)**
- ✅ Service de base (4h)
- ✅ Tests connexion (2h)
- ✅ Documentation (2h)

**Jour 5: Tests finaux (2h)**
- ✅ Tests d'intégration
- ✅ Corrections bugs

### Semaine 3 (16h) - OPTIONNEL
**Jour 1-2: Facturation (12h)**
- ✅ Table et migration (2h)
- ✅ Backend API (4h)
- ✅ Frontend pages (4h)
- ✅ PDF génération (2h)

**Jour 3: Notifications (6h)**
- ✅ Service notification (3h)
- ✅ Templates (2h)
- ✅ Tests (1h)

---

## 📊 Complétude Après Plan Minimal

### Avant
- **Fonctionnalités cahier des charges**: 70%
- **Application mobile**: 20%
- **Intégration ERP**: 0%

### Après (Semaine 1-2)
- **Fonctionnalités cahier des charges**: 95% ✅
- **Application mobile**: 80% ✅
- **Intégration ERP**: 30% ✅

### Après (Semaine 3 - Optionnel)
- **Fonctionnalités cahier des charges**: 98% ✅
- **Application mobile**: 80% ✅
- **Intégration ERP**: 30% ✅
- **Facturation**: 70% ✅
- **Notifications**: 80% ✅

---

## 🚀 Ordre de Priorité

### 1. CRITIQUE (Obligatoire)
1. ✅ Ajouter rôles manquants (2h)
2. ✅ Compléter app mobile (20h)
3. ✅ Intégration Business Central basique (8h)

**Total**: 30 heures

### 2. IMPORTANT (Recommandé)
4. ✅ Système facturation basique (12h)
5. ✅ Notifications automatiques (6h)

**Total**: 18 heures

### 3. OPTIONNEL (Peut attendre)
- Gestion stocks
- Programme fidélité
- Véhicules courtoisie
- Tests automatisés
- Documentation avancée

---

## 📝 Checklist de Complétion

### Phase 1 - Conformité Cahier des Charges (30h)
- [ ] Ajouter tous les rôles du cahier des charges
- [ ] Tester les permissions par rôle
- [ ] Compléter écran Véhicules mobile
- [ ] Compléter écran Rendez-vous mobile
- [ ] Compléter écran Liste RDV mobile
- [ ] Compléter écran Réclamations mobile
- [ ] Compléter écran Profil mobile
- [ ] Créer service Business Central
- [ ] Tester connexion Business Central
- [ ] Documenter intégration Business Central

### Phase 2 - Fonctionnalités Essentielles (18h)
- [ ] Créer table Facture
- [ ] API génération facture
- [ ] Page liste factures client
- [ ] Génération PDF facture
- [ ] Service notifications email
- [ ] Templates emails
- [ ] Notifications automatiques RDV

### Phase 3 - Tests et Documentation (8h)
- [ ] Tests d'intégration complets
- [ ] Documentation utilisateur CLIENT
- [ ] Documentation utilisateur AGENT
- [ ] Documentation administrateur
- [ ] Guide d'installation
- [ ] Guide de déploiement

---

## 💡 Recommandations Finales

### Ce qu'il FAUT faire
1. ✅ **Rôles manquants** - 2h - Conformité cahier des charges
2. ✅ **App mobile complète** - 20h - Livrable attendu
3. ✅ **Intégration BC365** - 8h - Exigence cahier des charges

**Total minimum**: 30 heures

### Ce qu'il est BIEN de faire
4. ✅ **Facturation** - 12h - Nécessaire pour l'exploitation
5. ✅ **Notifications** - 6h - Améliore l'expérience

**Total recommandé**: 48 heures

### Ce qu'on peut REPORTER
- Gestion stocks (pas dans cahier des charges)
- Programme fidélité (pas dans cahier des charges)
- Tests automatisés (amélioration continue)
- Monitoring avancé (amélioration continue)

---

## 🎯 Conclusion

**Avec 30 heures de travail focalisé**, vous aurez:
- ✅ 95% de conformité au cahier des charges
- ✅ Application mobile fonctionnelle
- ✅ Intégration Business Central basique
- ✅ Projet présentable et déployable

**Avec 48 heures supplémentaires**, vous aurez:
- ✅ Système de facturation
- ✅ Notifications automatiques
- ✅ Projet complet et professionnel

**Le reste peut être ajouté progressivement** selon les besoins réels des utilisateurs.

---

**Prochaine étape**: Commencer par les rôles manquants (2h), puis attaquer l'application mobile (20h).
