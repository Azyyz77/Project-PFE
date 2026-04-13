# 🚗 Backend STA Chery Tunisia

Backend monolithique pour le système de gestion après-vente Chery Tunisie.

## 🎯 Fonctionnalités

- ✅ Authentification JWT
- ✅ Gestion des utilisateurs (Clients, Agents, Admin)
- ✅ Gestion des véhicules
- ✅ Système de rendez-vous
- ✅ Catalogue d'interventions
- ✅ Gestion des commandes
- ✅ Réclamations
- ✅ Notifications
- ✅ Rapports et statistiques
- ✅ Intégration WhatsApp
- 🤖 **Assistant AI** (Nouveau!)

## 🚀 Démarrage Rapide

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer le serveur
npm start

# Ou en mode développement
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

## 📚 Documentation

### Documentation Générale
- `README.md` - Ce fichier
- `.env.example` - Variables d'environnement

### Documentation AI (Nouveau! 🤖)
- **[AI_INDEX.md](./AI_INDEX.md)** - Index de toute la documentation AI
- **[LISEZ_MOI_AI.md](./LISEZ_MOI_AI.md)** - Guide simple en français
- **[QUICK_START_AI.md](./QUICK_START_AI.md)** - Démarrage rapide AI
- **[AI_DEPLOYMENT_GUIDE.md](./AI_DEPLOYMENT_GUIDE.md)** - Déploiement Hugging Face
- **[AI_INTEGRATION_README.md](./AI_INTEGRATION_README.md)** - Documentation technique
- **[AI_SUMMARY.md](./AI_SUMMARY.md)** - Résumé complet

## 🔌 API Endpoints

### Authentification
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/:id` - Profil utilisateur

### Véhicules
- `POST /api/vehicles` - Ajouter un véhicule
- `GET /api/vehicles/user/:userId` - Véhicules d'un utilisateur
- `GET /api/vehicles/:id` - Détails d'un véhicule

### Rendez-vous
- `POST /api/appointments` - Créer un rendez-vous
- `GET /api/appointments/my` - Mes rendez-vous
- `GET /api/appointments/slots` - Créneaux disponibles

### Assistant AI 🤖
- `POST /chat` - Chat simple (développement)
- `POST /api/ai-assistant/message` - Chat protégé (production)
- `GET /api/ai-assistant/status` - Statut du service AI

[Voir la documentation complète des endpoints dans Swagger]

## 🏗️ Architecture

```
backend/
├── config/              # Configuration (DB, Swagger)
├── controllers/         # Logique métier
├── middleware/          # Authentification, autorisation
├── routes/              # Définition des routes
├── services/            # Services (WhatsApp, AI)
├── tests/               # Tests
├── ai-deployment/       # Déploiement AI sur Hugging Face
└── server.js            # Point d'entrée
```

## 🤖 Assistant AI

Le backend intègre maintenant un assistant AI pour répondre automatiquement aux questions des clients.

### Démarrage Rapide AI

```bash
# Option 1 (recommande): Hugging Face Inference API
# 1) Creer un token read: https://huggingface.co/settings/tokens
# 2) Configurer dans .env
HUGGINGFACE_MODEL_ID=dali444444/chery-sav-qwen2.5-3b-lora
HUGGINGFACE_API_TOKEN=hf_votre_token

# 3) Demarrer
npm start

# Option 2: Hugging Face Space (endpoint custom)
# HUGGINGFACE_API_URL=https://votre-space.hf.space/chat
```

**Pour plus de détails, consultez [AI_INDEX.md](./AI_INDEX.md)**

## 🔧 Configuration

### Variables d'Environnement

Créez un fichier `.env` basé sur `.env.example`:

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sta_chery

# JWT
JWT_SECRET=votre_secret_jwt

# Serveur
PORT=3000

# Hugging Face - Option 1 (Inference API)
HUGGINGFACE_MODEL_ID=dali444444/chery-sav-qwen2.5-3b-lora
HUGGINGFACE_API_TOKEN=hf_votre_token

# Optionnel (Inference API avancee)
# HUGGINGFACE_INFERENCE_URL=https://api-inference.huggingface.co/models/dali444444/chery-sav-qwen2.5-3b-lora
# HUGGINGFACE_MAX_NEW_TOKENS=300
# HUGGINGFACE_TEMPERATURE=0.7
# HUGGINGFACE_TOP_P=0.9

# Option 2 (Space)
# HUGGINGFACE_API_URL=https://votre-space.hf.space/chat
```

## 🧪 Tests

```bash
# Tests AI
npm run test:ai

# Autres tests (à implémenter)
npm test
```

## 📊 Swagger Documentation

Une fois le serveur démarré, accédez à la documentation interactive:

```
http://localhost:3000/api-docs
```

## 🔐 Sécurité

- Authentification JWT pour toutes les routes protégées
- Validation des entrées
- Gestion des rôles (Client, Agent, Admin)
- Protection CORS
- Variables d'environnement pour les secrets

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MSSQL** - Base de données
- **JWT** - Authentification
- **Swagger** - Documentation API
- **WhatsApp Web.js** - Intégration WhatsApp
- **node-llama-cpp** - Modèle AI local
- **Axios** - Client HTTP pour Hugging Face

## 📈 Performance

### Optimisations Recommandées

1. **Cache** - Implémenter Redis pour les données fréquentes
2. **Rate Limiting** - Limiter les requêtes par utilisateur
3. **Compression** - Activer gzip
4. **Clustering** - Utiliser PM2 pour plusieurs instances
5. **CDN** - Pour les assets statiques

## 🐛 Dépannage

### Problème: Base de données non accessible
**Solution**: Vérifier les credentials dans `.env` et que SQL Server est démarré

### Problème: JWT invalide
**Solution**: Vérifier que `JWT_SECRET` est défini dans `.env`

### Problème: WhatsApp ne se connecte pas
**Solution**: Scanner le QR code dans le terminal

### Problème: AI non disponible
**Solution**: Consulter [QUICK_START_AI.md](./QUICK_START_AI.md) section "Problèmes Courants"

## 📝 Scripts NPM

```bash
npm start          # Démarrer le serveur
npm run dev        # Mode développement avec nodemon
npm run test:ai    # Tests de l'assistant AI
```

## 🤝 Contribution

1. Créer une branche pour votre fonctionnalité
2. Commiter vos changements
3. Pousser vers la branche
4. Créer une Pull Request

## 📞 Support

Pour toute question:
- Consulter la documentation appropriée
- Vérifier les logs du serveur
- Consulter Swagger pour les endpoints
- Pour l'AI: voir [AI_INDEX.md](./AI_INDEX.md)

## 📄 Licence

ISC

## 👥 Auteurs

Équipe STA Chery Tunisia

---

## 🆕 Nouveautés

### Version 1.1.0 (Avril 2026)
- ✨ Ajout de l'assistant AI
- 📚 Documentation complète AI
- 🚀 Support Hugging Face
- 🧪 Tests automatisés AI

### Version 1.0.0
- 🎉 Version initiale
- ✅ Toutes les fonctionnalités de base

---

**Bon développement! 🚀**
