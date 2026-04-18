# Guide de Test - Vérification Téléphonique

## 🧪 Tests à Effectuer

### Prérequis
1. ✅ Backend démarré (`npm start` dans `/backend`)
2. ✅ Frontend démarré (`npm run dev` dans `/frontend`)
3. ✅ Base de données SQL Server accessible
4. ✅ WhatsApp Web configuré (QR code scanné)

### Test 1: Inscription Nouveau Client

1. **Aller sur** `http://localhost:3001/register`
2. **Remplir le formulaire** avec :
   - Prénom: Test
   - Nom: Client
   - Email: test.client@example.com
   - Téléphone: +21612345678 (format international)
   - Mot de passe: password123
3. **Cliquer** "S'inscrire"
4. **Vérifier** :
   - ✅ Redirection vers `/registration-success`
   - ✅ Message de succès affiché
   - ✅ Code OTP envoyé par WhatsApp (vérifier les logs backend)

### Test 2: Vérification Téléphonique

1. **Sur la page** `/registration-success`
2. **Cliquer** "Vérifier mon téléphone"
3. **Redirection** vers `/verify-phone`
4. **Entrer le code OTP** (6 chiffres depuis WhatsApp ou logs backend)
5. **Cliquer** "Vérifier le code"
6. **Vérifier** :
   - ✅ Message de succès
   - ✅ Redirection vers `/login?phone_verified=true`
   - ✅ Message de confirmation sur la page de connexion

### Test 3: Connexion Client Vérifié

1. **Sur la page** `/login`
2. **Se connecter** avec les identifiants du test 1
3. **Vérifier** :
   - ✅ Connexion réussie
   - ✅ Redirection vers `/client/dashboard`
   - ✅ Pas de bannière de vérification téléphonique
   - ✅ Accès complet aux fonctionnalités

### Test 4: Client Non Vérifié (Simulation)

Pour tester un client non vérifié, vous pouvez :

1. **Créer un client** via l'API directement :
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "prenom": "Client",
    "nom": "NonVerifie",
    "email": "nonverifie@example.com",
    "telephone": "+21687654321",
    "password": "password123",
    "role": "CLIENT"
  }'
```

2. **Marquer comme non vérifié** en base :
```sql
UPDATE Utilisateur 
SET telephone_verifie = 0 
WHERE email = 'nonverifie@example.com'
```

3. **Se connecter** avec ce compte
4. **Vérifier** :
   - ✅ Redirection automatique vers `/verify-phone`
   - ✅ Impossible d'accéder au dashboard sans vérification

### Test 5: Protection des Fonctionnalités

1. **Se connecter** avec un client non vérifié
2. **Essayer d'accéder** à :
   - `/client/rendez-vous`
   - `/client/orders`
3. **Vérifier** :
   - ✅ Composant de protection affiché
   - ✅ Bouton "Vérifier mon téléphone"
   - ✅ Accès bloqué au contenu

### Test 6: Renvoi de Code OTP

1. **Sur la page** `/verify-phone`
2. **Cliquer** "Renvoyer le code"
3. **Vérifier** :
   - ✅ Nouveau code généré (logs backend)
   - ✅ Message de confirmation
   - ✅ Nouveau code envoyé par WhatsApp

### Test 7: Gestion des Erreurs

1. **Entrer un code incorrect** sur `/verify-phone`
2. **Vérifier** :
   - ✅ Message d'erreur affiché
   - ✅ Possibilité de réessayer

3. **Attendre l'expiration** (10 minutes)
4. **Essayer un ancien code**
5. **Vérifier** :
   - ✅ Message "Code expiré"
   - ✅ Possibilité de renvoyer un nouveau code

## 🔍 Points de Vérification

### Backend
- [ ] Route `/api/users/resend-verification` fonctionne
- [ ] Route `/api/users/verify-phone` fonctionne
- [ ] Codes OTP générés et stockés correctement
- [ ] Messages WhatsApp envoyés
- [ ] Token JWT contient `telephone_verifie`

### Frontend
- [ ] Page `/verify-phone` accessible
- [ ] Page `/registration-success` accessible
- [ ] Middleware redirige correctement
- [ ] Composants de protection fonctionnent
- [ ] Messages d'erreur/succès affichés

### Base de Données
- [ ] Colonne `telephone_verifie` existe
- [ ] Valeurs mises à jour correctement
- [ ] Utilisateurs existants ont `telephone_verifie = 0`

## 🐛 Dépannage

### Problème: Boucle de Redirection
**Symptôme**: Redirection infinie entre `/client/dashboard` et `/verify-phone`
**Cause**: Token JWT ne contient pas `telephone_verifie`
**Solution**: Se reconnecter pour obtenir un nouveau token

### Problème: Code OTP Non Reçu
**Symptôme**: Aucun message WhatsApp reçu
**Cause**: WhatsApp Web non configuré
**Solution**: Vérifier les logs backend, scanner le QR code

### Problème: Erreur Base de Données
**Symptôme**: Erreur de connexion SQL
**Cause**: Base de données non démarrée ou configuration incorrecte
**Solution**: Vérifier le fichier `.env` et démarrer SQL Server

### Problème: Page Blanche
**Symptôme**: Page `/verify-phone` ne se charge pas
**Cause**: Erreur JavaScript ou composant manquant
**Solution**: Vérifier la console du navigateur

## 📊 Logs à Surveiller

### Backend
```
OTP généré: 123456 pour test@example.com
WhatsApp message sent to +21612345678
Téléphone vérifié pour utilisateur ID: 123
Token JWT généré avec telephone_verifie: true
```

### Frontend
```
Middleware: Client phone not verified, redirecting to verification
AuthContext: Login response received
Middleware: Access granted
```

## ✅ Critères de Réussite

Le système est considéré comme fonctionnel si :

1. ✅ **Nouveaux clients** doivent vérifier leur téléphone
2. ✅ **Clients existants** sont redirigés vers la vérification
3. ✅ **Codes OTP** sont envoyés et validés correctement
4. ✅ **Fonctionnalités sensibles** sont protégées
5. ✅ **Expérience utilisateur** est fluide et intuitive
6. ✅ **Messages d'erreur** sont clairs et utiles
7. ✅ **Sécurité** est maintenue (expiration, validation)

## 🚀 Déploiement

Une fois tous les tests validés :

1. **Exécuter la migration** SQL en production
2. **Mettre à jour** les utilisateurs existants
3. **Déployer** le code backend et frontend
4. **Configurer** WhatsApp Web en production
5. **Tester** avec quelques comptes réels
6. **Monitorer** les logs et métriques