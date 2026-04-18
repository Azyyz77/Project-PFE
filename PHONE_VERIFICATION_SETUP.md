# Configuration de la Vérification Téléphonique

## Vue d'ensemble

Le système de vérification téléphonique a été implémenté pour sécuriser l'accès des clients aux fonctionnalités sensibles comme la prise de rendez-vous et les commandes. Les clients doivent vérifier leur numéro de téléphone via un code OTP envoyé par WhatsApp.

## Installation et Configuration

### 1. Migration de la Base de Données

Exécutez la migration SQL pour ajouter la colonne `telephone_verifie` :

```sql
-- Fichier: backend/migrations/add_telephone_verification.sql
-- Exécuter dans SQL Server Management Studio ou via sqlcmd
```

### 2. Mise à Jour des Utilisateurs Existants

Exécutez le script pour mettre à jour les utilisateurs existants :

```bash
cd backend
node scripts/updateExistingUsers.js
```

### 3. Vérification de l'Installation

Vérifiez que tout est correctement configuré :

```bash
cd backend
node scripts/checkPhoneVerification.js
```

## Fonctionnement

### Flux pour Nouveaux Utilisateurs

1. **Inscription** (`/register`)
   - L'utilisateur s'inscrit avec ses informations
   - Un code OTP est généré et envoyé par WhatsApp
   - `telephone_verifie = false` par défaut
   - Redirection vers `/registration-success`

2. **Page de Succès** (`/registration-success`)
   - Affiche les instructions de vérification
   - Permet de renvoyer le code si nécessaire
   - Lien vers la page de vérification

3. **Vérification** (`/verify-phone`)
   - Interface pour saisir le code OTP à 6 chiffres
   - Validation du code via l'API
   - Mise à jour de `telephone_verifie = true`
   - Redirection vers le dashboard

### Flux pour Utilisateurs Existants

1. **Connexion** (`/login`)
   - L'utilisateur se connecte normalement
   - Le middleware vérifie le statut `telephone_verifie`
   - Si `false`, redirection automatique vers `/verify-phone`

2. **Protection des Fonctionnalités**
   - Bannière d'avertissement dans le layout client
   - Composant `PhoneVerificationRequired` bloque l'accès
   - Pages protégées : rendez-vous, commandes, etc.

## API Endpoints

### Backend Routes

```javascript
// Renvoyer un code de vérification
POST /api/users/resend-verification
Body: { "email": "user@example.com" }

// Vérifier le code OTP
POST /api/users/verify-phone
Body: { "email": "user@example.com", "otp": "123456" }
```

### Frontend Routes

```
/verify-phone          - Page de vérification téléphonique
/registration-success  - Page de succès d'inscription
/test-phone           - Page de test (développement uniquement)
```

## Composants Frontend

### 1. PhoneVerificationBanner
Bannière d'avertissement affichée dans le layout client pour les utilisateurs non vérifiés.

```tsx
import { PhoneVerificationBanner } from '@/components/PhoneVerificationBanner';

// Dans le layout client
<PhoneVerificationBanner />
```

### 2. PhoneVerificationRequired
Composant de protection qui bloque l'accès aux fonctionnalités sensibles.

```tsx
import { PhoneVerificationRequired } from '@/components/PhoneVerificationRequired';

// Envelopper les composants sensibles
<PhoneVerificationRequired message="Message personnalisé">
  <SensitiveComponent />
</PhoneVerificationRequired>
```

### 3. Pages de Vérification
- `/verify-phone` - Interface principale de vérification
- `/registration-success` - Page post-inscription

## Configuration du Middleware

Le middleware Next.js gère automatiquement les redirections :

```typescript
// frontend/middleware.ts
// Redirection automatique des clients non vérifiés vers /verify-phone
```

## Tests et Développement

### Page de Test

Accédez à `/test-phone` pour tester le système en développement :
- Interface de test pour renvoyer des codes
- Vérification des codes OTP
- Affichage du statut de vérification

### Scripts de Diagnostic

```bash
# Vérifier l'état de la base de données
node backend/scripts/checkPhoneVerification.js

# Mettre à jour les utilisateurs existants
node backend/scripts/updateExistingUsers.js
```

### Tests API avec curl

```bash
# Test d'inscription
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "Test",
    "nom": "User",
    "email": "test@example.com",
    "telephone": "+21612345678",
    "password": "password123",
    "role": "CLIENT"
  }'

# Test de renvoi de code
curl -X POST http://localhost:3000/api/users/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Test de vérification
curl -X POST http://localhost:3000/api/users/verify-phone \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

## Sécurité

### Mesures Implémentées

- ✅ Codes OTP expirés après 10 minutes
- ✅ Stockage temporaire en mémoire (pas en base)
- ✅ Validation des formats de téléphone E.164
- ✅ Middleware de redirection automatique
- ✅ Protection des routes sensibles

### Recommandations de Production

1. **Persistance des OTP** - Utiliser Redis au lieu de la mémoire
2. **Limitation des tentatives** - Bloquer après X tentatives échouées
3. **Monitoring** - Logger les tentatives de vérification
4. **SMS de secours** - Alternative si WhatsApp échoue
5. **Audit trail** - Traçabilité des vérifications

## Dépannage

### Problèmes Courants

1. **Colonne manquante**
   ```
   Erreur: Invalid column name 'telephone_verifie'
   Solution: Exécuter la migration SQL
   ```

2. **WhatsApp non configuré**
   ```
   Erreur: QR code not scanned
   Solution: Scanner le QR code dans les logs backend
   ```

3. **Redirection infinie**
   ```
   Problème: Boucle entre /login et /verify-phone
   Solution: Vérifier que le token JWT inclut telephone_verifie
   ```

### Logs de Debug

Activez les logs détaillés dans le backend :

```javascript
// Dans userController.js
console.log('OTP généré:', otp, 'pour', email);
console.log('Vérification:', { email, otp, stored });
```

## Migration depuis l'Ancien Système

Si vous migrez depuis un système existant :

1. Exécutez la migration SQL
2. Lancez le script de mise à jour des utilisateurs
3. Testez avec quelques comptes clients
4. Déployez progressivement

## Support

Pour toute question ou problème :
1. Vérifiez les logs backend et frontend
2. Utilisez la page `/test-phone` pour diagnostiquer
3. Exécutez les scripts de diagnostic
4. Consultez la documentation API