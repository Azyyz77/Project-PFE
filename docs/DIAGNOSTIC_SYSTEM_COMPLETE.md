# ✅ Système de Diagnostic Technique - Implémentation Backend Complète

## 📋 Résumé

Le système de diagnostic technique a été **entièrement implémenté côté backend**. Les agents peuvent créer des diagnostics pour les rendez-vous et les administrateurs peuvent gérer les problèmes prédéfinis.

---

## 🎯 Ce qui a été fait

### 1. ✅ Base de données - Tables créées

**Fichier**: `backend/migrations/create_diagnostic_tables.sql`

**Tables créées** (3):

#### Table `ProblemePredéfini`
- `id` (BIGINT, PK, IDENTITY)
- `nom` (NVARCHAR(100), NOT NULL)
- `description` (NVARCHAR(500), NULL)
- `categorie` (NVARCHAR(50), NULL)
- `actif` (BIT, DEFAULT 1)
- `date_creation` (DATETIME, DEFAULT GETDATE())

#### Table `Diagnostic`
- `id` (BIGINT, PK, IDENTITY)
- `rdv_id` (BIGINT, FK → RendezVous, NOT NULL)
- `agent_id` (BIGINT, FK → Utilisateur, NOT NULL)
- `observations_generales` (NVARCHAR(MAX), NULL)
- `recommandations` (NVARCHAR(MAX), NULL)
- `date_creation` (DATETIME, DEFAULT GETDATE())
- `date_modification` (DATETIME, NULL)

#### Table `ProblemesDiagnostic`
- `id` (BIGINT, PK, IDENTITY)
- `diagnostic_id` (BIGINT, FK → Diagnostic, NOT NULL, CASCADE DELETE)
- `probleme_id` (BIGINT, FK → ProblemePredéfini, NOT NULL)
- `description_specifique` (NVARCHAR(500), NULL)
- `gravite` (VARCHAR(20), NULL) - FAIBLE, MOYENNE, ELEVEE, CRITIQUE
- `date_ajout` (DATETIME, DEFAULT GETDATE())

**Données par défaut**: 30 problèmes prédéfinis insérés dans 7 catégories:
- Moteur (5 problèmes)
- Freinage (5 problèmes)
- Suspension (4 problèmes)
- Électrique (5 problèmes)
- Climatisation (4 problèmes)
- Transmission (4 problèmes)
- Pneumatiques (3 problèmes)

---

### 2. ✅ Backend - Contrôleur des problèmes prédéfinis

**Fichier**: `backend/controllers/predefinedProblemController.js`

**Fonctions implémentées** (5):
- ✅ `getProblems(filters)` - Liste tous les problèmes (avec filtres par catégorie et statut actif)
- ✅ `getCategories()` - Liste les catégories avec compteurs
- ✅ `createProblem(nom, description, categorie)` - Créer un problème
- ✅ `updateProblem(id, data)` - Modifier un problème
- ✅ `deleteProblem(id)` - Supprimer un problème (avec vérification d'utilisation)

**Validations**:
- Nom unique requis
- Vérification d'utilisation avant suppression
- Groupement automatique par catégorie

---

### 3. ✅ Backend - Contrôleur des diagnostics

**Fichier**: `backend/controllers/diagnosticController.js`

**Fonctions implémentées** (6):
- ✅ `createDiagnostic(rdv_id, observations, recommandations, problemes)` - Créer un diagnostic complet
- ✅ `getDiagnosticByRDV(rdvId)` - Obtenir le diagnostic d'un RDV
- ✅ `getAllDiagnostics(filters)` - Liste tous les diagnostics (avec filtres)
- ✅ `updateDiagnostic(id, data)` - Modifier observations et recommandations
- ✅ `addProbleme(diagnosticId, problemeId, description, gravite)` - Ajouter un problème
- ✅ `removeProbleme(diagnosticId, problemeId)` - Retirer un problème

**Fonctionnalités**:
- Un seul diagnostic par RDV
- Ajout de problèmes multiples lors de la création
- Gestion de la gravité (FAIBLE, MOYENNE, ELEVEE, CRITIQUE)
- Récupération complète avec détails du RDV et véhicule
- Mise à jour automatique de `date_modification`

---

### 4. ✅ Backend - Routes des problèmes prédéfinis

**Fichier**: `backend/routes/predefinedProblemRoutes.js`

**Endpoints disponibles** (5):

| Méthode | Endpoint | Description | Permission |
|---------|----------|-------------|------------|
| GET | `/api/admin/problems` | Liste tous les problèmes | SETTINGS.READ |
| GET | `/api/admin/problems/categories` | Liste les catégories | SETTINGS.READ |
| POST | `/api/admin/problems` | Créer un problème | SETTINGS.UPDATE |
| PUT | `/api/admin/problems/:id` | Modifier un problème | SETTINGS.UPDATE |
| DELETE | `/api/admin/problems/:id` | Supprimer un problème | SETTINGS.UPDATE |

---

### 5. ✅ Backend - Routes des diagnostics

**Fichier**: `backend/routes/diagnosticRoutes.js`

**Endpoints disponibles** (6):

| Méthode | Endpoint | Description | Permission |
|---------|----------|-------------|------------|
| GET | `/api/agent/diagnostics` | Liste tous les diagnostics | INTERVENTIONS.READ |
| GET | `/api/agent/diagnostics/rdv/:rdvId` | Diagnostic d'un RDV | INTERVENTIONS.READ |
| POST | `/api/agent/diagnostics` | Créer un diagnostic | INTERVENTIONS.CREATE |
| PUT | `/api/agent/diagnostics/:id` | Modifier un diagnostic | INTERVENTIONS.UPDATE |
| POST | `/api/agent/diagnostics/:id/problemes` | Ajouter un problème | INTERVENTIONS.UPDATE |
| DELETE | `/api/agent/diagnostics/:id/problemes/:problemeId` | Retirer un problème | INTERVENTIONS.UPDATE |

---

### 6. ✅ Frontend - API Client problèmes prédéfinis

**Fichier**: `frontend/lib/api/predefinedProblems.ts`

**Types TypeScript**:
```typescript
export interface PredefinedProblem {
  id: number;
  nom: string;
  description: string | null;
  categorie: string | null;
  actif: boolean;
  date_creation: string;
}
```

**Fonctions disponibles**:
```typescript
predefinedProblemsAPI.getAll(filters)      // Tous les problèmes
predefinedProblemsAPI.getCategories()      // Catégories
predefinedProblemsAPI.create(data)         // Créer
predefinedProblemsAPI.update(id, data)     // Modifier
predefinedProblemsAPI.delete(id)           // Supprimer
```

---

### 7. ✅ Frontend - API Client diagnostics

**Fichier**: `frontend/lib/api/diagnostics.ts`

**Types TypeScript**:
```typescript
export type Gravite = 'FAIBLE' | 'MOYENNE' | 'ELEVEE' | 'CRITIQUE';

export interface Diagnostic {
  id: number;
  rdv_id: number;
  agent_id: number;
  observations_generales: string | null;
  recommandations: string | null;
  date_creation: string;
  date_modification: string | null;
  agent_nom: string;
  date_rdv: string;
  rdv_statut: string;
  immatriculation: string;
  marque: string;
  modele: string;
  problemes: DiagnosticProbleme[];
}
```

**Fonctions disponibles**:
```typescript
diagnosticsAPI.getAll(filters)                    // Tous les diagnostics
diagnosticsAPI.getByRDV(rdvId)                    // Diagnostic d'un RDV
diagnosticsAPI.create(data)                       // Créer
diagnosticsAPI.update(id, data)                   // Modifier
diagnosticsAPI.addProbleme(diagnosticId, data)    // Ajouter problème
diagnosticsAPI.removeProbleme(diagnosticId, id)   // Retirer problème
```

---

## 📊 Problèmes prédéfinis par défaut

### Catégorie: Moteur (5)
1. Bruit moteur anormal
2. Surchauffe moteur
3. Perte de puissance
4. Fumée excessive
5. Consommation excessive

### Catégorie: Freinage (5)
6. Bruit au freinage
7. Vibrations au freinage
8. Pédale molle
9. Freinage inefficace
10. Voyant ABS allumé

### Catégorie: Suspension (4)
11. Bruit de suspension
12. Véhicule penche
13. Amortisseurs usés
14. Tenue de route dégradée

### Catégorie: Électrique (5)
15. Batterie faible
16. Alternateur défaillant
17. Éclairage défectueux
18. Démarreur défaillant
19. Voyant moteur allumé

### Catégorie: Climatisation (4)
20. Climatisation inefficace
21. Bruit climatisation
22. Fuite de gaz
23. Mauvaise odeur

### Catégorie: Transmission (4)
24. Difficulté à passer les vitesses
25. Bruit de transmission
26. Embrayage patine
27. Fuite d'huile transmission

### Catégorie: Pneumatiques (3)
28. Usure anormale des pneus
29. Pression incorrecte
30. Pneu endommagé

---

## 🧪 Tests API

### Test 1: Obtenir tous les problèmes prédéfinis

```bash
curl -X GET http://localhost:3000/api/admin/problems \
  -H "Authorization: Bearer <TOKEN>"

# Résultat attendu: 200 OK
{
  "count": 30,
  "problems": [...],
  "byCategory": {
    "Moteur": [...],
    "Freinage": [...],
    ...
  }
}
```

### Test 2: Créer un diagnostic

```bash
curl -X POST http://localhost:3000/api/agent/diagnostics \
  -H "Authorization: Bearer <AGENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rdv_id": 1,
    "observations_generales": "Véhicule en bon état général",
    "recommandations": "Vidange recommandée dans 5000 km",
    "problemes": [
      {
        "probleme_id": 1,
        "description_specifique": "Bruit léger au ralenti",
        "gravite": "FAIBLE"
      },
      {
        "probleme_id": 29,
        "description_specifique": "Pression avant gauche à 1.8 bar",
        "gravite": "MOYENNE"
      }
    ]
  }'

# Résultat attendu: 201 Created
{
  "message": "Diagnostic créé avec succès",
  "diagnostic": {
    "id": 1,
    "rdv_id": 1,
    "agent_id": 2,
    "observations_generales": "Véhicule en bon état général",
    "recommandations": "Vidange recommandée dans 5000 km",
    "problemes": [...]
  }
}
```

### Test 3: Obtenir le diagnostic d'un RDV

```bash
curl -X GET http://localhost:3000/api/agent/diagnostics/rdv/1 \
  -H "Authorization: Bearer <AGENT_TOKEN>"

# Résultat attendu: 200 OK
{
  "diagnostic": {
    "id": 1,
    "rdv_id": 1,
    "agent_nom": "Jean Dupont",
    "immatriculation": "123 TU 4567",
    "marque": "Chery",
    "modele": "Tiggo 8",
    "problemes": [...]
  }
}
```

### Test 4: Ajouter un problème à un diagnostic

```bash
curl -X POST http://localhost:3000/api/agent/diagnostics/1/problemes \
  -H "Authorization: Bearer <AGENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "probleme_id": 15,
    "description_specifique": "Batterie à 11.5V",
    "gravite": "ELEVEE"
  }'

# Résultat attendu: 200 OK
{
  "message": "Problème ajouté avec succès",
  "diagnostic": {...}
}
```

### Test 5: Créer un problème prédéfini

```bash
curl -X POST http://localhost:3000/api/admin/problems \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Fuite liquide de refroidissement",
    "description": "Fuite visible du liquide de refroidissement",
    "categorie": "Moteur"
  }'

# Résultat attendu: 201 Created
{
  "message": "Problème créé avec succès",
  "problem": {
    "id": 31,
    "nom": "Fuite liquide de refroidissement",
    ...
  }
}
```

---

## ⚠️ Points importants

### 1. Un seul diagnostic par RDV

Un rendez-vous ne peut avoir qu'un seul diagnostic. Si vous essayez de créer un deuxième diagnostic pour le même RDV, vous recevrez une erreur 409.

### 2. Gravité des problèmes

4 niveaux de gravité disponibles:
- **FAIBLE**: Problème mineur, pas urgent
- **MOYENNE**: Problème à surveiller
- **ELEVEE**: Problème nécessitant une intervention rapide
- **CRITIQUE**: Problème urgent, véhicule potentiellement dangereux

### 3. Suppression protégée

Un problème prédéfini ne peut être supprimé que s'il n'est pas utilisé dans des diagnostics. Le système vérifie automatiquement.

### 4. Cascade DELETE

Lorsqu'un diagnostic est supprimé, tous les problèmes associés (table `ProblemesDiagnostic`) sont automatiquement supprimés grâce à `ON DELETE CASCADE`.

### 5. Permissions requises

**Pour les agents**:
- `INTERVENTIONS.CREATE` - Créer des diagnostics
- `INTERVENTIONS.READ` - Consulter des diagnostics
- `INTERVENTIONS.UPDATE` - Modifier des diagnostics

**Pour les administrateurs**:
- `SETTINGS.READ` - Consulter les problèmes prédéfinis
- `SETTINGS.UPDATE` - Gérer les problèmes prédéfinis

---

## 📊 Statistiques

| Métrique | Valeur |
|----------|--------|
| **Fichiers créés** | 7 |
| **Fichiers modifiés** | 1 |
| **Lignes de code** | ~1,500 |
| **Tables créées** | 3 |
| **Endpoints créés** | 11 |
| **Problèmes par défaut** | 30 |
| **Catégories** | 7 |

---

## 🎯 Cas d'usage

### Cas 1: Agent crée un diagnostic après un RDV

**Scénario**: Un agent termine un rendez-vous et doit créer un diagnostic.

**Étapes**:
1. Agent consulte le RDV terminé
2. Clique sur "Créer un diagnostic"
3. Sélectionne les problèmes détectés dans la liste prédéfinie
4. Ajoute des observations générales
5. Ajoute des recommandations
6. Enregistre le diagnostic

**Résultat**: Le diagnostic est créé et lié au RDV. Le client peut le consulter.

### Cas 2: Admin ajoute un nouveau type de problème

**Scénario**: L'entreprise identifie un nouveau problème récurrent non listé.

**Étapes**:
1. Admin va dans "Problèmes prédéfinis"
2. Clique sur "Ajouter un problème"
3. Saisit le nom, description et catégorie
4. Enregistre

**Résultat**: Le nouveau problème est immédiatement disponible pour tous les agents.

### Cas 3: Agent modifie un diagnostic existant

**Scénario**: Un agent veut ajouter un problème oublié.

**Étapes**:
1. Agent consulte le diagnostic
2. Clique sur "Ajouter un problème"
3. Sélectionne le problème
4. Spécifie la gravité et description
5. Enregistre

**Résultat**: Le problème est ajouté au diagnostic existant.

---

## 🔄 Intégration avec le reste du système

### Tables liées

**Diagnostic** est lié à:
- `RendezVous` (rdv_id) - Un diagnostic par RDV
- `Utilisateur` (agent_id) - Agent qui a créé le diagnostic

**ProblemesDiagnostic** est lié à:
- `Diagnostic` (diagnostic_id) - Plusieurs problèmes par diagnostic
- `ProblemePredéfini` (probleme_id) - Référence aux problèmes standards

### Workflow typique

1. **Client prend RDV** → Table `RendezVous`
2. **Agent effectue l'intervention** → Table `InterventionRDV`
3. **Agent crée le diagnostic** → Table `Diagnostic`
4. **Agent ajoute les problèmes détectés** → Table `ProblemesDiagnostic`
5. **Client consulte le diagnostic** → Via API

---

## ⏳ Frontend à créer

### Pages nécessaires

1. **`frontend/app/dashboard/agent/diagnostics/page.tsx`**
   - Liste des diagnostics de l'agent
   - Filtres par date
   - Bouton "Créer un diagnostic"

2. **`frontend/app/dashboard/agent/diagnostics/[id]/page.tsx`**
   - Détails d'un diagnostic
   - Formulaire d'édition
   - Gestion des problèmes

3. **`frontend/app/dashboard/admin/problems/page.tsx`**
   - Liste des problèmes prédéfinis
   - Groupement par catégorie
   - CRUD complet

4. **`frontend/components/DiagnosticForm.tsx`**
   - Formulaire de création/édition
   - Sélection multiple de problèmes
   - Champs observations et recommandations

---

## ✅ Checklist

- [x] Migration base de données
- [x] Tables créées (3)
- [x] Problèmes par défaut insérés (30)
- [x] Contrôleur problèmes prédéfinis
- [x] Contrôleur diagnostics
- [x] Routes problèmes prédéfinis
- [x] Routes diagnostics
- [x] Routes enregistrées dans server.js
- [x] Permissions appliquées
- [x] API client problèmes prédéfinis
- [x] API client diagnostics
- [x] Documentation complète
- [ ] Page admin problèmes prédéfinis (À CRÉER)
- [ ] Page agent diagnostics (À CRÉER)
- [ ] Composant formulaire diagnostic (À CRÉER)
- [ ] Navigation ajoutée (À FAIRE)

---

**Date de complétion backend**: 16 avril 2026  
**Statut**: ✅ BACKEND COMPLET - Frontend à créer  
**Version**: 1.0.0
