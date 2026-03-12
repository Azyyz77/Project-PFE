# STA Chery Tunisia - Frontend Auth Service

Application frontend Next.js 16 avec TypeScript pour le service d'authentification.

## 🚀 Fonctionnalités

- ✅ **Inscription utilisateur** avec validation des formulaires
- ✅ **Connexion sécurisée** avec JWT tokens
- ✅ **Dashboard utilisateur** avec informations du profil
- ✅ **Gestion des sessions** avec localStorage
- ✅ **Routes protégées** avec AuthContext
- ✅ **Multi-rôles** (Client, Admin, Agent SAV, Responsable Atelier)
- ✅ **Interface responsive** avec Tailwind CSS
- ✅ **TypeScript** pour la sécurité des types

## 📁 Structure du projet

```
frontend/
├── app/
│   ├── page.tsx                 # Page d'accueil / Landing page
│   ├── layout.tsx               # Layout principal avec AuthProvider
│   ├── globals.css              # Styles globaux
│   ├── login/
│   │   └── page.tsx            # Page de connexion
│   ├── register/
│   │   └── page.tsx            # Page d'inscription
│   └── dashboard/
│       └── page.tsx            # Dashboard utilisateur (protégé)
├── components/
│   └── ProtectedRoute.tsx      # Composant pour protéger les routes
├── contexts/
│   └── AuthContext.tsx         # Context d'authentification global
├── lib/
│   └── api/
│       └── auth.ts             # Service API pour les requêtes auth
├── types/
│   └── auth.ts                 # Types TypeScript pour l'auth
└── .env.local                  # Configuration de l'API

```

## 🛠️ Installation

1. Installer les dépendances :
```bash
npm install
```bash
npm install
```

2. Configurer les variables d'environnement (déjà configuré dans `.env.local`) :
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. S'assurer que le backend auth-service est démarré sur le port 3001

## 🚀 Démarrage

Démarrer le serveur de développement :

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## 📖 Pages disponibles

- **/** - Page d'accueil avec présentation du service
- **/login** - Page de connexion
- **/register** - Page d'inscription
- **/dashboard** - Dashboard utilisateur (nécessite authentification)

## 🔐 Authentification

### Flux d'authentification

1. **Inscription** → L'utilisateur crée un compte sur `/register`
2. **Redirection** → Après inscription, redirection vers `/login`
3. **Connexion** → L'utilisateur se connecte avec email/mot de passe
4. **Token JWT** → Le backend retourne un token stocké dans localStorage
5. **Dashboard** → Redirection vers le dashboard avec les infos utilisateur

### AuthContext

Le contexte d'authentification fournit :
- `user` : Informations de l'utilisateur connecté
- `token` : Token JWT
- `isLoading` : État de chargement
- `isAuthenticated` : Booléen indiquant si l'utilisateur est connecté
- `login(data)` : Fonction de connexion
- `register(data)` : Fonction d'inscription
- `logout()` : Fonction de déconnexion

### Utilisation dans un composant

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Veuillez vous connecter</div>;
  }

  return (
    <div>
      <p>Bienvenue {user?.first_name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Routes protégées

Utiliser le composant `ProtectedRoute` pour protéger les pages :

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PrivatePage() {
  return (
    <ProtectedRoute>
      <div>Contenu privé</div>
    </ProtectedRoute>
  );
}
```

## 🎨 Technologies utilisées

- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS 4** - Framework CSS utility-first
- **React 19** - Bibliothèque UI
- **JWT** - Authentification par tokens

## 📦 Scripts disponibles

```bash
npm run dev      # Démarrer en mode développement
npm run build    # Build de production
npm start        # Démarrer le serveur de production
npm run lint     # Linter le code
```

## 🔗 API Backend

Le frontend communique avec l'API backend sur `http://localhost:3001`

### Endpoints utilisés

- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/users/:id` - Récupérer un utilisateur (avec JWT)

## 📝 Types TypeScript

Les types sont définis dans `types/auth.ts` :
- `User` - Informations utilisateur
- `UserRole` - Rôles disponibles
- `LoginData` - Données de connexion
- `RegisterData` - Données d'inscription
- `AuthResponse` - Réponse de connexion
- `AuthContextType` - Type du contexte

## 🎨 Design

- Design moderne avec dégradés
- Interface responsive (mobile-first)
- Animations et transitions fluides
- Loading states et gestion d'erreurs
- Feedback visuel pour les actions utilisateur

## 🔒 Sécurité

- Tokens JWT stockés dans localStorage
- Validation des formulaires côté client
- Gestion des erreurs API
- Routes protégées avec redirection automatique
- Nettoyage des données sensibles

## 📱 Responsive

L'application est entièrement responsive et optimisée pour :
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## Learn More

Pour en savoir plus sur Next.js :

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy on Vercel

Le moyen le plus simple de déployer votre application Next.js est d'utiliser la [plateforme Vercel](https://vercel.com/new).

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.
