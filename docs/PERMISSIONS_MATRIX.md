# 🔐 Matrice des Permissions - STA Chery SAV

## 📋 Vue d'Ensemble

Ce document définit les permissions pour chaque rôle dans le système.

---

## 👥 Rôles du Système

1. **CLIENT** - Utilisateur final
2. **AGENT SAV** - Agent de service après-vente (lié à une agence)
3. **ADMIN** - Administrateur système
4. **DIRECTION** - Direction (lecture seule, toutes agences)

---

## 🚗 Rendez-Vous (Appointments)

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Créer RDV** | ✅ Ses RDV | ❌ | ✅ | ❌ |
| **Voir ses RDV** | ✅ | - | - | - |
| **Voir RDV de son agence** | - | ✅ | - | - |
| **Voir tous les RDV** | ❌ | ❌ | ✅ | ✅ |
| **Modifier RDV de son agence** | - | ✅ | - | - |
| **Modifier tous les RDV** | ❌ | ❌ | ✅ | ❌ |
| **Annuler ses RDV** | ✅ | - | - | - |
| **Annuler RDV de son agence** | - | ✅ | - | - |
| **Confirmer RDV** | ❌ | ✅ | ✅ | ❌ |

---

## 👷 Ouvriers (Workers)

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Voir ouvriers de son agence** | ❌ | ✅ | - | ✅ |
| **Voir tous les ouvriers** | ❌ | ❌ | ✅ | ✅ |
| **Créer ouvrier** | ❌ | ❌ | ✅ | ❌ |
| **Modifier ouvrier** | ❌ | ❌ | ✅ | ❌ |
| **Désactiver ouvrier** | ❌ | ❌ | ✅ | ❌ |
| **Affecter ouvrier à RDV** | ❌ | ✅ | ✅ | ❌ |

**Important**: 
- ❌ **AGENT SAV ne peut PAS créer d'ouvriers**
- ✅ **AGENT SAV peut SEULEMENT affecter les ouvriers existants**
- ✅ **Seul ADMIN peut créer/modifier/désactiver des ouvriers**

---

## 📋 Affectations (Assignments)

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Voir affectations de son agence** | ❌ | ✅ | - | ✅ |
| **Voir toutes les affectations** | ❌ | ❌ | ✅ | ✅ |
| **Créer affectation** | ❌ | ✅ | ✅ | ❌ |
| **Modifier affectation** | ❌ | ✅ | ✅ | ❌ |
| **Annuler affectation** | ❌ | ✅ | ✅ | ❌ |

---

## 🚙 Véhicules

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Ajouter son véhicule** | ✅ | ❌ | ✅ | ❌ |
| **Voir ses véhicules** | ✅ | - | - | - |
| **Voir véhicules de son agence** | - | ✅ | - | - |
| **Voir tous les véhicules** | ❌ | ❌ | ✅ | ✅ |
| **Valider véhicule** | ❌ | ✅ | ✅ | ❌ |
| **Modifier véhicule** | ✅ Ses véhicules | ❌ | ✅ | ❌ |

---

## 📝 Réclamations (Complaints)

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Créer réclamation** | ✅ | ❌ | ✅ | ❌ |
| **Voir ses réclamations** | ✅ | - | - | - |
| **Voir réclamations de son agence** | - | ✅ | - | - |
| **Voir toutes les réclamations** | ❌ | ❌ | ✅ | ✅ |
| **Traiter réclamation** | ❌ | ✅ | ✅ | ❌ |
| **Clôturer réclamation** | ❌ | ✅ | ✅ | ❌ |

---

## 📊 Statistiques

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Voir stats personnelles** | ✅ | ✅ | ✅ | - |
| **Voir stats de son agence** | ❌ | ✅ | - | - |
| **Voir stats globales** | ❌ | ❌ | ✅ | ✅ |
| **Exporter rapports** | ❌ | ❌ | ✅ | ✅ |

---

## 🏢 Agences

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Voir liste des agences** | ✅ | ✅ | ✅ | ✅ |
| **Créer agence** | ❌ | ❌ | ✅ | ❌ |
| **Modifier agence** | ❌ | ❌ | ✅ | ❌ |
| **Désactiver agence** | ❌ | ❌ | ✅ | ❌ |

---

## 👤 Utilisateurs

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Voir son profil** | ✅ | ✅ | ✅ | ✅ |
| **Modifier son profil** | ✅ | ✅ | ✅ | ✅ |
| **Voir utilisateurs de son agence** | ❌ | ✅ | - | - |
| **Voir tous les utilisateurs** | ❌ | ❌ | ✅ | ✅ |
| **Créer utilisateur** | ❌ | ❌ | ✅ | ❌ |
| **Modifier utilisateur** | ❌ | ❌ | ✅ | ❌ |
| **Désactiver utilisateur** | ❌ | ❌ | ✅ | ❌ |

---

## 🔧 Catalogue d'Interventions

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Voir catalogue** | ✅ | ✅ | ✅ | ✅ |
| **Créer type intervention** | ❌ | ❌ | ✅ | ❌ |
| **Modifier type intervention** | ❌ | ❌ | ✅ | ❌ |
| **Désactiver type intervention** | ❌ | ❌ | ✅ | ❌ |

---

## 📦 Packages

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Voir packages** | ✅ | ✅ | ✅ | ✅ |
| **Créer package** | ❌ | ❌ | ✅ | ❌ |
| **Modifier package** | ❌ | ❌ | ✅ | ❌ |
| **Désactiver package** | ❌ | ❌ | ✅ | ❌ |

---

## 🎨 Marques/Modèles/Versions

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Voir catalogue** | ✅ | ✅ | ✅ | ✅ |
| **Créer marque/modèle** | ❌ | ❌ | ✅ | ❌ |
| **Modifier marque/modèle** | ❌ | ❌ | ✅ | ❌ |
| **Désactiver marque/modèle** | ❌ | ❌ | ✅ | ❌ |

---

## 🔔 Notifications

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Recevoir notifications** | ✅ | ✅ | ✅ | ✅ |
| **Marquer comme lu** | ✅ | ✅ | ✅ | ✅ |
| **Envoyer notification** | ❌ | ❌ | ✅ | ❌ |

---

## 📄 Documents

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Télécharger ses documents** | ✅ | - | - | - |
| **Télécharger documents de son agence** | - | ✅ | - | - |
| **Télécharger tous les documents** | ❌ | ❌ | ✅ | ✅ |
| **Uploader document** | ✅ | ✅ | ✅ | ❌ |
| **Modérer document** | ❌ | ✅ | ✅ | ❌ |

---

## 🤖 Chatbot IA

| Action | CLIENT | AGENT SAV | ADMIN | DIRECTION |
|--------|--------|-----------|-------|-----------|
| **Utiliser chatbot** | ✅ | ✅ | ✅ | ✅ |
| **Voir historique** | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Règles Importantes

### Isolation par Agence (AGENT SAV)

Un **AGENT SAV** ne voit QUE les données de **SON agence**:
- ✅ Rendez-vous de son agence
- ✅ Ouvriers de son agence
- ✅ Affectations de son agence
- ✅ Véhicules des clients de son agence
- ✅ Réclamations de son agence
- ❌ **AUCUNE donnée d'autres agences**

### Création d'Ouvriers

- ❌ **AGENT SAV ne peut PAS créer d'ouvriers**
- ✅ **AGENT SAV peut SEULEMENT affecter les ouvriers existants**
- ✅ **Seul ADMIN peut créer des ouvriers**

### Validation de Véhicules

- ✅ **AGENT SAV peut valider les véhicules**
- ✅ Validation requise avant que le client puisse prendre RDV

### Modération de Documents

- ✅ **AGENT SAV peut modérer les documents de son agence**
- ✅ **ADMIN peut modérer tous les documents**

---

## 🔒 Sécurité

### Vérifications Backend

Chaque endpoint vérifie:
1. ✅ Authentification (JWT token valide)
2. ✅ Rôle autorisé
3. ✅ Agence (pour AGENT SAV)
4. ✅ Propriété (pour CLIENT)

### Exemple de Vérification

```javascript
// Pour AGENT SAV
if (req.user.role === 'AGENT') {
  if (!req.user.agence_id) {
    return res.status(403).json({ error: 'Aucune agence associée' });
  }
  
  if (req.user.agence_id !== parseInt(agenceId)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }
}
```

---

## 📊 Résumé par Rôle

### CLIENT
- ✅ Gère ses propres données (véhicules, RDV, réclamations)
- ✅ Consulte le catalogue
- ✅ Utilise le chatbot
- ❌ Aucun accès aux données d'autres clients

### AGENT SAV
- ✅ Voit et gère les données de **SON agence uniquement**
- ✅ Valide les véhicules
- ✅ Confirme les rendez-vous
- ✅ **Affecte** les ouvriers (ne les crée pas)
- ✅ Traite les réclamations
- ❌ Ne peut PAS créer d'ouvriers
- ❌ Aucun accès aux autres agences

### ADMIN
- ✅ Accès complet à toutes les données
- ✅ Gère les utilisateurs
- ✅ Gère les agences
- ✅ **Crée les ouvriers**
- ✅ Gère le catalogue
- ✅ Modère les documents

### DIRECTION
- ✅ Vue globale (lecture seule)
- ✅ Statistiques consolidées
- ✅ Rapports multi-agences
- ❌ Aucune modification

---

**Date**: 29 Avril 2026  
**Version**: 1.0  
**Statut**: ✅ Validé
