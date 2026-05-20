# DOCUMENTATION COMPLÈTE - PARTIE 2
## TECHNOLOGIES ET DÉPENDANCES

---

## 4. TECHNOLOGIES ET DÉPENDANCES {#technologies}

### 4.1 Dépendances Backend (package.json)

#### Production Dependencies

| Bibliothèque | Version | Description | Utilisation |
|--------------|---------|-------------|-------------|
| **express** | 4.18.2 | Framework web Node.js | Serveur HTTP, routing, middleware |
| **mssql** | 9.3.2 | Driver SQL Server | Connexion et requêtes base de données |
| **jsonwebtoken** | 9.0.0 | Génération/vérification JWT | Authentification utilisateurs |
| **bcrypt** | 6.0.0 | Hachage de mots de passe | Sécurité des credentials |
| **cors** | 2.8.6 | Cross-Origin Resource Sharing | Autoriser requêtes frontend |
| **dotenv** | 16.6.1 | Variables d'environnement | Configuration sensible |
| **helmet** | 8.1.0 | Sécurité HTTP headers | Protection XSS, clickjacking |
| **express-rate-limit** | 8.4.1 | Limitation de requêtes | Protection DDoS, brute-force |
| **multer** | 1.4.5-lts.1 | Upload de fichiers | Gestion documents/images |
| **nodemailer** | 6.10.1 | Envoi d'emails | Notifications, confirmations |
| **whatsapp-web.js** | 1.34.6 | API WhatsApp | Envoi OTP, notifications |
| **node-cron** | 4.2.1 | Tâches planifiées | Rappels automatiques |
| **swagger-jsdoc** | 6.2.8 | Génération doc API | Documentation Swagger |
| **swagger-ui-express** | 5.0.1 | Interface Swagger | UI documentation API |
| **pdfkit** | 0.18.0 | Génération PDF | Factures, rapports |
| **exceljs** | 4.4.0 | Génération Excel | Export données, rapports |
| **axios** | 1.14.0 | Client HTTP | Appels API externes |
| **qrcode-terminal** | 0.12.0 | QR codes | WhatsApp authentication |

#### Dev Dependencies

| Bibliothèque | Version | Description | Utilisation |
|--------------|---------|-------------|-------------|
| **jest** | 30.3.0 | Framework de tests | Tests unitaires/intégration |
| **supertest** | 7.2.2 | Tests HTTP | Tests API endpoints |
| **nodemon** | 2.0.22 | Auto-reload serveur | Développement |

### 4.2 Dépendances Frontend (package.json)

#### Production Dependencies

| Bibliothèque | Version | Description | Utilisation |
|--------------|---------|-------------|-------------|
| **next** | 16.1.3 | Framework React | SSR, routing, optimisations |
| **react** | 19.2.3 | Bibliothèque UI | Composants, state management |
| **react-dom** | 19.2.3 | Rendu React | DOM manipulation |
| **typescript** | 5 | Langage typé | Type safety, IntelliSense |
| **tailwindcss** | 4 | Framework CSS | Styling utility-first |
| **axios** | 1.14.0 | Client HTTP | Appels API backend |
| **lucide-react** | 1.7.0 | Icônes | UI icons (2000+ icônes) |
| **framer-motion** | 11.0.0 | Animations | Transitions, animations |
| **react-hook-form** | 7.50.0 | Gestion formulaires | Validation, performance |
| **zod** | 3.22.0 | Validation schémas | Validation données |
| **@radix-ui/react-*** | 1.3.3 | Composants accessibles | Checkbox, Dialog, etc. |
| **shadcn** | 4.1.2 | Système de design | Composants UI réutilisables |
| **recharts** | 3.8.1 | Graphiques | Statistiques, dashboards |
| **date-fns** | 4.1.0 | Manipulation dates | Formatage, calculs |
| **next-themes** | 0.2.1 | Thèmes dark/light | Gestion thèmes |
| **sonner** | 1.7.4 | Notifications toast | Feedback utilisateur |
| **clsx** | 2.1.1 | Classes conditionnelles | Styling dynamique |
| **tailwind-merge** | 3.5.0 | Fusion classes Tailwind | Éviter conflits CSS |
| **class-variance-authority** | 0.7.1 | Variants composants | Système de variants |
| **react-signature-canvas** | 1.1.0 | Signature électronique | Signatures clients |

#### Dev Dependencies

| Bibliothèque | Version | Description | Utilisation |
|--------------|---------|-------------|-------------|
| **@playwright/test** | 1.59.1 | Tests E2E | Tests end-to-end |
| **eslint** | 9 | Linter JavaScript | Qualité code |
| **eslint-config-next** | 16.1.3 | Config ESLint Next.js | Standards Next.js |

---

## 5. FONCTIONNALITÉS PAR MODULE {#fonctionnalités}

### 5.1 Module Authentification

#### Fonctionnalités
- ✅ Inscription utilisateur (CLIENT)
- ✅ Connexion (email + mot de passe)
- ✅ Vérification OTP par WhatsApp
- ✅ Vérification téléphone
- ✅ Mot de passe oublié
- ✅ Réinitialisation mot de passe
- ✅ Gestion sessions JWT
- ✅ Refresh tokens
- ✅ Déconnexion

#### Endpoints API
```
POST   /api/users/register          # Inscription
POST   /api/users/login             # Connexion
POST   /api/users/verify-otp        # Vérification OTP
POST   /api/users/verify-phone      # Vérification téléphone
POST   /api/users/forgot-password   # Demande reset
POST   /api/users/reset-password    # Reset mot de passe
POST   /api/users/logout            # Déconnexion
GET    /api/users/me                # Profil utilisateur
```

#### Sécurité
- Hachage bcrypt (10 rounds)
- JWT avec expiration (24h)
- Rate limiting sur login (20 tentatives/heure)
- OTP 6 chiffres via WhatsApp
- Validation email format
- Validation téléphone tunisien (+216)

### 5.2 Module Véhicules

#### Fonctionnalités
- ✅ Ajout véhicule client
- ✅ Liste véhicules utilisateur
- ✅ Détails véhicule
- ✅ Modification véhicule
- ✅ Suppression véhicule
- ✅ Validation immatriculation tunisienne
- ✅ Historique interventions
- ✅ Photos véhicule
- ✅ Catalogue modèles Chery

#### Endpoints API
```
POST   /api/vehicles                # Créer véhicule
GET    /api/vehicles                # Liste véhicules
GET    /api/vehicles/my             # Mes véhicules
GET    /api/vehicles/:id            # Détails véhicule
PUT    /api/vehicles/:id            # Modifier véhicule
DELETE /api/vehicles/:id            # Supprimer véhicule
GET    /api/vehicles/:id/history    # Historique
POST   /api/vehicles/validate-plate # Valider immatriculation
```

#### Validation Immatriculation
Format tunisien: `123 تونس 4567`
- 3 chiffres + "تونس" + 4 chiffres
- Validation côté backend et frontend
- Regex: `/^\d{3}\s*تونس\s*\d{4}$/`

### 5.3 Module Rendez-vous

#### Fonctionnalités
- ✅ Prise de rendez-vous en 3 étapes
  - Étape 1: Sélection véhicule + problème
  - Étape 2: Choix date/heure + agence
  - Étape 3: Confirmation + récapitulatif
- ✅ Sélection packages interventions
- ✅ Choix créneaux horaires
- ✅ Pièces jointes (photos, documents)
- ✅ Historique rendez-vous
- ✅ Annulation rendez-vous
- ✅ Modification rendez-vous
- ✅ Notifications automatiques
- ✅ Rappels 24h et 2h avant

#### Endpoints API
```
POST   /api/appointments            # Créer RDV
GET    /api/appointments            # Liste RDV
GET    /api/appointments/my         # Mes RDV
GET    /api/appointments/:id        # Détails RDV
PUT    /api/appointments/:id        # Modifier RDV
DELETE /api/appointments/:id        # Annuler RDV
POST   /api/appointments/:id/attachments  # Ajouter pièce jointe
GET    /api/timeslots               # Créneaux disponibles
```

#### Statuts Rendez-vous
1. **EN_ATTENTE** - Créé, en attente validation
2. **CONFIRME** - Validé par agent
3. **EN_COURS** - Intervention en cours
4. **TERMINE** - Intervention terminée
5. **ANNULE** - Annulé par client/agent

### 5.4 Module Réclamations

#### Fonctionnalités
- ✅ Création réclamation
- ✅ Suivi réclamations
- ✅ Réponses agents
- ✅ Historique échanges
- ✅ Statuts réclamations
- ✅ Notifications

#### Endpoints API
```
POST   /api/complaints              # Créer réclamation
GET    /api/complaints              # Liste réclamations
GET    /api/complaints/:id          # Détails réclamation
PUT    /api/complaints/:id          # Modifier réclamation
POST   /api/complaints/:id/response # Répondre
```

### 5.5 Module Ordres de Réparation

#### Fonctionnalités
- ✅ Création ordre réparation
- ✅ Gestion pièces détachées
- ✅ Suivi interventions
- ✅ Diagnostic technique
- ✅ Devis
- ✅ Facturation
- ✅ Historique

#### Endpoints API
```
POST   /api/repair-orders           # Créer ordre
GET    /api/repair-orders           # Liste ordres
GET    /api/repair-orders/:id       # Détails ordre
PUT    /api/repair-orders/:id       # Modifier ordre
POST   /api/repair-orders/:id/items # Ajouter pièce
```

### 5.6 Module Facturation

#### Fonctionnalités
- ✅ Génération factures
- ✅ Calcul TVA (19%)
- ✅ Export PDF
- ✅ Historique factures
- ✅ Statistiques revenus

#### Endpoints API
```
POST   /api/invoices                # Créer facture
GET    /api/invoices                # Liste factures
GET    /api/invoices/:id            # Détails facture
GET    /api/invoices/:id/pdf        # Télécharger PDF
```

### 5.7 Module Chatbot IA

#### Fonctionnalités
- ✅ Assistant virtuel
- ✅ Réponses automatiques
- ✅ Modération contenu
- ✅ Historique conversations
- ✅ Intégration Hugging Face

#### Endpoints API
```
POST   /api/ai-assistant/chat       # Envoyer message
GET    /api/ai-assistant/history    # Historique
POST   /api/moderation/check        # Modérer contenu
```

### 5.8 Module Documents

#### Fonctionnalités
- ✅ Upload documents
- ✅ Téléchargement
- ✅ Gestion permissions
- ✅ Catégorisation

#### Endpoints API
```
POST   /api/documents               # Upload document
GET    /api/documents               # Liste documents
GET    /api/documents/:id           # Télécharger
DELETE /api/documents/:id           # Supprimer
```

### 5.9 Module Feedback

#### Fonctionnalités
- ✅ Évaluation services
- ✅ Commentaires
- ✅ Notes (1-5 étoiles)
- ✅ Statistiques satisfaction

#### Endpoints API
```
POST   /api/feedback                # Créer feedback
GET    /api/feedback                # Liste feedbacks
GET    /api/feedback/stats          # Statistiques
```

