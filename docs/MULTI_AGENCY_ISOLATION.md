# 🏢 Isolation Multi-Agences - Guide Complet

## 🎯 Principe Fondamental

**Chaque agent SAV ne doit voir QUE les données de son agence.**

---

## 📋 Règles d'Isolation par Rôle

### 1. **CLIENT**
- ✅ Voit uniquement SES propres données
- ✅ Ses véhicules
- ✅ Ses rendez-vous
- ✅ Ses réclamations
- ❌ Aucune restriction d'agence (peut prendre RDV dans n'importe quelle agence)

### 2. **AGENT SAV**
- ✅ Voit uniquement les données de **SON agence** (`agence_id`)
- ✅ Ouvriers de son agence
- ✅ Rendez-vous de son agence
- ✅ Affectations de son agence
- ✅ Clients ayant des RDV dans son agence
- ✅ Véhicules liés aux RDV de son agence
- ❌ Ne voit PAS les données des autres agences

### 3. **ADMIN**
- ✅ Voit **TOUTES** les données de **TOUTES** les agences
- ✅ Peut filtrer par agence
- ✅ Accès global au système

### 4. **DIRECTION**
- ✅ Voit **TOUTES** les données (statistiques consolidées)
- ✅ Vue d'ensemble multi-agences
- ✅ Rapports et dashboards globaux

---

## 🔒 Implémentation de l'Isolation

### Backend - Middleware de Vérification

**Fichier**: `backend/middleware/agencyMiddleware.js` (À CRÉER)

```javascript
/**
 * Middleware pour vérifier l'isolation par agence
 * Ajoute automatiquement le filtre agence_id pour les agents
 */
const enforceAgencyIsolation = (req, res, next) => {
  const user = req.user; // Depuis authMiddleware
  
  // Admin et Direction: pas de restriction
  if (user.role === 'ADMIN' || user.role === 'DIRECTION') {
    return next();
  }
  
  // Agent: doit avoir un agence_id
  if (user.role === 'AGENT') {
    if (!user.agence_id) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Aucune agence associée à votre compte'
      });
    }
    
    // Ajouter l'agence_id au contexte de la requête
    req.agence_id = user.agence_id;
  }
  
  next();
};

module.exports = { enforceAgencyIsolation };
```

---

## 📊 Vérification des Endpoints

### ✅ Endpoints Correctement Isolés

#### 1. **Ouvriers**
```javascript
// ✅ BON - Filtre par agence
GET /api/workers/agency/:agenceId
WHERE o.agence_id = @agenceId

// ✅ BON - Vérifie que l'agent appartient à l'agence
if (req.user.role === 'AGENT' && req.user.agence_id !== agenceId) {
  return res.status(403).json({ error: 'Accès refusé' });
}
```

#### 2. **Rendez-vous**
```javascript
// ✅ BON - Filtre par agence
GET /api/appointments
WHERE r.agence_id = @agenceId

// ✅ BON - Vérifie l'agence de l'agent
if (req.user.role === 'AGENT') {
  query += ' AND r.agence_id = @agence_id';
  request.input('agence_id', sql.BigInt, req.user.agence_id);
}
```

#### 3. **Affectations**
```javascript
// ✅ BON - Filtre par agence via la vue
SELECT * FROM VueAffectationsDetaillees
WHERE agence_id = @agenceId
```

---

## ⚠️ Points de Vigilance

### 1. **Token JWT**
Le token JWT doit contenir `agence_id`:

```javascript
// backend/controllers/userController.js - login()
const token = jwt.sign(
  { 
    id: user.id, 
    email: user.email, 
    role: user.role_nom,
    agence_id: user.agence_id,  // ✅ IMPORTANT
    telephone_verifie: user.telephone_verifie || false
  },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
);
```

### 2. **Middleware d'Authentification**
Le middleware doit extraire `agence_id` du token:

```javascript
// backend/middleware/authMiddleware.js
const authMiddleware = (req, res, next) => {
  // ... vérification token ...
  
  req.user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    agence_id: decoded.agence_id,  // ✅ IMPORTANT
    telephone_verifie: decoded.telephone_verifie
  };
  
  next();
};
```

### 3. **Validation des Paramètres**
Toujours vérifier que l'agent accède à SON agence:

```javascript
// Exemple: GET /api/workers/agency/:agenceId
exports.getWorkersByAgency = async (req, res) => {
  const { agenceId } = req.params;
  
  // ✅ VÉRIFICATION CRITIQUE
  if (req.user.role === 'AGENT' && req.user.agence_id !== parseInt(agenceId)) {
    return res.status(403).json({
      error: 'Accès refusé',
      message: 'Vous ne pouvez accéder qu\'aux données de votre agence'
    });
  }
  
  // ... suite du code ...
};
```

---

## 🔍 Checklist de Sécurité

### Pour Chaque Endpoint Agent

- [ ] Le token JWT contient `agence_id`
- [ ] Le middleware extrait `agence_id` du token
- [ ] La requête SQL filtre par `agence_id`
- [ ] Vérification que `req.user.agence_id === agenceId` (paramètre)
- [ ] Retour 403 si tentative d'accès à une autre agence
- [ ] Tests avec différents agents de différentes agences

---

## 📝 Exemple Complet: Endpoint Sécurisé

```javascript
/**
 * Obtenir les ouvriers d'une agence
 * SÉCURISÉ: Vérifie l'isolation par agence
 */
exports.getWorkersByAgency = async (req, res) => {
  try {
    const { agenceId } = req.params;
    const { actif, specialite } = req.query;
    
    // ✅ ÉTAPE 1: Vérifier que l'agent accède à SON agence
    if (req.user.role === 'AGENT') {
      if (!req.user.agence_id) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Aucune agence associée à votre compte'
        });
      }
      
      if (req.user.agence_id !== parseInt(agenceId)) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous ne pouvez accéder qu\'aux données de votre agence'
        });
      }
    }
    
    // ✅ ÉTAPE 2: Requête SQL avec filtre agence
    const pool = await getConnection();
    let query = `
      SELECT 
        o.*,
        a.nom AS agence_nom,
        (SELECT COUNT(*) FROM AffectationOuvrier 
         WHERE ouvrier_id = o.id AND statut = 'EN_COURS') AS affectations_en_cours
      FROM Ouvrier o
      INNER JOIN Agence a ON o.agence_id = a.id
      WHERE o.agence_id = @agenceId  -- ✅ FILTRE AGENCE
    `;
    
    const request = pool.request()
      .input('agenceId', sql.BigInt, agenceId);
    
    // Filtres additionnels
    if (actif !== undefined) {
      query += ' AND o.actif = @actif';
      request.input('actif', sql.Bit, actif === 'true' ? 1 : 0);
    }
    
    if (specialite) {
      query += ' AND o.specialite = @specialite';
      request.input('specialite', sql.NVarChar, specialite);
    }
    
    query += ' ORDER BY o.nom, o.prenom';
    
    const result = await request.query(query);
    
    res.json({
      success: true,
      workers: result.recordset
    });
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
};
```

---

## 🧪 Tests de Sécurité

### Test 1: Agent Accède à Son Agence
```javascript
// Agent de l'agence 1
GET /api/workers/agency/1
Authorization: Bearer <token_agent_agence_1>

// ✅ ATTENDU: 200 OK + Liste des ouvriers de l'agence 1
```

### Test 2: Agent Tente d'Accéder à Une Autre Agence
```javascript
// Agent de l'agence 1 tente d'accéder à l'agence 2
GET /api/workers/agency/2
Authorization: Bearer <token_agent_agence_1>

// ✅ ATTENDU: 403 Forbidden
// Message: "Vous ne pouvez accéder qu'aux données de votre agence"
```

### Test 3: Admin Accède à N'importe Quelle Agence
```javascript
// Admin
GET /api/workers/agency/1
GET /api/workers/agency/2
Authorization: Bearer <token_admin>

// ✅ ATTENDU: 200 OK pour les deux
```

### Test 4: Agent Sans Agence
```javascript
// Agent sans agence_id
GET /api/workers/agency/1
Authorization: Bearer <token_agent_sans_agence>

// ✅ ATTENDU: 403 Forbidden
// Message: "Aucune agence associée à votre compte"
```

---

## 🔧 Corrections à Appliquer

### 1. **Ajouter agence_id au Token JWT** ✅
**Fichier**: `backend/controllers/userController.js`
- Déjà fait dans la fonction `login()`

### 2. **Vérifier Extraction dans Middleware** ✅
**Fichier**: `backend/middleware/authMiddleware.js`
- Vérifier que `req.user.agence_id` est bien extrait

### 3. **Ajouter Vérifications dans Controllers**
**Fichiers à vérifier**:
- `backend/controllers/workerController.js`
- `backend/controllers/appointmentController.js`
- `backend/controllers/agentDashboardController.js`

**Code à ajouter**:
```javascript
// Au début de chaque fonction
if (req.user.role === 'AGENT') {
  if (!req.user.agence_id) {
    return res.status(403).json({
      error: 'Aucune agence associée'
    });
  }
  
  if (req.user.agence_id !== parseInt(agenceId)) {
    return res.status(403).json({
      error: 'Accès refusé à cette agence'
    });
  }
}
```

---

## 📊 Matrice d'Accès par Rôle

| Ressource | CLIENT | AGENT | ADMIN | DIRECTION |
|-----------|--------|-------|-------|-----------|
| **Ses propres données** | ✅ | ✅ | ✅ | ✅ |
| **Données de son agence** | ❌ | ✅ | ✅ | ✅ |
| **Données autres agences** | ❌ | ❌ | ✅ | ✅ |
| **Toutes les agences** | ❌ | ❌ | ✅ | ✅ |
| **Statistiques globales** | ❌ | ❌ | ✅ | ✅ |

---

## 🚨 Scénarios de Sécurité

### Scénario 1: Fuite de Données
**Problème**: Agent A voit les ouvriers de l'agence B

**Cause**: Pas de vérification `agence_id` dans le controller

**Solution**:
```javascript
if (req.user.role === 'AGENT' && req.user.agence_id !== parseInt(agenceId)) {
  return res.status(403).json({ error: 'Accès refusé' });
}
```

### Scénario 2: Manipulation d'URL
**Problème**: Agent change l'ID d'agence dans l'URL

**Exemple**: 
```
GET /api/workers/agency/1  → Fonctionne (son agence)
GET /api/workers/agency/2  → Doit être bloqué
```

**Solution**: Vérification côté serveur (pas seulement frontend)

### Scénario 3: Token Modifié
**Problème**: Agent modifie son token pour changer `agence_id`

**Solution**: 
- Token signé avec JWT_SECRET
- Vérification de la signature
- Impossible de modifier sans la clé secrète

---

## ✅ Checklist Finale

### Base de Données
- [ ] Tous les agents ont un `agence_id` défini
- [ ] Les tables ont des colonnes `agence_id` où nécessaire
- [ ] Les vues filtrent par `agence_id`

### Backend
- [ ] Token JWT contient `agence_id`
- [ ] Middleware extrait `agence_id`
- [ ] Controllers vérifient `agence_id`
- [ ] Requêtes SQL filtrent par `agence_id`
- [ ] Tests de sécurité passent

### Frontend
- [ ] User object contient `agence_id`
- [ ] Appels API utilisent le bon `agence_id`
- [ ] UI affiche uniquement les données de l'agence
- [ ] Messages d'erreur clairs si accès refusé

---

## 🎯 Résumé

**Principe**: Un agent SAV ne voit QUE les données de son agence.

**Implémentation**:
1. ✅ `agence_id` dans le token JWT
2. ✅ Extraction dans le middleware
3. ✅ Vérification dans chaque controller
4. ✅ Filtre SQL par `agence_id`
5. ✅ Tests de sécurité

**Sécurité**: Vérification côté serveur (jamais seulement frontend)

**La sécurité multi-agences est CRITIQUE pour la confidentialité des données!** 🔒
