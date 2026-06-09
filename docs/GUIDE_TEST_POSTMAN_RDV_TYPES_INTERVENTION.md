# Guide de test Postman

## Validation des API de prise de rendez-vous et de gestion des types d’intervention

Ce document a pour objectif de guider la réalisation des tests fonctionnels des API développées dans ce sprint à l’aide de Postman. Les scénarios couvrent les cas nominaux et alternatifs des endpoints de prise de rendez-vous ainsi que ceux de gestion des types et sous-types d’intervention.

## 1. Prérequis

Avant de lancer les tests, vérifier les points suivants :

- Le backend Express.js est démarré sur le port `3000`.
- La base de données `STA_SAV_DB` est accessible.
- Un utilisateur authentifié dispose d’un jeton JWT valide.
- Le header `Authorization` est renseigné au format `Bearer <token>` pour les endpoints protégés.
- Les identifiants des agences, véhicules, plages horaires, types et sous-types existent déjà dans la base.

### Environnement Postman

- `Base URL` : `http://localhost:3000`
- `Authorization` : `Bearer <token>`
- `Content-Type` : `application/json`

## 2. Objectif des tests

Les tests visent à vérifier :

- le bon fonctionnement des endpoints HTTP ;
- la conformité des codes de réponse (`200`, `201`, `404`, etc.) ;
- la structure JSON renvoyée par l’API ;
- la prise en charge des scénarios alternatifs et d’erreur ;
- la restriction d’accès pour les routes réservées aux administrateurs.

## 3. Module Prise de Rendez-vous

> Important : le backend expose les endpoints de rendez-vous sous `/api/appointments` et non `/api/rdv`.

### 3.1 Soumission d’une demande de RDV

> Le backend attend un corps JSON au format `vehicule_id`, `agence_id` et `date_heure`.

**Méthode :** `POST`  
**URL :** `http://localhost:3000/api/appointments`

**Body JSON :**
```json
{
  "vehicule_id": 10019,
  "agence_id": 2,
  "date_heure": "2026-06-10T09:00:00",
  "description": "Demande de rendez-vous SAV",
  "sous_type_ids": [7]
}
```

**En-tête requis :**
```http
Authorization: Bearer <token>
```

**Résultat attendu :**
```json
{
  "message": "RDV créé avec succès.",
  "rdv": {
    "id": 45,
    "statut": "EN_ATTENTE",
    "date_heure": "2026-06-10T09:00:00",
    "sms_envoye": true
  }
}
```

**Code attendu :** `201 Created`

### 3.2 Consultation des créneaux disponibles

**Méthode :** `GET`  
**URL :** `http://localhost:3000/api/appointments/slots?agenceId=2&date=2026-06-10`

**En-tête requis :**
```http
Authorization: Bearer <token>
```

**Résultat attendu :**
```json
{
  "creneauxDisponibles": [
    {
      "plageId": 5,
      "heureDebut": "09:00",
      "heureFin": "10:00",
      "placesRestantes": 3
    }
  ]
}
```

**Code attendu :** `200 OK`

### 3.3 Confirmation d’un RDV par l’Agent SAV

**Méthode :** `POST`  
**URL :** `http://localhost:3000/api/appointments/45/confirm`

**Body JSON :**
```json
{
  "note": "Apportez la carte grise du véhicule"
}
```

**En-tête requis :**
```http
Authorization: Bearer <token>
```

**Résultat attendu :**
```json
{
  "message": "RDV confirmé avec succès.",
  "rdv": {
    "id": 45,
    "statut": "CONFIRMÉ",
    "smsEnvoyé": true
  }
}
```

**Code attendu :** `200 OK`

### 3.4 Annulation d’un RDV avec motif

**Méthode :** `DELETE`  
**URL :** `http://localhost:3000/api/appointments/45`

**Body JSON :**
```json
{
  "raison": "Client indisponible"
}
```

**En-tête requis :**
```http
Authorization: Bearer <token>
```

**Résultat attendu :**
```json
{
  "message": "Rendez-vous annulé avec succès"
}
```

**Code attendu :** `200 OK`

### 3.5 Confirmation d’un RDV inexistant

**Méthode :** `POST`  
**URL :** `http://localhost:3000/api/appointments/999/confirm`

**Body JSON :**
```json
{
  "note": "Test RDV inexistant"
}
```

**En-tête requis :**
```http
Authorization: Bearer <token>
```

**Résultat attendu :**
```json
{
  "error": "RDV introuvable",
  "rdvId": 999
}
```

**Code attendu :** `404 Not Found`

## 4. Module Gestion des Types d’Intervention

Ces endpoints sont réservés aux utilisateurs ayant le rôle `ADMIN`.

> Important : les routes admin du catalogue sont exposées sous `/api/admin/catalog`.

### 4.1 Création d’un type d’intervention

**Méthode :** `POST`  
**URL :** `http://localhost:3000/api/admin/catalog/intervention-types`

**Body JSON :**
```json
{
  "nom": "Service rapide",
  "delai_moyen": 2
}
```

**En-tête requis :**
```http
Authorization: Bearer <token_admin>
```

**Résultat attendu :**
```json
{
  "message": "Type créé avec succès",
  "typeId": 8
}
```

**Code attendu :** `201 Created`

### 4.2 Ajout d’un sous-type avec délai moyen

**Méthode :** `POST`  
**URL :** `http://localhost:3000/api/admin/catalog/sub-types`

**Body JSON :**
```json
{
  "nom": "Vidange huile moteur",
  "type_intervention_id": 8,
  "duree_estimee": 1
}
```

**En-tête requis :**
```http
Authorization: Bearer <token_admin>
```

**Résultat attendu :**
```json
{
  "message": "Sous-type créé avec succès",
  "subTypeId": 22
}
```

**Code attendu :** `201 Created`

### 4.3 Consultation de la liste des types disponibles

**Méthode :** `GET`  
**URL :** `http://localhost:3000/api/catalog/types`

**En-tête requis :**
```http
Authorization: Bearer <token>
```

**Résultat attendu :**
```json
[
  {
      "id": 8,
      "nom": "Service rapide",
      "sous_types": [
        {
          "id": 22,
          "nom": "Vidange huile moteur",
          "duree_estimee": 1
        }
      ]
  }
]
```

**Code attendu :** `200 OK`

### 4.4 X d’un type d’intervention

**Méthode :** `PUT`  
**URL :** `http://localhost:3000/api/admin/catalog/intervention-types/8`

**Body JSON :**
```json
{
  "nom": "Service rapide mis à jour",
  "delai_moyen": 3
}
```

**En-tête requis :**
```http
Authorization: Bearer <token_admin>
```

**Résultat attendu :**
```json
{
  "message": "Type modifié avec succès"
}
```

**Code attendu :** `200 OK`

## 5. Vérifications complémentaires

Pour chaque test, il est conseillé de contrôler :

- le code HTTP retourné ;
- le contenu du corps de réponse JSON ;
- la cohérence des messages métiers ;
- la présence éventuelle de champs additionnels (`smsEnvoyé`, `statut`, etc.) ;
- la réaction de l’API face aux identifiants inexistants ou aux droits insuffisants.

## 6. Recommandations de saisie dans Postman

- Créer une collection nommée `SAV - RDV et Types d’Intervention`.
- Définir une variable `baseUrl` valant `http://localhost:3000`.
- Définir une variable `token` pour les tests authentifiés.
- Réutiliser le header `Authorization` dans tous les appels protégés.
- Exécuter les tests dans l’ordre pour garantir la présence des ressources créées auparavant.

## 7. Conclusion

Les scénarios ci-dessus permettent de valider le bon fonctionnement des API de prise de rendez-vous et de gestion des types d’intervention développées dans ce sprint. Ils couvrent les cas de succès, les cas de consultation, les opérations de validation métier et les erreurs fonctionnelles les plus importantes.
