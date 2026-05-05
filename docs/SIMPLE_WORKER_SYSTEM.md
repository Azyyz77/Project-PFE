# 🔧 Système Simplifié de Gestion des Ouvriers

**Date:** 3 Mai 2026  
**Status:** ✅ SIMPLIFIÉ

---

## 🎯 Objectif

Système simple pour affecter un ouvrier à un rendez-vous:
1. **CLIENT** crée un rendez-vous
2. **AGENT SAV** clique sur le rendez-vous  
3. **AGENT SAV** affecte un ouvrier
4. **Terminé!**

---

## 📊 Structure de la Base de Données

### Table: Ouvrier
Liste des ouvriers/mécaniciens.

**Colonnes:**
- `id` - Identifiant unique
- `nom` - Nom de famille
- `prenom` - Prénom
- `telephone` - Numéro de téléphone
- `email` - Adresse email
- `specialite` - Spécialité (Mécanique, Électricité, Carrosserie, Peinture)
- `niveau_competence` - Niveau (Junior, Intermédiaire, Senior, Expert)
- `agence_id` - Agence de rattachement
- `actif` - Statut actif/inactif (1 = actif, 0 = inactif)
- `date_embauche` - Date d'embauche
- `photo_url` - Photo de profil (optionnel)
- `notes` - Notes additionnelles (optionnel)

### Table: AffectationOuvrier
Affectations simples: Rendez-vous → Ouvrier.

**Colonnes:**
- `id` - Identifiant unique
- `rendez_vous_id` - Rendez-vous concerné (FK → RendezVous)
- `ouvrier_id` - Ouvrier affecté (FK → Ouvrier)
- `agent_id` - Agent qui a fait l'affectation (FK → Utilisateur)
- `date_affectation` - Date/heure de l'affectation
- `statut` - Statut: EN_ATTENTE, EN_COURS, TERMINE, ANNULE
- `notes_agent` - Notes de l'agent (optionnel)
- `created_at` - Date de création
- `updated_at` - Date de mise à jour

---

## 🔄 Workflow Simple

```
┌─────────────┐
│   CLIENT    │
│ Crée un RDV │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│    AGENT SAV        │
│ 1. Voit le RDV      │
│ 2. Clique dessus    │
│ 3. Affecte ouvrier  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   OUVRIER           │
│ Reçoit affectation  │
│ Travaille sur RDV   │
└─────────────────────┘
```

---

## 🔌 API Endpoints (Simplifiés)

### 1. Obtenir les ouvriers d'une agence
```http
GET /api/workers/agency/:agenceId
```

**Query Parameters:**
- `actif` - Filtrer par statut actif (true/false)

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
      "specialite": "Mécanique",
      "niveau_competence": "Senior",
      "actif": true
    }
  ]
}
```

### 2. Affecter un ouvrier à un rendez-vous
```http
POST /api/workers/assignments
```

**Body:**
```json
{
  "rendez_vous_id": 123,
  "ouvrier_id": 1,
  "notes_agent": "Révision complète"
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
    "statut": "EN_ATTENTE"
  }
}
```

### 3. Obtenir l'affectation d'un rendez-vous
```http
GET /api/appointments/:rendezVousId/assignment
```

**Response:**
```json
{
  "success": true,
  "assignment": {
    "id": 456,
    "ouvrier_nom": "Dupont",
    "ouvrier_prenom": "Jean",
    "ouvrier_telephone": "+216 12 345 678",
    "statut": "EN_COURS",
    "date_affectation": "2026-05-03T10:00:00",
    "notes_agent": "Révision complète"
  }
}
```

### 4. Mettre à jour le statut d'une affectation
```http
PUT /api/workers/assignments/:assignmentId
```

**Body:**
```json
{
  "statut": "TERMINE"
}
```

---

## 📊 Statuts d'Affectation

| Statut | Description | Badge |
|--------|-------------|-------|
| EN_ATTENTE | Ouvrier affecté, pas encore commencé | 🟡 Jaune |
| EN_COURS | Intervention en cours | 🔵 Bleu |
| TERMINE | Intervention terminée | 🟢 Vert |
| ANNULE | Affectation annulée | 🔴 Rouge |

---

## 🎨 Interface Frontend

### Page Agent: Liste des Rendez-vous

**Affichage:**
```
┌─────────────────────────────────────────────────────┐
│ Rendez-vous du 03/05/2026                           │
├─────────────────────────────────────────────────────┤
│ 10:00 - Martin Pierre - Tiggo 8 Pro                │
│ Status: CONFIRME                                     │
│ Ouvrier: [Affecter un ouvrier] ← Bouton            │
└─────────────────────────────────────────────────────┘
```

**Clic sur "Affecter un ouvrier":**
```
┌─────────────────────────────────────────────────────┐
│ Affecter un ouvrier                                 │
├─────────────────────────────────────────────────────┤
│ Sélectionner un ouvrier:                            │
│ ○ Jean Dupont - Mécanique (Senior)                 │
│ ○ Ali Ben Salah - Électricité (Expert)             │
│ ○ Mohamed Trabelsi - Carrosserie (Intermédiaire)   │
│                                                      │
│ Notes (optionnel):                                   │
│ [___________________________________________]        │
│                                                      │
│ [Annuler]  [Affecter] ← Boutons                    │
└─────────────────────────────────────────────────────┘
```

**Après affectation:**
```
┌─────────────────────────────────────────────────────┐
│ 10:00 - Martin Pierre - Tiggo 8 Pro                │
│ Status: CONFIRME                                     │
│ Ouvrier: Jean Dupont (Mécanique) 🟡 EN_ATTENTE     │
│ [Modifier] [Changer statut]                         │
└─────────────────────────────────────────────────────┘
```

---

## 💻 Code Frontend Exemple

### Composant: AssignWorkerModal

```tsx
'use client';

import { useState } from 'react';
import { assignWorkerToAppointment } from '@/lib/api/workers';

interface Worker {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  niveau_competence: string;
}

interface AssignWorkerModalProps {
  rendezVousId: number;
  workers: Worker[];
  onSuccess: () => void;
  onClose: () => void;
}

export default function AssignWorkerModal({
  rendezVousId,
  workers,
  onSuccess,
  onClose
}: AssignWorkerModalProps) {
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedWorkerId) return;
    
    setLoading(true);
    try {
      await assignWorkerToAppointment({
        rendez_vous_id: rendezVousId,
        ouvrier_id: selectedWorkerId,
        notes_agent: notes
      });
      onSuccess();
    } catch (error) {
      console.error('Erreur affectation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Affecter un ouvrier</h2>
      
      <div className="worker-list">
        {workers.map(worker => (
          <label key={worker.id}>
            <input
              type="radio"
              name="worker"
              value={worker.id}
              onChange={() => setSelectedWorkerId(worker.id)}
            />
            {worker.prenom} {worker.nom} - {worker.specialite} ({worker.niveau_competence})
          </label>
        ))}
      </div>

      <textarea
        placeholder="Notes (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="buttons">
        <button onClick={onClose}>Annuler</button>
        <button onClick={handleAssign} disabled={!selectedWorkerId || loading}>
          {loading ? 'Affectation...' : 'Affecter'}
        </button>
      </div>
    </div>
  );
}
```

---

## 🧪 Test Rapide

### 1. Créer un ouvrier
```bash
curl -X POST http://localhost:3000/api/workers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+216 12 345 678",
    "specialite": "Mécanique",
    "niveau_competence": "Senior",
    "agence_id": 1
  }'
```

### 2. Affecter à un RDV
```bash
curl -X POST http://localhost:3000/api/workers/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rendez_vous_id": 1,
    "ouvrier_id": 1,
    "notes_agent": "Révision complète"
  }'
```

### 3. Vérifier l'affectation
```bash
curl -X GET http://localhost:3000/api/appointments/1/assignment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Avantages du Système Simplifié

| Avant (Complexe) | Après (Simple) |
|------------------|----------------|
| 4 tables | 2 tables |
| 15+ colonnes par table | 7-9 colonnes par table |
| Gestion des compétences | ❌ Supprimé |
| Gestion des disponibilités | ❌ Supprimé |
| Priorités | ❌ Supprimé |
| Temps estimé/réel | ❌ Supprimé |
| Évaluations | ❌ Supprimé |
| **Simple affectation** | ✅ **OUI!** |

---

## 📝 Résumé

### Ce qui reste:
- ✅ Table `Ouvrier` (liste des ouvriers)
- ✅ Table `AffectationOuvrier` (RDV → Ouvrier)
- ✅ API simple pour affecter
- ✅ Interface agent simple

### Ce qui a été supprimé:
- ❌ Table `CompetenceOuvrier`
- ❌ Table `DisponibiliteOuvrier`
- ❌ Colonnes complexes (priorité, temps, évaluation, etc.)

### Workflow final:
```
CLIENT crée RDV → AGENT affecte ouvrier → TERMINÉ!
```

---

**Version:** 2.0.0 (Simplifié)  
**Date:** 3 Mai 2026  
**Status:** ✅ SIMPLE & PRÊT

