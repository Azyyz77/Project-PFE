# 🔧 Système d'Affectation des Ouvriers

## Vue d'ensemble

Le système d'affectation des ouvriers permet aux agents SAV de gérer les mécaniciens/ouvriers de leur garage et de leur affecter des rendez-vous/interventions.

---

## 📊 Structure de la Base de Données

### Table: Ouvrier
Stocke les informations des ouvriers/mécaniciens.

**Colonnes:**
- `id` - Identifiant unique
- `nom` - Nom de famille
- `prenom` - Prénom
- `telephone` - Numéro de téléphone
- `email` - Adresse email
- `specialite` - Spécialité (Mécanique, Électricité, Carrosserie, Peinture)
- `niveau_competence` - Niveau (Junior, Intermédiaire, Senior, Expert)
- `agence_id` - Agence de rattachement
- `actif` - Statut actif/inactif
- `date_embauche` - Date d'embauche
- `photo_url` - Photo de profil
- `notes` - Notes additionnelles

### Table: AffectationOuvrier
Gère les affectations des ouvriers aux rendez-vous.

**Colonnes:**
- `id` - Identifiant unique
- `rendez_vous_id` - Rendez-vous concerné
- `ouvrier_id` - Ouvrier affecté
- `agent_id` - Agent qui a fait l'affectation
- `date_affectation` - Date/heure de l'affectation
- `statut` - EN_ATTENTE, EN_COURS, TERMINE, ANNULE
- `priorite` - BASSE, NORMALE, HAUTE, URGENTE
- `temps_estime_minutes` - Temps estimé
- `temps_reel_minutes` - Temps réel passé
- `date_debut` - Début de l'intervention
- `date_fin` - Fin de l'intervention
- `notes_agent` - Notes de l'agent
- `notes_ouvrier` - Notes de l'ouvrier
- `evaluation` - Note de 1 à 5

### Table: CompetenceOuvrier
Compétences et certifications des ouvriers.

**Colonnes:**
- `id` - Identifiant unique
- `ouvrier_id` - Ouvrier concerné
- `type_intervention_id` - Type d'intervention maîtrisé
- `niveau_maitrise` - Niveau de 1 à 5
- `certifie` - Certification officielle
- `date_certification` - Date de certification

### Table: DisponibiliteOuvrier
Disponibilités et absences des ouvriers.

**Colonnes:**
- `id` - Identifiant unique
- `ouvrier_id` - Ouvrier concerné
- `date` - Date
- `heure_debut` - Heure de début
- `heure_fin` - Heure de fin
- `disponible` - Disponible ou non
- `raison_indisponibilite` - Raison si indisponible

---

## 🔌 API Endpoints

### Ouvriers

#### GET /api/workers/agency/:agenceId
Obtenir tous les ouvriers d'une agence.

**Query Parameters:**
- `actif` - Filtrer par statut actif (true/false)
- `specialite` - Filtrer par spécialité

**Response:**
```json
{
  "success": true,
  "workers": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "telephone": "+216 12 345 678",
      "email": "jean.dupont@example.com",
      "specialite": "Mécanique",
      "niveau_competence": "Senior",
      "actif": true,
      "affectations_en_cours": 2
    }
  ]
}
```

#### POST /api/workers
Créer un nouvel ouvrier.

**Body:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "telephone": "+216 12 345 678",
  "email": "jean.dupont@example.com",
  "specialite": "Mécanique",
  "niveau_competence": "Senior",
  "agence_id": 1,
  "date_embauche": "2024-01-01",
  "notes": "Spécialiste moteur diesel"
}
```

#### GET /api/workers/agency/:agenceId/available
Obtenir les ouvriers disponibles pour une date/heure.

**Query Parameters:**
- `date` - Date (YYYY-MM-DD)
- `heure` - Heure (HH:MM:SS)

**Response:**
```json
{
  "success": true,
  "workers": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "affectations_jour": 1
    }
  ]
}
```

#### GET /api/workers/agency/:agenceId/statistics
Obtenir les statistiques des ouvriers.

**Response:**
```json
{
  "success": true,
  "statistics": [
    {
      "id": 1,
      "nom": "Dupont",
      "prenom": "Jean",
      "specialite": "Mécanique",
      "total_affectations": 45,
      "affectations_terminees": 42,
      "affectations_en_cours": 3,
      "evaluation_moyenne": 4.5,
      "temps_moyen_minutes": 120
    }
  ]
}
```

### Affectations

#### POST /api/workers/assignments
Affecter un ouvrier à un rendez-vous.

**Body:**
```json
{
  "rendez_vous_id": 123,
  "ouvrier_id": 1,
  "priorite": "NORMALE",
  "temps_estime_minutes": 120,
  "notes_agent": "Révision complète + vidange"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ouvrier affecté avec succès",
  "assignment": {
    "id": 456,
    "rendez_vous_id": 123,
    "ouvrier_id": 1,
    "statut": "EN_ATTENTE",
    "priorite": "NORMALE"
  }
}
```

#### GET /api/workers/:ouvrierId/assignments
Obtenir les affectations d'un ouvrier.

**Query Parameters:**
- `statut` - Filtrer par statut
- `date_debut` - Date de début
- `date_fin` - Date de fin

**Response:**
```json
{
  "success": true,
  "assignments": [
    {
      "affectation_id": 456,
      "statut": "EN_COURS",
      "priorite": "HAUTE",
      "date_affectation": "2024-01-15T10:00:00",
      "ouvrier_nom": "Dupont",
      "ouvrier_prenom": "Jean",
      "client_nom": "Martin",
      "client_prenom": "Pierre",
      "immatriculation": "123 TU 4567",
      "marque": "Chery",
      "modele": "Tiggo 8 Pro"
    }
  ]
}
```

#### PUT /api/workers/assignments/:assignmentId
Mettre à jour le statut d'une affectation.

**Body:**
```json
{
  "statut": "TERMINE",
  "notes_ouvrier": "Révision effectuée, filtre à air changé",
  "temps_reel_minutes": 135,
  "evaluation": 5
}
```

---

## 🎨 Interface Frontend

### Page: /dashboard/agent/workers

**Fonctionnalités:**
- ✅ Liste des ouvriers de l'agence
- ✅ Affichage des affectations en cours
- ✅ Création de nouveaux ouvriers
- ✅ Affectation d'ouvriers aux rendez-vous
- ✅ Suivi des statuts d'affectation
- ✅ Statistiques par ouvrier

**Onglets:**
1. **Ouvriers** - Gestion des ouvriers
2. **Affectations** - Suivi des affectations

---

## 🔄 Workflow

### 1. Création d'un Ouvrier
```
Agent → Clique "Ajouter un ouvrier"
     → Remplit le formulaire
     → Sauvegarde
     → Ouvrier créé dans la base
```

### 2. Affectation à un Rendez-Vous
```
Agent → Sélectionne un rendez-vous
     → Clique "Affecter un ouvrier"
     → Choisit un ouvrier disponible
     → Définit la priorité
     → Estime le temps
     → Ajoute des notes
     → Confirme l'affectation
     → Ouvrier notifié (optionnel)
```

### 3. Suivi de l'Intervention
```
Ouvrier → Commence l'intervention
        → Statut passe à "EN_COURS"
        → Travaille sur le véhicule
        → Termine l'intervention
        → Statut passe à "TERMINE"
        → Ajoute des notes
        → Agent évalue le travail
```

---

## 📊 Statuts d'Affectation

| Statut | Description | Couleur |
|--------|-------------|---------|
| EN_ATTENTE | Affectation créée, pas encore commencée | Jaune |
| EN_COURS | Intervention en cours | Bleu |
| TERMINE | Intervention terminée | Vert |
| ANNULE | Affectation annulée | Rouge |

## 🎯 Priorités

| Priorité | Description | Couleur |
|----------|-------------|---------|
| BASSE | Peut attendre | Gris |
| NORMALE | Priorité standard | Bleu |
| HAUTE | À traiter rapidement | Orange |
| URGENTE | À traiter immédiatement | Rouge |

---

## 🔐 Permissions

### Agent SAV
- ✅ Voir les ouvriers de son agence
- ✅ Créer des ouvriers
- ✅ Affecter des ouvriers
- ✅ Voir les affectations
- ✅ Mettre à jour les statuts
- ✅ Voir les statistiques

### Admin
- ✅ Toutes les permissions Agent
- ✅ Voir tous les ouvriers
- ✅ Gérer les compétences
- ✅ Gérer les disponibilités

### Ouvrier (futur)
- ✅ Voir ses affectations
- ✅ Mettre à jour le statut
- ✅ Ajouter des notes

---

## 📈 Métriques et KPIs

### Par Ouvrier
- Nombre total d'affectations
- Taux de complétion
- Temps moyen par intervention
- Évaluation moyenne
- Affectations en cours

### Par Agence
- Nombre d'ouvriers actifs
- Taux d'occupation
- Temps moyen d'intervention
- Satisfaction client

---

## 🚀 Installation

### 1. Créer les Tables
```bash
# Exécuter le script SQL
sqlcmd -S localhost -d STA_SAV_DB -i backend/migrations/create_worker_assignment_system.sql
```

### 2. Redémarrer le Backend
```bash
cd backend
npm start
```

### 3. Accéder à l'Interface
```
http://localhost:3001/dashboard/agent/workers
```

---

## 🧪 Tests

### Test API
```bash
# Obtenir les ouvriers
curl -X GET http://localhost:3000/api/workers/agency/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Créer un ouvrier
curl -X POST http://localhost:3000/api/workers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "Ouvrier",
    "agence_id": 1,
    "specialite": "Mécanique"
  }'

# Affecter un ouvrier
curl -X POST http://localhost:3000/api/workers/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rendez_vous_id": 1,
    "ouvrier_id": 1,
    "priorite": "NORMALE"
  }'
```

---

## 📝 TODO / Améliorations Futures

- [ ] Notifications push pour les ouvriers
- [ ] Application mobile pour les ouvriers
- [ ] Scan QR code pour démarrer/terminer
- [ ] Géolocalisation des ouvriers
- [ ] Planning visuel (Gantt)
- [ ] Gestion des pièces détachées
- [ ] Photos avant/après intervention
- [ ] Signature électronique client
- [ ] Rapport d'intervention PDF
- [ ] Intégration calendrier

---

## 🎉 Résumé

Le système d'affectation des ouvriers est maintenant **opérationnel** avec:

- ✅ Base de données complète
- ✅ API REST fonctionnelle
- ✅ Interface agent SAV
- ✅ Gestion des statuts
- ✅ Statistiques
- ✅ Documentation complète

**Prêt pour la production!** 🚀

---

**Version:** 1.0.0  
**Date:** Janvier 2025  
**Status:** ✅ Production Ready
