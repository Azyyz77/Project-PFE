# 📅 Gestion des Plages Horaires - Utilité dans le Projet STA SAV

**Date**: 5 mai 2026  
**Module**: PlageHoraire (TimeSlots)

---

## 🎯 Objectif Principal

La **Gestion des Plages Horaires** permet de **contrôler et optimiser la disponibilité des agences** pour les rendez-vous clients. C'est un système de **gestion de capacité** qui évite la surcharge et améliore l'expérience client.

---

## 🔑 Fonctionnalités Clés

### 1. **Définition des Horaires d'Ouverture**
Chaque agence peut définir ses horaires d'ouverture par jour de la semaine.

**Exemple** :
- **Lundi** : 08h00 - 17h00
- **Mardi** : 08h00 - 17h00
- **Mercredi** : 08h00 - 17h00
- **Jeudi** : 08h00 - 17h00
- **Vendredi** : 08h00 - 17h00
- **Samedi** : 09h00 - 13h00
- **Dimanche** : Fermé

### 2. **Gestion de la Capacité**
Chaque plage horaire a une **capacité maximale** de rendez-vous simultanés.

**Exemple** :
- **Capacité = 4** : L'agence peut recevoir **4 clients maximum** en même temps
- Si 4 RDV sont déjà pris à 10h00, le créneau 10h00 devient **indisponible**

### 3. **Créneaux de 30 Minutes**
Le système génère automatiquement des créneaux de **30 minutes** entre l'heure d'ouverture et de fermeture.

**Exemple** (08h00 - 17h00) :
- 08h00, 08h30, 09h00, 09h30, 10h00, 10h30, 11h00, 11h30
- 12h00, 12h30, 13h00, 13h30, 14h00, 14h30, 15h00, 15h30
- 16h00, 16h30

---

## 💡 Cas d'Usage Concrets

### Cas 1: Client Prend un Rendez-vous

**Scénario** :
1. Client va sur `/client/rendez-vous`
2. Sélectionne une **date** (ex: Lundi 12 mai 2026)
3. Sélectionne son **agence** (ex: STA Tunis Nord)
4. Le système affiche les **créneaux disponibles** :
   - ✅ 08h00 (3 places disponibles)
   - ✅ 08h30 (4 places disponibles)
   - ✅ 09h00 (2 places disponibles)
   - ❌ 09h30 (complet - 4/4)
   - ✅ 10h00 (1 place disponible)

**Avantage** : Le client voit **en temps réel** les créneaux disponibles et ne peut pas prendre un RDV sur un créneau complet.

---

### Cas 2: Agence Gère sa Capacité

**Scénario** :
- **Agence STA Tunis Nord** a 4 baies de réparation
- Elle configure une **capacité de 4** pour chaque créneau
- Si un technicien est absent, l'admin peut **réduire la capacité à 3**

**Avantage** : L'agence contrôle sa charge de travail et évite la surcharge.

---

### Cas 3: Horaires Spéciaux

**Scénario** :
- **Samedi** : Ouverture réduite (09h00 - 13h00)
- **Dimanche** : Fermé (aucune plage horaire)
- **Jours fériés** : Peut être géré en supprimant temporairement les plages

**Avantage** : Flexibilité pour gérer les horaires spéciaux.

---

## 📊 Structure de la Table PlageHoraire

```sql
CREATE TABLE PlageHoraire (
  id BIGINT PRIMARY KEY IDENTITY(1,1),
  agence_id BIGINT NOT NULL,              -- Agence concernée
  jour_semaine TINYINT NOT NULL,          -- 0=Dimanche, 1=Lundi, ..., 6=Samedi
  heure_ouverture TIME NOT NULL,          -- Ex: 08:00:00
  heure_fermeture TIME NOT NULL,          -- Ex: 17:00:00
  capacite INT NOT NULL,                  -- Nombre max de RDV simultanés
  FOREIGN KEY (agence_id) REFERENCES Agence(id)
);
```

### Exemple de Données

| id | agence_id | jour_semaine | heure_ouverture | heure_fermeture | capacite |
|----|-----------|--------------|-----------------|-----------------|----------|
| 1  | 1         | 1 (Lundi)    | 08:00:00        | 17:00:00        | 4        |
| 2  | 1         | 2 (Mardi)    | 08:00:00        | 17:00:00        | 4        |
| 3  | 1         | 3 (Mercredi) | 08:00:00        | 17:00:00        | 4        |
| 4  | 1         | 4 (Jeudi)    | 08:00:00        | 17:00:00        | 4        |
| 5  | 1         | 5 (Vendredi) | 08:00:00        | 17:00:00        | 4        |

---

## 🔄 Workflow Complet

### 1. **Admin Configure les Plages Horaires**

**Page** : `/dashboard/admin/timeslots`

**Actions** :
- Créer une plage horaire pour chaque jour de la semaine
- Définir les horaires d'ouverture/fermeture
- Définir la capacité maximale
- Modifier ou supprimer des plages existantes

**Exemple** :
```
Agence: STA Tunis Nord (ID: 1)
Jour: Lundi
Horaire: 08:00 - 17:00
Capacité: 4 rendez-vous simultanés
```

---

### 2. **Client Consulte les Créneaux Disponibles**

**Page** : `/client/rendez-vous`

**Processus** :
1. Client sélectionne une **date** (ex: 12 mai 2026 = Lundi)
2. Client sélectionne une **agence** (ex: STA Tunis Nord)
3. Le système appelle l'API : `GET /api/timeslots/available?agenceId=1&date=2026-05-12`
4. Le backend :
   - Récupère les plages horaires pour Lundi (jour_semaine = 1)
   - Génère des créneaux de 30 minutes (08:00, 08:30, 09:00, ...)
   - Compte les RDV existants pour chaque créneau
   - Retourne uniquement les créneaux avec places disponibles

**Réponse API** :
```json
[
  { "time": "08:00:00", "available": 3, "capacity": 4 },
  { "time": "08:30:00", "available": 4, "capacity": 4 },
  { "time": "09:00:00", "available": 2, "capacity": 4 },
  { "time": "10:00:00", "available": 1, "capacity": 4 }
]
```

---

### 3. **Client Prend un Rendez-vous**

**Processus** :
1. Client sélectionne un créneau disponible (ex: 10:00)
2. Client remplit le formulaire de RDV
3. Le système crée le RDV avec `date_heure = 2026-05-12 10:00:00`
4. La capacité du créneau 10:00 diminue : 1 → 0
5. Le créneau 10:00 devient **complet** et disparaît pour les autres clients

---

### 4. **Système Vérifie la Disponibilité en Temps Réel**

**Algorithme** :
```javascript
// Pour chaque créneau (ex: 10:00)
const rdvCount = COUNT(RendezVous WHERE date_heure = '10:00' AND statut != 'ANNULE');
const available = capacite - rdvCount;

if (available > 0) {
  // Créneau disponible
  return { time: '10:00', available, capacity };
} else {
  // Créneau complet - ne pas afficher
  return null;
}
```

---

## ✅ Avantages du Système

### 1. **Évite la Surcharge**
- ❌ **Sans plages horaires** : 20 clients peuvent prendre RDV à 10h00 → Chaos
- ✅ **Avec plages horaires** : Maximum 4 clients à 10h00 → Gestion fluide

### 2. **Améliore l'Expérience Client**
- Client voit **en temps réel** les créneaux disponibles
- Pas de double réservation
- Pas d'attente excessive à l'agence

### 3. **Optimise les Ressources**
- Agence peut ajuster la capacité selon les ressources disponibles
- Meilleure répartition des RDV sur la journée
- Évite les pics de charge

### 4. **Flexibilité**
- Horaires différents par jour de la semaine
- Capacité ajustable par agence
- Gestion des jours fériés et fermetures exceptionnelles

---

## 🎨 Interface Admin

### Page : `/dashboard/admin/timeslots`

**Fonctionnalités** :
- ✅ Voir toutes les plages horaires de toutes les agences
- ✅ Créer une nouvelle plage horaire
- ✅ Modifier une plage existante
- ✅ Supprimer une plage horaire

**Formulaire de Création** :
```
Agence ID: [1] (STA Tunis Nord)
Jour: [Lundi ▼]
Heure ouverture: [08:00]
Heure fermeture: [17:00]
Capacité: [4]
[Créer]
```

---

## 📱 Interface Client

### Page : `/client/rendez-vous`

**Affichage des Créneaux** :
```
📅 Date: 12 mai 2026 (Lundi)
🏢 Agence: STA Tunis Nord

Créneaux disponibles:
✅ 08:00 (3 places)
✅ 08:30 (4 places)
✅ 09:00 (2 places)
❌ 09:30 (complet)
✅ 10:00 (1 place)
✅ 10:30 (4 places)
...
```

---

## 🔧 API Endpoints

### 1. **Obtenir toutes les plages horaires** (Admin)
```
GET /api/admin/timeslots
Response: [{ id, agence_id, jour_semaine, heure_ouverture, heure_fermeture, capacite }]
```

### 2. **Obtenir les plages d'une agence**
```
GET /api/admin/timeslots/agency/:agenceId
Response: [{ id, jour_semaine, heure_ouverture, heure_fermeture, capacite }]
```

### 3. **Créer une plage horaire** (Admin)
```
POST /api/admin/timeslots
Body: { agence_id, jour_semaine, heure_ouverture, heure_fermeture, capacite }
Response: { message, id }
```

### 4. **Mettre à jour une plage** (Admin)
```
PUT /api/admin/timeslots/:id
Body: { jour_semaine, heure_ouverture, heure_fermeture, capacite }
Response: { message }
```

### 5. **Supprimer une plage** (Admin)
```
DELETE /api/admin/timeslots/:id
Response: { message }
```

### 6. **Obtenir les créneaux disponibles** (Client)
```
GET /api/timeslots/available?agenceId=1&date=2026-05-12
Response: [{ time, available, capacity }]
```

---

## 📈 Statistiques et Métriques

### Métriques Utiles

1. **Taux d'occupation** :
   ```
   Taux = (RDV pris / Créneaux disponibles) × 100
   ```

2. **Créneaux les plus demandés** :
   - Identifier les heures de pointe
   - Ajuster la capacité en conséquence

3. **Agences les plus chargées** :
   - Comparer le taux d'occupation entre agences
   - Redistribuer les ressources si nécessaire

---

## 🚀 Évolutions Possibles

### 1. **Durée Variable par Type d'Intervention**
- Vidange : 30 minutes
- Révision complète : 2 heures
- Réparation : 1 heure

### 2. **Réservation de Créneaux Multiples**
- Pour les interventions longues
- Bloquer plusieurs créneaux consécutifs

### 3. **Gestion des Jours Fériés**
- Table séparée pour les jours fériés
- Désactivation automatique des créneaux

### 4. **Notifications de Disponibilité**
- Alerter les clients quand un créneau se libère
- Liste d'attente pour les créneaux complets

### 5. **Optimisation Automatique**
- IA pour prédire la demande
- Ajustement automatique de la capacité

---

## 🎯 Résumé

### Problème Résolu
❌ **Sans plages horaires** : Surcharge, double réservation, mauvaise expérience client

### Solution Apportée
✅ **Avec plages horaires** : Gestion optimale de la capacité, expérience client fluide, contrôle total

### Bénéfices
- 🎯 **Clients** : Créneaux disponibles en temps réel, pas d'attente
- 🏢 **Agences** : Contrôle de la charge, optimisation des ressources
- 📊 **Direction** : Métriques de performance, visibilité sur l'activité

---

## 📚 Fichiers Concernés

### Backend
- `backend/controllers/timeSlotController.js` - Logique métier
- `backend/routes/timeSlotRoutes.js` - Routes API
- `backend/migrations/verify_timeslot_table.sql` - Structure de la table

### Frontend
- `frontend/app/dashboard/admin/timeslots/page.tsx` - Interface admin
- `frontend/lib/api/timeslots.ts` - Client API
- `frontend/app/client/rendez-vous/page.tsx` - Sélection de créneaux (client)

### Base de Données
- Table : `PlageHoraire`
- Relations : `Agence` (1-N), `RendezVous` (calcul de disponibilité)

---

**La gestion des plages horaires est un élément clé pour assurer un service de qualité et éviter la surcharge des agences ! 🎯**
