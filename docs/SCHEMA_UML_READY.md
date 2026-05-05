# ✅ Schéma de Base de Données Extrait pour UML

## Date: 3 Mai 2026

---

## 📁 Fichiers Générés

### ✅ Fichier Principal
**`docs/schema_extraction.txt`**
- Extraction complète du schéma
- Toutes les tables et colonnes
- Toutes les relations (clés étrangères)
- Format lisible et structuré

---

## 🎯 Comment Utiliser

### Méthode 1: Lecture Directe
```bash
# Ouvrir le fichier
notepad docs/schema_extraction.txt

# Ou dans VS Code
code docs/schema_extraction.txt
```

### Méthode 2: Réexécuter l'Extraction
```bash
# Script SQL simple (recommandé)
sqlcmd -S localhost -d STA_SAV_DB -U dali -P Daligh2004 -i backend/scripts/extract_schema_simple.sql -o docs/schema_extraction.txt

# Script SQL complet (plus détaillé)
sqlcmd -S localhost -d STA_SAV_DB -U dali -P Daligh2004 -i backend/scripts/extract_database_schema_for_uml.sql -o docs/schema_complete.txt
```

---

## 📊 Contenu Extrait

### Tables Principales (45+)

#### 👤 Gestion des Utilisateurs
- **Utilisateur** - Utilisateurs du système
- **Role** - Rôles (CLIENT, AGENT, ADMIN, etc.)
- **Permission** - Permissions granulaires

#### 🚗 Gestion des Véhicules
- **Vehicule** - Véhicules des clients
- **Marque** - Marques automobiles (Chery, etc.)
- **Modele** - Modèles de véhicules
- **Version** - Versions spécifiques
- **Couleur** - Couleurs disponibles
- **Package** - Packages d'équipement

#### 📅 Gestion des Rendez-vous
- **RendezVous** - Rendez-vous clients
- **CreneauHoraire** - Créneaux horaires disponibles
- **InterventionCatalog** - Catalogue d'interventions
- **TypeIntervention** - Types d'interventions

#### 📝 Gestion des Réclamations
- **Reclamation** - Réclamations clients
- **StatutReclamation** - Statuts des réclamations

#### 👷 Gestion des Ouvriers
- **Ouvrier** - Ouvriers/techniciens
- **AffectationOuvrier** - Affectations aux rendez-vous
- **CompetenceOuvrier** - Compétences des ouvriers

#### 🏢 Gestion des Agences
- **Agence** - Agences STA Chery

#### 📄 Gestion des Documents
- **Document** - Documents clients
- **PieceJointe** - Pièces jointes
- **DocumentTelecharge** - Documents téléchargeables

#### ℹ️ Système d'Information
- **SectionInformation** - Sections d'information
- **ContenuInformation** - Contenus informatifs
- **DocumentTelecharge** - Documents à télécharger

#### 🎁 Promotions
- **PromotionVehicule** - Promotions sur véhicules
- **MessageBienvenue** - Messages de bienvenue

#### 📊 Audit et Logs
- **AuditLog** - Journal d'audit
- **appointment_logs** - Logs de rendez-vous

---

## 🔗 Relations Principales

### Relations Utilisateur
```
Utilisateur.role_id ──> Role.id
Utilisateur.agence_id ──> Agence.id
```

### Relations Véhicule
```
Vehicule.client_id ──> Utilisateur.id
Vehicule.marque_id ──> Marque.id
Vehicule.modele_id ──> Modele.id
Vehicule.version_id ──> Version.id
Vehicule.couleur_id ──> Couleur.id
Modele.marque_id ──> Marque.id
Version.modele_id ──> Modele.id
```

### Relations Rendez-vous
```
RendezVous.client_id ──> Utilisateur.id
RendezVous.vehicule_id ──> Vehicule.id
RendezVous.agence_id ──> Agence.id
RendezVous.creneau_id ──> CreneauHoraire.id
```

### Relations Ouvriers
```
Ouvrier.agence_id ──> Agence.id
AffectationOuvrier.ouvrier_id ──> Ouvrier.id
AffectationOuvrier.rendez_vous_id ──> RendezVous.id
AffectationOuvrier.agent_id ──> Utilisateur.id
CompetenceOuvrier.ouvrier_id ──> Ouvrier.id
CompetenceOuvrier.type_intervention_id ──> TypeIntervention.id
```

### Relations Réclamations
```
Reclamation.client_id ──> Utilisateur.id
Reclamation.vehicule_id ──> Vehicule.id
Reclamation.statut_id ──> StatutReclamation.id
```

---

## 📐 Structure pour Diagrammes UML

### Diagramme de Classes - Exemple

```
┌─────────────────────────────────┐
│   <<entity>> Utilisateur        │
├─────────────────────────────────┤
│ - id: bigint {PK, AUTO}         │
│ - nom: nvarchar(100)            │
│ - prenom: nvarchar(100)         │
│ - email: nvarchar(255) {UNIQUE} │
│ - mot_de_passe: nvarchar(255)   │
│ - telephone: nvarchar(20)       │
│ - role_id: bigint {FK}          │
│ - agence_id: bigint {FK}        │
│ - actif: bit                    │
│ - date_creation: datetime       │
└─────────────────────────────────┘
         │                │
         │ N              │ N
         ▼                ▼
    ┌────────┐      ┌─────────┐
    │  Role  │      │ Agence  │
    └────────┘      └─────────┘
```

---

## 🎨 Cardinalités

### Un à Plusieurs (1..N)
- Un **Role** a plusieurs **Utilisateurs**
- Une **Agence** a plusieurs **Utilisateurs**
- Un **Client** a plusieurs **Véhicules**
- Une **Marque** a plusieurs **Modèles**
- Un **Modèle** a plusieurs **Versions**

### Plusieurs à Plusieurs (N..N)
- **Ouvrier** ↔ **TypeIntervention** (via CompetenceOuvrier)
- **RendezVous** ↔ **Ouvrier** (via AffectationOuvrier)

---

## 📝 Attributs Clés

### Clés Primaires (🔑)
- Toutes les tables ont un `id` auto-incrémenté
- Type: `bigint` (sauf quelques exceptions en `int`)

### Clés Étrangères (🔗)
- Suffixe `_id` (ex: `role_id`, `agence_id`)
- Relations avec `ON DELETE NO ACTION` (par défaut)
- Quelques relations avec `CASCADE`

### Champs Communs
- `date_creation` / `created_at` - Date de création
- `date_modification` / `updated_at` - Date de modification
- `actif` - Statut actif/inactif
- `deleted_at` - Soft delete (certaines tables)

---

## 🛠️ Outils Recommandés

### Pour Créer les Diagrammes

1. **Draw.io** (Gratuit)
   - Importer depuis le fichier texte
   - Créer manuellement les entités
   - Ajouter les relations

2. **PlantUML** (Gratuit)
   - Générer du code PlantUML
   - Compiler en image

3. **Lucidchart** (Payant)
   - Import CSV possible
   - Interface professionnelle

4. **Visual Paradigm** (Payant)
   - Reverse engineering
   - Génération automatique

---

## 📋 Checklist pour Diagrammes UML

### Diagramme de Classes
- [ ] Créer une classe pour chaque table
- [ ] Ajouter tous les attributs avec types
- [ ] Marquer les clés primaires (🔑)
- [ ] Marquer les clés étrangères (🔗)
- [ ] Ajouter les relations (associations)
- [ ] Indiquer les cardinalités (1..1, 1..N, N..N)
- [ ] Ajouter les stéréotypes (<<entity>>, <<table>>)

### Diagramme Entité-Relation (ERD)
- [ ] Créer une entité pour chaque table
- [ ] Lister les attributs principaux
- [ ] Souligner les clés primaires
- [ ] Tracer les relations
- [ ] Indiquer les cardinalités
- [ ] Ajouter les contraintes (UNIQUE, NOT NULL)

### Diagramme de Base de Données
- [ ] Inclure toutes les tables
- [ ] Tous les attributs avec types exacts
- [ ] Toutes les contraintes
- [ ] Tous les index
- [ ] Toutes les relations avec actions CASCADE

---

## 📊 Statistiques

- **Tables**: 45+
- **Colonnes**: 387+
- **Relations**: 52+
- **Vues**: 5+
- **Index**: 60+

---

## 🎯 Prochaines Étapes

1. ✅ Ouvrir `docs/schema_extraction.txt`
2. ✅ Identifier les tables principales
3. ✅ Créer le diagramme de classes
4. ✅ Créer le diagramme ERD
5. ✅ Documenter les relations
6. ✅ Ajouter les cardinalités
7. ✅ Exporter en PDF/PNG
8. ✅ Inclure dans le rapport

---

## 💡 Conseils

### Pour un Diagramme Lisible
- Grouper les tables par domaine (Utilisateurs, Véhicules, etc.)
- Utiliser des couleurs différentes par domaine
- Ne pas surcharger avec trop de détails
- Créer plusieurs diagrammes si nécessaire

### Pour la Documentation
- Expliquer chaque relation importante
- Documenter les règles métier
- Préciser les contraintes spéciales
- Ajouter des exemples de données

---

## ✅ Résultat Attendu

Après avoir utilisé ce schéma, vous aurez:

✅ Un diagramme de classes UML complet  
✅ Un diagramme entité-relation (ERD)  
✅ Une documentation des relations  
✅ Une base solide pour votre rapport  
✅ Une compréhension claire de la structure  

---

**Bon travail sur votre conception UML!** 🎨📐

---

**Date**: 3 Mai 2026  
**Base de données**: STA_SAV_DB  
**Fichier source**: `docs/schema_extraction.txt`  
**Scripts disponibles**: 
- `backend/scripts/extract_schema_simple.sql`
- `backend/scripts/extract_database_schema_for_uml.sql`
- `backend/scripts/export_schema_to_csv.sql` (corrigé)
