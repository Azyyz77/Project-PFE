# 🏢 Logique Complète: Isolation Multi-Agences

## 📋 Flux du Système

### 1. **Client Crée un Rendez-Vous**

```
Client → Choisit une Agence → Crée RDV
                ↓
        RendezVous.agence_id = Agence choisie
```

**Table**: `RendezVous`
- `client_id` → Client qui a créé le RDV
- `agence_id` → **Agence choisie par le client**
- `agent_id` → Agent assigné (peut être NULL au début)

### 2. **Agent SAV Voit les Rendez-Vous**

```
Agent SAV (agence_id = 1)
    ↓
Voit UNIQUEMENT les RDV où:
    - RendezVous.agence_id = 1
```

**Règle**: Un agent ne voit QUE les rendez-vous de SON agence.

### 3. **Agent SAV Assigne un Ouvrier**

```
Agent SAV (agence_id = 1)
    ↓
Peut assigner UNIQUEMENT les ouvriers de son agence:
    - Ouvrier.agence_id = 1
    ↓
À un rendez-vous de son agence:
    - RendezVous.agence_id = 1
```

---

## 🔒 Règles de Sécurité

### Pour les Rendez-Vous

| Rôle | Peut Voir | Peut Modifier |
|------|-----------|---------------|
| **CLIENT** | Ses propres RDV | Ses propres RDV |
| **AGENT (agence 1)** | RDV de l'agence 1 | RDV de l'agence 1 |
| **AGENT (agence 2)** | RDV de l'agence 2 | RDV de l'agence 2 |
| **ADMIN** | Tous les RDV | Tous les RDV |
| **DIRECTION** | Tous les RDV (lecture) | Aucun |

### Pour les Ouvriers

| Rôle | Peut Voir | Peut Créer | Peut Assigner |
|------|-----------|------------|---------------|
| **AGENT (agence 1)** | Ouvriers agence 1 | ❌ NON | ✅ Ouvriers agence 1 |
| **AGENT (agence 2)** | Ouvriers agence 2 | ❌ NON | ✅ Ouvriers agence 2 |
| **ADMIN** | Tous les ouvriers | ✅ OUI | ✅ Tous |

**Important**: Seul l'**ADMIN** peut créer des ouvriers. Les **AGENTS** peuvent uniquement les **affecter** aux rendez-vous.

---

## ⚠️ Problèmes Identifiés

### ❌ Problème 1: Rendez-Vous Non Filtrés par Agence

**Fichier**: `backend/services/agentDashboardService.js`

**Code actuel**:
```javascript
WHERE (r.agent_id = @agent_id OR r.agent_id IS NULL)
```

**Problème**: Un agent peut voir les RDV d'autres agences s'ils ne sont pas assignés.

**Solution**: Ajouter un filtre par agence:
```javascript
WHERE r.agence_id = @agent_agence_id
  AND (r.agent_id = @agent_id OR r.agent_id IS NULL)
```

### ❌ Problème 2: Pas de Vérification dans les Controllers

**Fichiers à vérifier**:
- `backend/controllers/agentDashboardController.js`
- `backend/controllers/appointmentController.js`

**Solution**: Ajouter des vérifications comme pour les ouvriers.

---

## ✅ Corrections à Appliquer

### 1. Service Dashboard Agent

**Fichier**: `backend/services/agentDashboardService.js`

**Fonction**: `getAppointmentsList()`

**Ajouter**:
```javascript
static async getAppointmentsList(agentId, agentAgenceId, filters = {}) {
  // ...
  let query = `
    SELECT ...
    FROM RendezVous r
    ...
    WHERE r.agence_id = @agent_agence_id  -- ✅ AJOUTÉ
      AND (r.agent_id = @agent_id OR r.agent_id IS NULL)
  `;
  
  const request = pool.request()
    .input('agent_id', sql.BigInt, agentId)
    .input('agent_agence_id', sql.BigInt, agentAgenceId);  -- ✅ AJOUTÉ
  // ...
}
```

### 2. Controller Dashboard Agent

**Fichier**: `backend/controllers/agentDashboardController.js`

**Ajouter vérification**:
```javascript
exports.getAppointments = async (req, res) => {
  try {
    const agentId = req.user.id;
    const agentAgenceId = req.user.agence_id;  // ✅ AJOUTÉ
    
    // ✅ VÉRIFICATION
    if (!agentAgenceId) {
      return res.status(403).json({
        error: 'Aucune agence associée à votre compte'
      });
    }
    
    const appointments = await AgentDashboardService.getAppointmentsList(
      agentId,
      agentAgenceId,  // ✅ AJOUTÉ
      req.query
    );
    
    res.json({ appointments });
  } catch (error) {
    // ...
  }
};
```

### 3. Autres Fonctions à Corriger

**Dans `agentDashboardService.js`**:
- `getStatistics()` → Filtrer par agence
- `getRecentActivity()` → Filtrer par agence
- `getVehicleValidationQueue()` → Filtrer par agence
- `getComplaints()` → Filtrer par agence

---

## 🧪 Tests à Effectuer

### Test 1: Rendez-Vous Isolés

```javascript
// Agent agence 1 se connecte
const agent1 = await login('agent1@agence1.com', 'password');

// Créer un RDV dans agence 1
const rdv1 = await createAppointment({
  agence_id: 1,
  // ...
});

// Créer un RDV dans agence 2
const rdv2 = await createAppointment({
  agence_id: 2,
  // ...
});

// Agent 1 récupère ses RDV
const appointments = await getAppointments(agent1.token);

// ✅ ATTENDU: Voir uniquement rdv1 (agence 1)
// ❌ NE DOIT PAS voir rdv2 (agence 2)
```

### Test 2: Affectation Ouvrier

```javascript
// Agent agence 1
const agent1 = await login('agent1@agence1.com', 'password');

// Tenter d'assigner un ouvrier de l'agence 2
const result = await assignWorker({
  ouvrier_id: ouvrier_agence_2,
  rendez_vous_id: rdv_agence_1
}, agent1.token);

// ✅ ATTENDU: Erreur 403 "Ouvrier d'une autre agence"
```

---

## 📊 Schéma de Données

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ crée
       ↓
┌─────────────────┐
│  RendezVous     │
│  - client_id    │
│  - agence_id ←──┼─── Agence choisie par le client
│  - agent_id     │
└────────┬────────┘
         │
         │ appartient à
         ↓
    ┌─────────┐
    │ Agence  │
    └────┬────┘
         │
         │ a des
         ↓
    ┌──────────┐
    │ Agent    │
    │ Ouvrier  │
    └──────────┘
```

---

## 🎯 Checklist de Sécurité

### Backend
- [x] JWT contient `agence_id`
- [x] Middleware extrait `agence_id`
- [x] Workers: Vérifications OK
- [ ] Appointments: Vérifications à ajouter
- [ ] Dashboard: Filtres à ajouter
- [ ] Complaints: Vérifications à ajouter

### Tests
- [x] Test isolation ouvriers
- [ ] Test isolation rendez-vous
- [ ] Test isolation réclamations
- [ ] Test affectation cross-agence

---

## 🚀 Prochaines Étapes

1. **Immédiat**: Corriger `agentDashboardService.js`
2. **Court terme**: Ajouter vérifications dans tous les controllers
3. **Moyen terme**: Tests automatisés complets
4. **Long terme**: Audit de sécurité global

---

**Date**: 29 Avril 2026  
**Priorité**: CRITIQUE  
**Statut**: EN COURS - Corrections partielles appliquées
