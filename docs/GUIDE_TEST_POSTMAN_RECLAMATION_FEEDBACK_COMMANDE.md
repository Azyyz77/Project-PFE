# Guide Postman - Reclamation, Feedback, Commande

Ce guide Postman couvre :
- creation d'une reclamation
- changement de statut d'une reclamation
- ajout de feedback
- creation de commande de reparation

## 1) Variables Postman

Creez une environnement Postman avec :
- baseUrl = http://localhost:3000
- tokenClient = (a renseigner apres login client)
- tokenAgent = (a renseigner apres login agent)
- complaintId = (a renseigner apres creation)
- rdvId = (id d'un rendez-vous termine)
- commandeId = (a renseigner apres creation)

## 2) Authentification

### 2.1 Login client
- Method: POST
- URL: {{baseUrl}}/api/users/login
- Body (JSON):
```json
{
  "email": "client@example.com",
  "mot_de_passe": "password"
}
```
- Test (Postman):
```javascript
pm.environment.set("tokenClient", pm.response.json().token);
```

### 2.2 Login agent
- Method: POST
- URL: {{baseUrl}}/api/users/login
- Body (JSON):
```json
{
  "email": "agent@example.com",
  "mot_de_passe": "password"
}
```
- Test (Postman):
```javascript
pm.environment.set("tokenAgent", pm.response.json().token);
```

## 3) Creation d'une reclamation

- Method: POST
- URL: {{baseUrl}}/api/complaints
- Headers:
  - Authorization: Bearer {{tokenClient}}
- Body (JSON):
```json
{
  "sujet": "Probleme avec la reparation",
  "description": "La reparation effectuee ne correspond pas a mes attentes."
}
```
- Test (Postman):
```javascript
const body = pm.response.json();
pm.environment.set("complaintId", body.complaint.id);
```

## 4) Changement de statut de reclamation (agent)

- Method: PUT
- URL: {{baseUrl}}/api/complaints/{{complaintId}}/status
- Headers:
  - Authorization: Bearer {{tokenAgent}}
- Body (JSON):
```json
{
  "statut": "EN_COURS",
  "reponse": "Votre reclamation est prise en charge."
}
```

## 5) Ajout de feedback sur un rendez-vous termine

Prerequis : le rendez-vous doit etre TERMINE.

- Method: POST
- URL: {{baseUrl}}/api/appointments/{{rdvId}}/feedback
- Headers:
  - Authorization: Bearer {{tokenClient}}
- Body (JSON):
```json
{
  "note": 5,
  "commentaire": "Service rapide et professionnel."
}
```

Note: cette route n'accepte pas PUT. Un PUT renverra 404 (Route non trouvee).

## 6) Creation d'une commande de reparation (agent)

- Method: POST
- URL: {{baseUrl}}/api/repair-orders/from-appointment/{{rdvId}}
- Headers:
  - Authorization: Bearer {{tokenAgent}}
- Test (Postman):
```javascript
const body = pm.response.json();
if (body.commande && body.commande.id) {
  pm.environment.set("commandeId", body.commande.id);
}
```

## 7) (Optionnel) Recuperer une commande

- Method: GET
- URL: {{baseUrl}}/api/repair-orders/{{commandeId}}
- Headers:
  - Authorization: Bearer {{tokenAgent}}
