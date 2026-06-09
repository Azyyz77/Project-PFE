# Guide de tests du projet STA Chery Tunisia

Ce document sert de guide opérationnel pour valider les principales fonctionnalités du projet STA Chery Tunisia : interface multilingue FR/EN/AR, assistant IA, détection d’images, cache Redis, monitoring Prometheus / Grafana, et performances backend/frontend.

Il est pensé comme un support de travail pour préparer les tests, vérifier les résultats, et structurer un rapport de validation clair et reproductible.

## 1. Objectif du guide

L’objectif est de fournir une méthode simple et professionnelle pour :

- vérifier le bon fonctionnement multi-langue de l’application,
- contrôler le rendu RTL pour l’arabe,
- tester l’assistant IA côté backend,
- valider la détection d’images Roboflow,
- comparer les performances avant et après cache Redis,
- confirmer que Prometheus et Grafana exposent correctement les métriques,
- documenter les résultats dans un rapport clair.

## 2. Organisation i18n du projet

Dans ce projet, la langue est gérée côté frontend via `frontend/contexts/LanguageContext.tsx`.

Caractéristiques importantes :

- langues supportées : `fr`, `en`, `ar`,
- fonction de traduction `t(key)`,
- indicateur RTL via `isRTL`,
- changement dynamique de langue via `setLanguage(lang)`.

Si vous décidez plus tard d’externaliser les traductions en JSON, vous pourrez reprendre la même logique de clés dans une structure de type `locales/fr`, `locales/en`, `locales/ar`. Pour l’instant, la référence du projet est le contexte de langue du frontend.

## 3. Préparation avant tests

Avant de lancer les vérifications, il est recommandé de confirmer les points suivants :

- le backend est démarré,
- le frontend est accessible,
- les scripts npm du projet sont disponibles,
- Redis est disponible si les tests de cache sont exécutés,
- Prometheus et Grafana sont configurés,
- les jeux de données de test sont prêts pour l’assistant IA et la vision IA.

Scripts utiles du projet :

- backend : `npm test`, `npm run test:unit`, `npm run test:integration`, `npm run test:load`, `npm run test:ai`, `npm run test:model`,
- frontend : `npm run test:e2e`, `npm run test:e2e:chrome`, `npm run test:e2e:mobile`, `npm run test:e2e:debug`.

## 4. Tests d’internationalisation (i18n)

### 4.1 Vérification des fichiers de traduction

Objectif : s’assurer que les clés sont cohérentes entre le français, l’anglais et l’arabe dans `LanguageContext.tsx`.

Contrôles à effectuer :

- comparer le nombre de clés dans chaque fichier,
- repérer les clés manquantes,
- repérer les clés en trop,
- vérifier la qualité des libellés,
- vérifier que les variables interpolées ont la même structure.

Exemple de désynchronisation dans le contexte de langue :

- `fr` contient `nav.logout`,
- `en` ne contient pas la même clé,
- `ar` doit proposer une traduction équivalente.

Dans ce cas, l’interface peut afficher une chaîne vide, une clé brute, ou un comportement incohérent selon l’implémentation.

### 4.2 Test du rendu RTL

Objectif : valider l’affichage arabe avec direction RTL.

Vérifications recommandées :

- alignement des textes,
- menus de navigation,
- tableaux,
- barre latérale,
- formulaires,
- icônes et espacements.

Points importants :

- vérifier que `isRTL` déclenche bien la direction RTL,
- contrôler que les composants n’inversent pas mal les marges ou paddings,
- tester le rendu sur Chrome, Firefox et Safari,
- contrôler les écrans dashboard, formulaires, tableaux, sidebar et menus.

### 4.3 Test du changement dynamique de langue

Objectif : confirmer que la langue peut changer sans rechargement complet de la page.

Exemple de changement attendu :

```javascript
setLanguage("ar")
```

Vérifications :

- le texte change instantanément,
- la direction RTL se met à jour,
- aucun refresh complet n’est observé,
- l’état de l’interface reste cohérent,
- les composants réactifs gardent les données affichées.

### 4.4 Tests mobiles

Objectif : confirmer le comportement sur petits écrans, y compris en RTL.

Vérifications :

- menus mobiles,
- débordement horizontal,
- lisibilité des textes,
- taille des boutons,
- comportement des tableaux,
- ouverture des panels et drawers,
- compatibilité avec les pages client, agent et administrateur.

Navigateurs et environnements utiles :

- Chrome DevTools,
- Android Emulator,
- Safari iOS Simulator.

## 5. Tests de l’assistant IA

Le backend expose l’assistant IA via `POST /api/ai-assistant/message`, avec historique sur `GET /api/ai-assistant/history` et statut sur `GET /api/ai-assistant/status`.

### 5.1 Création du dataset de test

Préparer un fichier CSV contenant les cas d’usage métier, par exemple :

```csv
question,reponse_attendue
"Comment suivre ma réparation ?","..."
```

Recommandation : construire environ 50 questions SAV couvrant les cas simples, les cas ambigus et les cas extrêmes. Le dataset doit rester aligné avec les besoins du service après-vente Chery Tunisia.

### 5.2 Test de pertinence des réponses

Objectif : vérifier que le système retourne une réponse utile, exacte et sans hallucination excessive.

Méthode :

- envoyer chaque question à `POST /api/ai-assistant/message`,
- comparer la réponse avec la réponse attendue,
- noter la pertinence métier,
- vérifier l’absence d’informations inventées.

Critères d’évaluation :

- pertinence,
- exactitude,
- clarté,
- stabilité des réponses.

### 5.3 Mesure du recall et de la precision

Recall : proportion des chunks pertinents retrouvés parmi tous les chunks pertinents disponibles.

Formule :

```text
Recall = Chunks pertinents retrouvés / Chunks pertinents totaux
```

Precision : proportion des chunks récupérés qui sont réellement pertinents.

Formule :

```text
Precision = Chunks pertinents / Chunks récupérés
```

### 5.4 Test de latence

Objectif : vérifier le temps de réponse du point d’entrée de l’assistant IA.

Outils possibles :

- Postman,
- k6,
- autocannon.

Exemple :

```bash
npx autocannon http://localhost:3000/api/ai-assistant/message
```

### 5.5 Validation du streaming

Objectif : confirmer que la réponse arrive progressivement côté frontend.

Vérifications :

- affichage token par token,
- absence de blocage UI,
- gestion correcte du flux réseau,
- rendu progressif visible par l’utilisateur.

Exemple technique côté frontend :

```javascript
const reader = response.body.getReader()
```

Si le projet ne stream pas encore la réponse de l’assistant, cette partie sert de cible d’évolution pour une future version.

## 6. Tests de vision IA (Roboflow)

### 6.1 Évaluation du modèle

Dataset recommandé : environ 200 images annotées.

Métrique principale :

- `mAP@0.5`

Plus cette valeur est proche de 1, plus le modèle est performant.

### 6.2 Tests API avec Postman

Cas à vérifier :

- image valide,
- image floue,
- image vide,
- format non supporté.

Endpoints de test :

```text
POST /api/detect/upload
POST /api/detect/url
```

Exemples de body :

```text
image=file.jpg
```

```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

### 6.3 Validation des bounding boxes

Contrôles attendus :

- position correcte,
- taille correcte,
- étiquette correcte,
- score de confiance affiché,
- cohérence visuelle entre l’image et l’overlay,
- conformité du résumé renvoyé par l’API.

### 6.4 Test de performance

Mesurer le temps d’inférence avec un chronomètre applicatif.

Exemple :

```javascript
const start = performance.now()
```

La mesure doit être réalisée sur plusieurs images pour obtenir une moyenne représentative.

## 7. Tests de performance Redis

### 7.1 Benchmark avant et après cache

Objectif : mesurer le gain apporté par Redis.

Exemple de requête à comparer :

```text
GET /api/vehicles
GET /api/agent/vehicles
```

Comparer :

- temps sans cache,
- temps avec cache,
- stabilité sous charge.

Dans ce projet, le cache est géré avec des clés de la forme `cache:/api/...` et peut être invalidé notamment lors des mises à jour véhicules, catalogue et validation.

### 7.2 Test d’invalidation

Objectif : vérifier que le cache est vidé lorsque les données changent.

Exemple :

```javascript
await redis.del("vehicles")
```

Vérifications :

- les anciennes données ne sont plus servies,
- les nouvelles données sont visibles,
- aucun état obsolète ne persiste.

En pratique, le projet invalide aussi des clés comme `cache:/api/vehicles*`, `cache:/api/agent/vehicles*` et `cache:/api/catalog*` selon le contrôleur concerné.

### 7.3 Tests de charge avec k6

Installation :

```bash
npm install -g k6
```

Script minimal :

```javascript
import http from 'k6/http'

export default function () {
  http.get('http://localhost:3000/api/vehicles')
}
```

Exécution :

```bash
k6 run --vus 100 --duration 30s test.js
```

Métriques à surveiller :

- temps moyen,
- requêtes par seconde,
- taux d’erreur,
- mémoire Redis,
- latence au percentile haut.

Pour le backend STA Chery Tunisia, les tests de charge doivent surtout viser les listes véhicules, rendez-vous, catalogue et assistant selon les cas d’usage les plus sollicités.

## 8. Tests Prometheus / Grafana

### 8.1 Vérification des métriques

Endpoint attendu :

```text
/metrics
```

Exemples de métriques :

```text
http_requests_total
nodejs_heap_size_total_bytes
http_request_duration_seconds
http_active_connections
```

### 8.2 Vérification Prometheus

Dans le fichier `docker/prometheus.yml`, ajouter ou confirmer la configuration suivante :

```yaml
scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
```

Puis contrôler dans l’interface Prometheus :

- `Status` → `Targets`,
- cible active,
- absence d’erreurs de scraping.

Le backend expose ces métriques via `prom-client` dans `backend/monitoring/metrics.js` et les publie sur `/metrics`.

### 8.3 Tests des alertes

Exemple de règle :

```yaml
- alert: HighCPU
  expr: cpu_usage > 80
```

Simulation :

- lancer une forte charge,
- vérifier que l’alerte se déclenche,
- confirmer qu’une notification est bien reçue.

### 8.4 Vérification Grafana

Contrôles attendus :

- cohérence des graphes,
- rafraîchissement temps réel,
- dashboards correctement alimentés,
- filtres et variables cohérents.

## 9. Outils recommandés

| Domaine | Outils |
| --- | --- |
| API Testing | Postman |
| Load Testing | k6, autocannon, Artillery |
| Frontend Testing | Playwright, Chrome DevTools |
| Monitoring | Prometheus, Grafana |
| Cache | Redis Insight |
| IA Assistant | Assistant AI Chery |
| IA Vision | Roboflow |
| Logs | Winston, Morgan |
| Performance | Lighthouse |

## 10. Modèle de rapport professionnel

Pour chaque test, utiliser une fiche standardisée.

### Exemple : test de latence assistant IA

| Élément | Valeur |
| --- | --- |
| Domaine | Assistant IA / backend |
| Outil | Postman |
| Endpoint | `/api/ai-assistant/message` |
| Objectif | Moins de 3 secondes |
| Résultat | 2.1 secondes |
| Statut | Validé |

## 11. Critères de validation globaux

Le test peut être considéré comme satisfaisant si :

- les fichiers de traduction sont synchronisés,
- le RTL fonctionne proprement,
- la langue change sans refresh,
- les tests mobiles ne montrent pas de régression,
- les réponses de l’assistant restent pertinentes,
- la latence reste dans les seuils fixés,
- les détections vision sont visuellement correctes,
- Redis améliore effectivement la performance,
- Prometheus collecte les métriques,
- Grafana affiche des dashboards cohérents.

## 12. Recommandation de méthode d’exécution

L’ordre conseillé est :

1. vérifier d’abord les traductions et le RTL,
2. valider l’assistant IA et le streaming,
3. tester la vision IA,
4. comparer les performances avec et sans Redis,
5. contrôler Prometheus et Grafana,
6. documenter les résultats dans le rapport final.

## 13. Tests Postman prêts à copier-coller

Cette section regroupe des requêtes directement utilisables dans Postman. L’idée est de créer deux variables d’environnement :

- `baseUrl` = `http://localhost:3000`
- `token` = jeton JWT récupéré après connexion

Ensuite, dans chaque requête protégée, utiliser l’en-tête :

```text
Authorization: Bearer {{token}}
Content-Type: application/json
```

Pour les tests de fichiers, ne pas forcer `Content-Type`, car Postman le génère automatiquement.

### 13.1 Connexion utilisateur

Méthode : `POST`

URL :

```text
{{baseUrl}}/api/users/login
```

Body Postman à coller dans `raw` > `JSON` :

```json
{
  "email": "client@example.com",
  "password": "password123"
}
```

Réponse attendue :

```json
{
  "message": "Connexion réussie",
  "token": "...",
  "user": {
    "id": 1,
    "prenom": "...",
    "nom": "...",
    "email": "...",
    "telephone": "...",
    "role": "CLIENT"
  }
}
```

Copier ensuite `token` dans la variable d’environnement `{{token}}`.

### 13.2 Vérifier le statut de l’assistant IA

Méthode : `GET`

URL :

```text
{{baseUrl}}/api/ai-assistant/status
```

Headers :

```text
Authorization: Bearer {{token}}
```

Réponse attendue :

```json
{
  "success": true,
  "status": "online",
  "message": "Service AI opérationnel"
}
```

### 13.3 Envoyer un message à l’assistant IA

Méthode : `POST`

URL :

```text
{{baseUrl}}/api/ai-assistant/message
```

Headers :

```text
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body à coller :

```json
{
  "message": "Comment suivre ma réparation ?",
  "context": {
    "language": "fr",
    "page": "client/dashboard"
  }
}
```

Réponse attendue :

```json
{
  "success": true,
  "reply": "...",
  "timestamp": "2026-05-28T10:00:00.000Z"
}
```

### 13.4 Consulter l’historique de l’assistant IA

Méthode : `GET`

URL :

```text
{{baseUrl}}/api/ai-assistant/history
```

Headers :

```text
Authorization: Bearer {{token}}
```

Réponse attendue :

```json
{
  "success": true,
  "conversations": [],
  "message": "Fonctionnalité en développement"
}
```

### 13.5 Détection d’image avec upload

Méthode : `POST`

URL :

```text
{{baseUrl}}/api/detect/upload
```

Headers :

```text
Authorization: Bearer {{token}}
```

Dans Postman :

- aller dans `Body`,
- choisir `form-data`,
- ajouter une clé `image` de type `File`,
- sélectionner une image locale.

Réponse attendue :

```json
{
  "success": true,
  "total": 1,
  "predictions": [],
  "summary": [],
  "image": "..."
}
```

### 13.6 Détection d’image via URL

Méthode : `POST`

URL :

```text
{{baseUrl}}/api/detect/url
```

Headers :

```text
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body à coller :

```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

### 13.7 Vérifier les métriques Prometheus

Méthode : `GET`

URL :

```text
{{baseUrl}}/metrics
```

Headers :

```text
Accept: text/plain
```

Exemple de réponse attendue :

```text
http_requests_total
http_request_duration_seconds
http_active_connections
```

### 13.8 Lister mes véhicules

Méthode : `GET`

URL :

```text
{{baseUrl}}/api/vehicles/my
```

Headers :

```text
Authorization: Bearer {{token}}
```

### 13.9 Ajouter un véhicule

Méthode : `POST`

URL :

```text
{{baseUrl}}/api/vehicles
```

Headers :

```text
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body à coller :

```json
{
  "immatriculation": "TU 123 456",
  "numero_chassis": "VF1RFD00X56789012",
  "version_id": 1,
  "couleur": "Blanc",
  "annee": 2021
}
```

### 13.10 Créer un rendez-vous

Méthode : `POST`

URL :

```text
{{baseUrl}}/api/appointments
```

Headers :

```text
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body à coller :

```json
{
  "vehicule_id": 1,
  "agence_id": 2,
  "date_heure": "2026-06-01T09:30:00.000Z",
  "description": "Révision générale",
  "sous_type_ids": [1, 3]
}
```

### 13.11 Lister les agences disponibles

Méthode : `GET`

URL :

```text
{{baseUrl}}/api/appointments/agencies
```

Headers :

```text
Authorization: Bearer {{token}}
```

### 13.12 Lister les créneaux disponibles

Méthode : `GET`

URL :

```text
{{baseUrl}}/api/appointments/slots?agenceId=2&date=2026-06-01
```

Headers :

```text
Authorization: Bearer {{token}}
```

### 13.13 Bon scénario de test dans Postman

Ordre recommandé :

1. exécuter `POST /api/users/login`,
2. copier le `token` dans l’environnement,
3. exécuter `GET /api/ai-assistant/status`,
4. exécuter `POST /api/ai-assistant/message`,
5. exécuter `POST /api/detect/upload`,
6. exécuter `GET /metrics`,
7. exécuter `GET /api/vehicles/my`,
8. exécuter `POST /api/appointments`.

## 14. Conclusion

Ce guide peut servir de base pour exécuter, comparer et documenter les tests du projet. Il est volontairement structuré pour être repris dans un rapport, enrichi avec des captures d’écran, et adapté selon l’environnement de déploiement réel.