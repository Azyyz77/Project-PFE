# DOCUMENTATION COMPLÈTE - PARTIE 4
## BASE DE DONNÉES, SÉCURITÉ ET DÉPLOIEMENT

---

## 7. BASE DE DONNÉES {#base-de-données}

### 7.1 Système de Gestion

**SGBD:** Microsoft SQL Server  
**Base de données:** STA_SAV_DB  
**Driver:** mssql (Node.js)  
**Configuration:** Connexion pool avec retry logic

### 7.2 Tables Principales

#### Utilisateurs et Authentification
```sql
-- Utilisateur
CREATE TABLE Utilisateur (
    id_utilisateur INT PRIMARY KEY IDENTITY,
    nom NVARCHAR(100) NOT NULL,
    prenom NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe NVARCHAR(255) NOT NULL,
    telephone NVARCHAR(20),
    telephone_verifie BIT DEFAULT 0,
    role NVARCHAR(20) CHECK (role IN ('CLIENT', 'AGENT', 'ADMIN', 'DIRECTION')),
    statut NVARCHAR(20) DEFAULT 'ACTIF',
    date_creation DATETIME DEFAULT GETDATE(),
    derniere_connexion DATETIME
);

-- OTP
CREATE TABLE OTP (
    id_otp INT PRIMARY KEY IDENTITY,
    id_utilisateur INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    code NVARCHAR(6) NOT NULL,
    type NVARCHAR(20), -- 'PHONE_VERIFICATION', 'PASSWORD_RESET'
    expire_a DATETIME NOT NULL,
    utilise BIT DEFAULT 0,
    date_creation DATETIME DEFAULT GETDATE()
);
```

#### Véhicules
```sql
-- Marque
CREATE TABLE Marque (
    id_marque INT PRIMARY KEY IDENTITY,
    nom NVARCHAR(100) NOT NULL,
    pays_origine NVARCHAR(100)
);

-- Modele
CREATE TABLE Modele (
    id_modele INT PRIMARY KEY IDENTITY,
    id_marque INT FOREIGN KEY REFERENCES Marque(id_marque),
    nom NVARCHAR(100) NOT NULL,
    annee_debut INT,
    annee_fin INT,
    type_vehicule NVARCHAR(50) -- 'SUV', 'BERLINE', 'CITADINE'
);

-- Couleur
CREATE TABLE Couleur (
    id_couleur INT PRIMARY KEY IDENTITY,
    nom NVARCHAR(50) NOT NULL,
    code_hex NVARCHAR(7)
);

-- Vehicule
CREATE TABLE Vehicule (
    id_vehicule INT PRIMARY KEY IDENTITY,
    id_utilisateur INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    id_modele INT FOREIGN KEY REFERENCES Modele(id_modele),
    id_couleur INT FOREIGN KEY REFERENCES Couleur(id_couleur),
    immatriculation NVARCHAR(20) UNIQUE NOT NULL,
    annee_fabrication INT,
    numero_chassis NVARCHAR(50),
    kilometrage INT,
    date_achat DATE,
    date_creation DATETIME DEFAULT GETDATE()
);
```

#### Rendez-vous
```sql
-- Agence
CREATE TABLE Agence (
    id_agence INT PRIMARY KEY IDENTITY,
    nom NVARCHAR(100) NOT NULL,
    adresse NVARCHAR(255),
    ville NVARCHAR(100),
    telephone NVARCHAR(20),
    email NVARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    horaire_ouverture TIME,
    horaire_fermeture TIME
);

-- Type_Intervention
CREATE TABLE Type_Intervention (
    id_type_intervention INT PRIMARY KEY IDENTITY,
    nom NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    duree_estimee INT, -- en minutes
    prix_base DECIMAL(10, 2)
);

-- Package
CREATE TABLE Package (
    id_package INT PRIMARY KEY IDENTITY,
    nom NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    prix DECIMAL(10, 2),
    actif BIT DEFAULT 1
);

-- Package_Intervention (relation many-to-many)
CREATE TABLE Package_Intervention (
    id_package INT FOREIGN KEY REFERENCES Package(id_package),
    id_type_intervention INT FOREIGN KEY REFERENCES Type_Intervention(id_type_intervention),
    PRIMARY KEY (id_package, id_type_intervention)
);

-- Statut
CREATE TABLE Statut (
    id_statut INT PRIMARY KEY IDENTITY,
    nom NVARCHAR(50) NOT NULL,
    description NVARCHAR(255),
    couleur NVARCHAR(7), -- code hex
    ordre INT
);

-- Rendez_Vous
CREATE TABLE Rendez_Vous (
    id_rendez_vous INT PRIMARY KEY IDENTITY,
    id_utilisateur INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    id_vehicule INT FOREIGN KEY REFERENCES Vehicule(id_vehicule),
    id_agence INT FOREIGN KEY REFERENCES Agence(id_agence),
    id_statut INT FOREIGN KEY REFERENCES Statut(id_statut),
    date_rendez_vous DATETIME NOT NULL,
    description_probleme NVARCHAR(MAX),
    notes NVARCHAR(MAX),
    date_creation DATETIME DEFAULT GETDATE(),
    date_modification DATETIME,
    cree_par INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    modifie_par INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur)
);

-- Rendez_Vous_Package (interventions sélectionnées)
CREATE TABLE Rendez_Vous_Package (
    id_rendez_vous INT FOREIGN KEY REFERENCES Rendez_Vous(id_rendez_vous),
    id_package INT FOREIGN KEY REFERENCES Package(id_package),
    PRIMARY KEY (id_rendez_vous, id_package)
);

-- Piece_Jointe
CREATE TABLE Piece_Jointe (
    id_piece_jointe INT PRIMARY KEY IDENTITY,
    id_rendez_vous INT FOREIGN KEY REFERENCES Rendez_Vous(id_rendez_vous),
    nom_fichier NVARCHAR(255) NOT NULL,
    chemin_fichier NVARCHAR(500) NOT NULL,
    type_fichier NVARCHAR(50),
    taille_fichier INT,
    date_upload DATETIME DEFAULT GETDATE()
);
```

#### Ordres de Réparation
```sql
-- Commande_Reparation
CREATE TABLE Commande_Reparation (
    id_commande INT PRIMARY KEY IDENTITY,
    id_rendez_vous INT FOREIGN KEY REFERENCES Rendez_Vous(id_rendez_vous),
    id_agent INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    numero_commande NVARCHAR(50) UNIQUE,
    diagnostic NVARCHAR(MAX),
    date_debut DATETIME,
    date_fin DATETIME,
    statut NVARCHAR(50),
    montant_total DECIMAL(10, 2),
    date_creation DATETIME DEFAULT GETDATE()
);

-- Ligne_Commande (pièces détachées)
CREATE TABLE Ligne_Commande (
    id_ligne INT PRIMARY KEY IDENTITY,
    id_commande INT FOREIGN KEY REFERENCES Commande_Reparation(id_commande),
    designation NVARCHAR(255) NOT NULL,
    quantite INT NOT NULL,
    prix_unitaire DECIMAL(10, 2) NOT NULL,
    montant DECIMAL(10, 2) NOT NULL
);
```

#### Facturation
```sql
-- Facture
CREATE TABLE Facture (
    id_facture INT PRIMARY KEY IDENTITY,
    id_commande INT FOREIGN KEY REFERENCES Commande_Reparation(id_commande),
    numero_facture NVARCHAR(50) UNIQUE NOT NULL,
    date_facture DATE NOT NULL,
    montant_ht DECIMAL(10, 2) NOT NULL,
    taux_tva DECIMAL(5, 2) DEFAULT 19.00,
    montant_tva DECIMAL(10, 2) NOT NULL,
    montant_ttc DECIMAL(10, 2) NOT NULL,
    statut_paiement NVARCHAR(50) DEFAULT 'EN_ATTENTE',
    date_paiement DATE,
    date_creation DATETIME DEFAULT GETDATE()
);
```

#### Réclamations
```sql
-- Reclamation
CREATE TABLE Reclamation (
    id_reclamation INT PRIMARY KEY IDENTITY,
    id_utilisateur INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    id_rendez_vous INT FOREIGN KEY REFERENCES Rendez_Vous(id_rendez_vous),
    sujet NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    categorie NVARCHAR(50),
    priorite NVARCHAR(20) DEFAULT 'NORMALE',
    statut NVARCHAR(50) DEFAULT 'OUVERTE',
    date_creation DATETIME DEFAULT GETDATE(),
    date_resolution DATETIME
);

-- Reponse_Reclamation
CREATE TABLE Reponse_Reclamation (
    id_reponse INT PRIMARY KEY IDENTITY,
    id_reclamation INT FOREIGN KEY REFERENCES Reclamation(id_reclamation),
    id_utilisateur INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    message NVARCHAR(MAX) NOT NULL,
    date_reponse DATETIME DEFAULT GETDATE()
);
```

#### Feedback
```sql
-- Feedback
CREATE TABLE Feedback (
    id_feedback INT PRIMARY KEY IDENTITY,
    id_utilisateur INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    id_rendez_vous INT FOREIGN KEY REFERENCES Rendez_Vous(id_rendez_vous),
    note INT CHECK (note BETWEEN 1 AND 5),
    commentaire NVARCHAR(MAX),
    date_creation DATETIME DEFAULT GETDATE()
);
```

#### Audit
```sql
-- Audit_Log
CREATE TABLE Audit_Log (
    id_audit INT PRIMARY KEY IDENTITY,
    id_utilisateur INT FOREIGN KEY REFERENCES Utilisateur(id_utilisateur),
    action NVARCHAR(100) NOT NULL,
    table_name NVARCHAR(100),
    record_id INT,
    anciennes_valeurs NVARCHAR(MAX),
    nouvelles_valeurs NVARCHAR(MAX),
    ip_address NVARCHAR(50),
    user_agent NVARCHAR(500),
    date_action DATETIME DEFAULT GETDATE()
);
```

### 7.3 Migrations

**Fichiers de migration:**
- `seed_chery_tunisia_catalog.sql` - Catalogue modèles Chery
- `fix_facture_revenue_columns.sql` - Corrections colonnes factures
- `add_taux_tva.sql` - Ajout taux TVA
- `add_test_data_for_direction_stats.sql` - Données de test

---

## 8. SÉCURITÉ {#sécurité}

### 8.1 Authentification

#### JWT (JSON Web Tokens)
```javascript
// Génération token
const token = jwt.sign(
  { 
    id: user.id_utilisateur,
    email: user.email,
    role: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Configuration:**
- Secret: Variable d'environnement
- Expiration: 24 heures
- Algorithme: HS256
- Payload: id, email, role

#### Hachage Mots de Passe
```javascript
// Bcrypt avec 10 rounds
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
```

### 8.2 Protection des Routes

#### Middleware d'authentification
```javascript
// authMiddleware.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};
```

#### Middleware de rôles
```javascript
// roleMiddleware.js
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé' });
    }
    next();
  };
};
```

### 8.3 Sécurité HTTP

#### Helmet.js
```javascript
app.use(helmet());
```

**Protections:**
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME sniffing
- DNS prefetch control
- Content Security Policy

#### CORS
```javascript
const corsOptions = {
  origin: ['http://localhost:3001', process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
```

### 8.4 Rate Limiting

#### Limitation globale
```javascript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requêtes max
  message: 'Trop de requêtes, réessayez dans 15 minutes'
});
app.use('/api', apiLimiter);
```

#### Limitation authentification
```javascript
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 tentatives max
  message: 'Trop de tentatives de connexion'
});
app.use('/api/users/login', authLimiter);
```

### 8.5 Validation des Données

#### Backend (Express)
```javascript
// Validation immatriculation
const validatePlate = (plate) => {
  const regex = /^\d{3}\s*تونس\s*\d{4}$/;
  return regex.test(plate);
};
```

#### Frontend (Zod)
```typescript
import { z } from 'zod';

const vehicleSchema = z.object({
  modele: z.string().min(1, 'Modèle requis'),
  immatriculation: z.string().regex(
    /^\d{3}\s*تونس\s*\d{4}$/,
    'Format invalide: 123 تونس 4567'
  ),
  annee: z.number().min(2000).max(new Date().getFullYear())
});
```

### 8.6 Audit et Logs

#### Middleware d'audit
```javascript
const auditMiddleware = (req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    // Log action
    logAudit({
      userId: req.user?.id,
      action: `${req.method} ${req.path}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date()
    });
    originalSend.call(this, data);
  };
  next();
};
```

### 8.7 Gestion des Fichiers

#### Upload sécurisé (Multer)
```javascript
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36)}`;
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const isValid = allowedTypes.test(file.mimetype);
    cb(null, isValid);
  }
});
```

---

## 9. TESTS {#tests}

### 9.1 Tests Backend

#### Framework: Jest

**Configuration (jest.config.js):**
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js'
  ],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/unit/**/*.test.js']
    },
    {
      displayName: 'integration',
      testMatch: ['**/tests/integration/**/*.test.js']
    }
  ]
};
```

**Scripts:**
```json
{
  "test": "jest",
  "test:unit": "jest --selectProjects unit",
  "test:integration": "jest --selectProjects integration",
  "test:coverage": "jest --coverage",
  "test:watch": "jest --watch"
}
```

#### Tests Unitaires
```javascript
// tests/unit/plateValidation.test.js
describe('Validation immatriculation', () => {
  test('Format valide accepté', () => {
    expect(validatePlate('123 تونس 4567')).toBe(true);
  });
  
  test('Format invalide rejeté', () => {
    expect(validatePlate('123456')).toBe(false);
  });
});
```

### 9.2 Tests Frontend

#### Framework: Playwright

**Configuration (playwright.config.ts):**
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
```

**Tests E2E:**
```typescript
// tests/e2e/auth.spec.ts
test('Login avec credentials valides', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/client/dashboard');
});
```

**Scripts:**
```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug"
}
```

---

## 10. DÉPLOIEMENT {#déploiement}

### 10.1 Variables d'Environnement

#### Backend (.env)
```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_SERVER=localhost
DB_NAME=STA_SAV_DB
DB_USER=sa
DB_PASSWORD=your_password
DB_PORT=1433

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# WhatsApp
WHATSAPP_ENABLED=true

# Frontend URL
FRONTEND_URL=http://localhost:3001
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=STA Chery SAV
```

### 10.2 CI/CD Pipeline

#### GitHub Actions (.github/workflows/ci.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd backend && npm ci
      - name: Run tests
        run: cd backend && npm test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run E2E tests
        run: cd frontend && npx playwright install && npm run test:e2e:ci
```

### 10.3 Build Production

#### Backend
```bash
# Installation
cd backend
npm install --production

# Démarrage
npm start
```

#### Frontend
```bash
# Build
cd frontend
npm run build

# Démarrage
npm start
```

### 10.4 Docker (Optionnel)

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - database
  
  frontend:
    build: ./frontend
    ports:
      - "3001:3001"
    depends_on:
      - backend
  
  database:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
    ports:
      - "1433:1433"
```

---

## 📊 RÉSUMÉ DU PROJET

### Statistiques
- **Lignes de code:** ~50,000+
- **Fichiers:** 300+
- **Composants React:** 80+
- **Endpoints API:** 150+
- **Tables DB:** 30+
- **Tests:** 50+

### Technologies clés
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, SQL Server
- **Sécurité:** JWT, Bcrypt, Helmet, Rate Limiting
- **Tests:** Jest, Playwright
- **CI/CD:** GitHub Actions

### Fonctionnalités principales
✅ Authentification multi-rôles  
✅ Gestion véhicules  
✅ Prise de rendez-vous (3 étapes)  
✅ Ordres de réparation  
✅ Facturation automatique  
✅ Réclamations  
✅ Chatbot IA  
✅ Notifications WhatsApp/Email  
✅ Dashboards multi-rôles  
✅ Rapports et statistiques  
✅ Audit complet  

---

**Date de création:** 2024-2026  
**Auteur:** Équipe STA Chery Tunisia  
**Version:** 1.0.0
