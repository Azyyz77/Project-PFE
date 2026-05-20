# DOCUMENTATION COMPLÈTE - PLATEFORME SAV CHERY TUNISIA

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble du projet](#vue-densemble)
2. [Architecture technique](#architecture)
3. [Structure du projet](#structure)
4. [Technologies et dépendances](#technologies)
5. [Fonctionnalités par module](#fonctionnalités)
6. [Dashboards et interfaces](#dashboards)
7. [Base de données](#base-de-données)
8. [Sécurité](#sécurité)
9. [Tests](#tests)
10. [Déploiement](#déploiement)

---

## 1. VUE D'ENSEMBLE DU PROJET {#vue-densemble}

### 1.1 Contexte
**Plateforme de Service Après-Vente (SAV) pour Chery Tunisia - STA**

Le projet est une plateforme web complète de gestion du service après-vente pour les véhicules Chery en Tunisie, développée pour la Société Tunisienne d'Automobiles (STA).

### 1.2 Objectifs
- Digitaliser la prise de rendez-vous SAV
- Centraliser la gestion des véhicules clients
- Automatiser le suivi des interventions
- Améliorer l'expérience client
- Optimiser la gestion des ateliers
- Fournir des statistiques et rapports en temps réel

### 1.3 Utilisateurs cibles
1. **Clients** - Propriétaires de véhicules Chery
2. **Agents SAV** - Personnel technique des ateliers
3. **Administrateurs** - Gestionnaires de la plateforme
4. **Direction** - Décideurs et analystes

### 1.4 Portée du projet
- **Frontend Web** - Application Next.js responsive
- **Backend API** - Serveur Node.js/Express monolithique
- **Mobile** - Application React Native (en développement)
- **Base de données** - SQL Server
- **Intégrations** - WhatsApp, Email, AI Assistant

---

## 2. ARCHITECTURE TECHNIQUE {#architecture}

### 2.1 Architecture globale

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTS (Navigateurs)                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Next.js 16.1.3)                       │
│  - Pages: Landing, Auth, Dashboards                          │
│  - Port: 3001                                                │
│  - SSR + Client-side rendering                               │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js/Express)                       │
│  - API REST monolithique                                     │
│  - Port: 3000                                                │
│  - 38+ Controllers                                           │
│  - Middleware: Auth, Audit, Rate Limiting                    │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  SQL Server  │ │ WhatsApp │ │ Email (SMTP) │
│  STA_SAV_DB  │ │   Web    │ │  Nodemailer  │
└──────────────┘ └──────────┘ └──────────────┘
```

### 2.2 Pattern architectural
- **Monolithe modulaire** - Backend organisé en modules fonctionnels
- **MVC** - Séparation Controllers/Services/Routes
- **API REST** - Communication stateless
- **JWT** - Authentification par tokens
- **Role-Based Access Control (RBAC)** - Gestion des permissions

### 2.3 Technologies principales

#### Frontend
- **Framework**: Next.js 16.1.3 (React 19.2.3)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui, Radix UI, Lucide Icons
- **State Management**: React Context API
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Animations**: Framer Motion

#### Backend
- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **Language**: JavaScript (CommonJS)
- **Database**: SQL Server (mssql 9.3.2)
- **Authentication**: JWT (jsonwebtoken 9.0.0)
- **Security**: Helmet, bcrypt, express-rate-limit
- **Documentation**: Swagger (swagger-ui-express)
- **File Upload**: Multer
- **Scheduling**: node-cron
- **Email**: Nodemailer
- **WhatsApp**: whatsapp-web.js
- **PDF Generation**: PDFKit
- **Excel**: ExcelJS

---

## 3. STRUCTURE DU PROJET {#structure}

### 3.1 Structure racine

```
projetPFE/
├── backend/              # Serveur API Node.js
├── frontend/             # Application Next.js
├── mobile/              # Application React Native
├── .github/             # CI/CD workflows
├── .gitignore
└── README.md
```

### 3.2 Structure Backend

```
backend/
├── config/
│   ├── database.js              # Configuration SQL Server
│   ├── swagger.js               # Documentation API
│   └── ensureVehicleValidationSchema.js
├── controllers/                 # 38 contrôleurs
│   ├── userController.js        # Gestion utilisateurs
│   ├── vehicleController.js     # Gestion véhicules
│   ├── appointmentController.js # Rendez-vous
│   ├── agentDashboardController.js
│   ├── clientDashboardController.js
│   ├── adminUserController.js
│   ├── complaintController.js
│   ├── aiAssistantController.js
│   ├── repairOrderController.js
│   ├── invoiceController.js
│   └── ... (29 autres)
├── middleware/
│   ├── authMiddleware.js        # Vérification JWT
│   ├── auditMiddleware.js       # Logs d'audit
│   └── roleMiddleware.js        # Contrôle d'accès
├── routes/                      # Routes API
│   ├── userRoutes.js
│   ├── vehicleRoutes.js
│   ├── appointmentRoutes.js
│   └── ... (35+ fichiers)
├── services/
│   ├── emailService.js          # Envoi emails
│   ├── whatsappClient.js        # WhatsApp Web
│   ├── reminderService.js       # Rappels automatiques
│   └── agentDashboardService.js
├── migrations/                  # Scripts SQL
│   ├── seed_chery_tunisia_catalog.sql
│   ├── fix_facture_revenue_columns.sql
│   └── ... (20+ migrations)
├── tests/
│   ├── unit/                    # Tests unitaires
│   └── integration/             # Tests d'intégration
├── uploads/                     # Fichiers uploadés
├── .env                         # Variables d'environnement
├── .env.example
├── server.js                    # Point d'entrée
├── package.json
└── jest.config.js
```

### 3.3 Structure Frontend

```
frontend/
├── app/                         # Pages Next.js (App Router)
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Layout racine
│   ├── globals.css              # Styles globaux
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── client/                  # Espace client
│   │   ├── layout.tsx           # Sidebar client
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── rendez-vous/
│   │   ├── repair-orders/
│   │   ├── invoices/
│   │   ├── complaints/
│   │   ├── chatbot/
│   │   ├── documents/
│   │   ├── feedback/
│   │   ├── profile/
│   │   └── ... (10+ pages)
│   └── dashboard/               # Espaces admin/agent
│       ├── admin/
│       │   ├── layout.tsx
│       │   ├── users/
│       │   ├── vehicles/
│       │   ├── orders/
│       │   ├── reports/
│       │   ├── permissions/
│       │   ├── moderation/
│       │   └── ... (20+ pages)
│       ├── agent/
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── clients/
│       └── direction/
│           └── page.tsx
├── components/
│   ├── ui/                      # Composants Shadcn
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ... (30+ composants)
│   ├── client/                  # Composants client
│   │   ├── ClientButton.tsx
│   │   ├── ClientCard.tsx
│   │   └── ... (8 composants)
│   ├── agent-dashboard/
│   │   ├── AppointmentsList.tsx
│   │   ├── ComplaintsManagement.tsx
│   │   └── ... (5 composants)
│   ├── auth/
│   │   └── AuthThemeShell.tsx
│   └── ... (20+ composants)
├── contexts/
│   ├── AuthContext.tsx          # Authentification
│   └── LanguageContext.tsx      # Internationalisation
├── lib/
│   ├── api/                     # Clients API
│   │   ├── axios.ts
│   │   ├── auth.ts
│   │   ├── vehicles.ts
│   │   ├── appointments.ts
│   │   └── ... (15+ fichiers)
│   ├── auth-utils.ts
│   └── vehicle-utils.ts
├── config/
│   ├── clientTheme.ts
│   └── agentTheme.ts
├── public/
│   ├── chery-logo-clean.png
│   ├── logo-sta.png
│   └── videos/
├── tests/
│   └── e2e/                     # Tests Playwright
│       ├── auth.spec.ts
│       ├── vehicles.spec.ts
│       └── ... (5 tests)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

