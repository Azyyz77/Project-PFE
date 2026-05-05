# Tables Organisées par Domaine Fonctionnel - Pour Diagramme UML 📊

## Date: 3 Mai 2026
## Total: 44 Tables

---

## 🔐 DOMAINE 1: AUTHENTIFICATION & AUTORISATION (4 tables)

### Tables Principales
1. **Utilisateur** - Utilisateurs du système
2. **Role** - Rôles (CLIENT, AGENT, ADMIN, SUPER_ADMIN, DIRECTION)
3. **Permission** - Permissions granulaires
4. **AuditLog** - Journal d'audit des actions

### Relations
```
Utilisateur ──> Role (N:1)
Utilisateur ──> Permission (N:N via table intermédiaire)
AuditLog ──> Utilisateur (N:1)
```

---

## 🏢 DOMAINE 2: ORGANISATION (2 tables)

### Tables Principales
1. **Agence** - Agences STA Chery
2. **Ouvrier** - Ouvriers/Techniciens

### Relations
```
Utilisateur ──> Agence (N:1)
Ouvrier ──> Agence (N:1)
```

---

## 🚗 DOMAINE 3: CATALOGUE VÉHICULES (5 tables)

### Tables Principales
1. **Marque** - Marques automobiles (Chery, etc.)
2. **Modele** - Modèles de véhicules
3. **Version** - Versions spécifiques
4. **Couleur** - Couleurs disponibles
5. **PackageIntervention** - Packages d'équipement

### Relations
```
Modele ──> Marque (N:1)
Version ──> Modele (N:1)
```

---

## 🚙 DOMAINE 4: GESTION VÉHICULES CLIENTS (2 tables)

### Tables Principales
1. **Vehicule** - Véhicules des clients
2. **Diagnostic** - Diagnostics véhicules

### Relations
```
Vehicule ──> Utilisateur/Client (N:1)
Vehicule ──> Marque (N:1)
Vehicule ──> Modele (N:1)
Vehicule ──> Version (N:1)
Diagnostic ──> Vehicule (N:1)
Diagnostic ──> Utilisateur/Agent (N:1)
```

---

## 📅 DOMAINE 5: GESTION RENDEZ-VOUS (7 tables)

### Tables Principales
1. **RendezVous** - Rendez-vous clients
2. **StatutRDV** - Statuts des RDV
3. **PlageHoraire** - Plages horaires disponibles
4. **HistoriqueRDV** - Historique des modifications
5. **InterventionRDV** - Interventions liées au RDV
6. **RDV_Package** - Packages liés au RDV
7. **AffectationOuvrier** - Affectation ouvriers aux RDV

### Relations
```
RendezVous ──> Utilisateur/Client (N:1)
RendezVous ──> Vehicule (N:1)
RendezVous ──> Agence (N:1)
RendezVous ──> StatutRDV (N:1)
RendezVous ──> PlageHoraire (N:1)
HistoriqueRDV ──> RendezVous (N:1)
InterventionRDV ──> RendezVous (N:1)
RDV_Package ──> RendezVous (N:1)
AffectationOuvrier ──> RendezVous (N:1)
AffectationOuvrier ──> Ouvrier (N:1)
```

---

## 🔧 DOMAINE 6: CATALOGUE INTERVENTIONS (6 tables)

### Tables Principales
1. **InterventionCatalog** - Catalogue des interventions
2. **TypeIntervention** - Types d'interventions
3. **SousTypeIntervention** - Sous-types d'interventions
4. **StatutIntervention** - Statuts des interventions
5. **Package_SousType** - Liaison packages et sous-types
6. **ProblemePredefini** - Problèmes prédéfinis

### Relations
```
SousTypeIntervention ──> TypeIntervention (N:1)
Package_SousType ──> PackageIntervention (N:1)
Package_SousType ──> SousTypeIntervention (N:1)
InterventionRDV ──> TypeIntervention (N:1)
InterventionRDV ──> StatutIntervention (N:1)
```

---

## 👷 DOMAINE 7: GESTION OUVRIERS (3 tables)

### Tables Principales
1. **Ouvrier** - Ouvriers/Techniciens
2. **CompetenceOuvrier** - Compétences des ouvriers
3. **DisponibiliteOuvrier** - Disponibilités des ouvriers

### Relations
```
CompetenceOuvrier ──> Ouvrier (N:1)
CompetenceOuvrier ──> TypeIntervention (N:1)
DisponibiliteOuvrier ──> Ouvrier (N:1)
```

---

## 📝 DOMAINE 8: RÉCLAMATIONS (3 tables)

### Tables Principales
1. **Reclamation** - Réclamations clients
2. **StatutReclamation** - Statuts des réclamations
3. **ProblemesDiagnostic** - Problèmes diagnostiqués

### Relations
```
Reclamation ──> Utilisateur/Client (N:1)
Reclamation ──> Vehicule (N:1)
Reclamation ──> StatutReclamation (N:1)
ProblemesDiagnostic ──> Diagnostic (N:1)
ProblemesDiagnostic ──> ProblemePredefini (N:1)
```

---

## 📄 DOMAINE 9: GESTION DOCUMENTS (3 tables)

### Tables Principales
1. **Document** - Documents clients
2. **PieceJointe** - Pièces jointes
3. **DocumentTelecharge** - Documents téléchargeables

### Relations
```
Document ──> Utilisateur (N:1)
PieceJointe ──> [Entité polymorphe] (N:1)
DocumentTelecharge ──> SectionInformation (N:1)
```

---

## ℹ️ DOMAINE 10: SYSTÈME D'INFORMATION (3 tables)

### Tables Principales
1. **SectionInformation** - Sections d'information
2. **ContenuInformation** - Contenus informatifs
3. **DocumentTelecharge** - Documents à télécharger

### Relations
```
ContenuInformation ──> SectionInformation (N:1)
DocumentTelecharge ──> SectionInformation (N:1)
```

---

## 🔔 DOMAINE 11: NOTIFICATIONS & MESSAGES (4 tables)

### Tables Principales
1. **Notification** - Notifications système
2. **TypeNotification** - Types de notifications
3. **MessageAccueil** - Messages de bienvenue
4. **MessageLecture** - Tracking de lecture

### Relations
```
Notification ──> Utilisateur (N:1)
Notification ──> TypeNotification (N:1)
MessageAccueil ──> Utilisateur/Créateur (N:1)
MessageLecture ──> MessageAccueil (N:1)
MessageLecture ──> Utilisateur (N:1)
```

---

## 🎁 DOMAINE 12: PROMOTIONS (2 tables)

### Tables Principales
1. **Promotion** - Promotions générales
2. **PromotionVehicule** - Promotions sur véhicules

### Relations
```
PromotionVehicule ──> Marque (N:1)
PromotionVehicule ──> Modele (N:1)
PromotionVehicule ──> Agence (N:1)
```

---

## 💬 DOMAINE 13: FEEDBACK (1 table)

### Tables Principales
1. **Feedback** - Feedbacks clients

### Relations
```
Feedback ──> RendezVous (N:1)
```

---

## 🗄️ DOMAINE 14: SYSTÈME (1 table)

### Tables Principales
1. **sysdiagrams** - Diagrammes SQL Server (ignorer pour UML)

---

## 📊 RÉSUMÉ PAR DOMAINE

| Domaine | Tables | Priorité UML |
|---------|--------|--------------|
| 1. Authentification | 4 | 🔴 HAUTE |
| 2. Organisation | 2 | 🔴 HAUTE |
| 3. Catalogue Véhicules | 5 | 🔴 HAUTE |
| 4. Véhicules Clients | 2 | 🔴 HAUTE |
| 5. Rendez-vous | 7 | 🔴 HAUTE |
| 6. Interventions | 6 | 🟡 MOYENNE |
| 7. Ouvriers | 3 | 🟡 MOYENNE |
| 8. Réclamations | 3 | 🟡 MOYENNE |
| 9. Documents | 3 | 🟢 BASSE |
| 10. Information | 3 | 🟢 BASSE |
| 11. Notifications | 4 | 🟢 BASSE |
| 12. Promotions | 2 | 🟢 BASSE |
| 13. Feedback | 1 | 🟢 BASSE |
| 14. Système | 1 | ⚪ IGNORER |

**Total**: 44 tables (43 utiles + 1 système)

---

## 🎨 RECOMMANDATIONS POUR LE DIAGRAMME UML

### Diagramme Global (Vue d'ensemble)
Inclure uniquement:
- ✅ Tables principales de chaque domaine
- ✅ Relations clés (1:N, N:N)
- ✅ Attributs clés (PK, FK importantes)

### Diagrammes Détaillés par Domaine
Créer un diagramme séparé pour chaque domaine prioritaire:

1. **Diagramme Authentification & Organisation**
   - Utilisateur, Role, Permission, Agence

2. **Diagramme Véhicules**
   - Marque, Modele, Version, Couleur, Vehicule

3. **Diagramme Rendez-vous**
   - RendezVous, StatutRDV, PlageHoraire, InterventionRDV

4. **Diagramme Ouvriers**
   - Ouvrier, CompetenceOuvrier, AffectationOuvrier

5. **Diagramme Réclamations**
   - Reclamation, StatutReclamation, Diagnostic

---

## 📐 CARDINALITÉS PRINCIPALES

### Relations 1:N (Un à Plusieurs)
```
Role (1) ──────< (N) Utilisateur
Agence (1) ──────< (N) Utilisateur
Marque (1) ──────< (N) Modele
Modele (1) ──────< (N) Version
Client (1) ──────< (N) Vehicule
Client (1) ──────< (N) RendezVous
Vehicule (1) ──────< (N) RendezVous
RendezVous (1) ──────< (N) InterventionRDV
Ouvrier (1) ──────< (N) AffectationOuvrier
```

### Relations N:N (Plusieurs à Plusieurs)
```
Ouvrier (N) ↔ (N) TypeIntervention (via CompetenceOuvrier)
RendezVous (N) ↔ (N) PackageIntervention (via RDV_Package)
PackageIntervention (N) ↔ (N) SousTypeIntervention (via Package_SousType)
```

---

## ✅ PROCHAINES ÉTAPES

1. ✅ Créer le diagramme global (vue d'ensemble)
2. ✅ Créer les diagrammes détaillés par domaine
3. ✅ Ajouter les attributs pour chaque classe
4. ✅ Ajouter les méthodes principales (CRUD)
5. ✅ Documenter les contraintes et règles métier
6. ✅ Exporter en PDF/PNG pour le rapport

---

**Bon travail sur vos diagrammes UML!** 🎨📐

---

**Date**: 3 Mai 2026  
**Tables**: 44 (43 utiles)  
**Domaines**: 14  
**Prêt pour**: Diagrammes UML
