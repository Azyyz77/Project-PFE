# Guide de Démarrage des Serveurs

## 🚀 Démarrage Rapide

### Méthode 1: Scripts Batch (Windows)

#### 1. Démarrer le Backend
```bash
# Double-cliquez sur START_BACKEND.bat
# OU exécutez dans le terminal:
START_BACKEND.bat
```

#### 2. Démarrer le Frontend (dans un nouveau terminal)
```bash
# Double-cliquez sur START_FRONTEND.bat
# OU exécutez dans le terminal:
START_FRONTEND.bat
```

### Méthode 2: Commandes Manuelles

#### Terminal 1 - Backend
```bash
cd backend
npm start
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## ✅ Vérification

### 1. Backend (Port 3000)
Ouvrez: http://localhost:3000

Vous devriez voir:
```json
{
  "service": "Backend Monolithique - STA Chery Tunisia",
  "version": "1.0.0",
  "status": "UP"
}
```

### 2. Frontend (Port 3001)
Ouvrez: http://localhost:3001

Vous devriez voir la page de connexion.

### 3. Chatbot API
Testez l'API du chatbot:
```bash
curl -X POST http://localhost:3000/api/chatbot/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\": \"Bonjour\"}"
```

Réponse attendue:
```json
{
  "reply": "Bonjour ! Je suis l'assistant SAV de Chery Tunisie...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🐛 Dépannage

### Problème: "Port 3000 already in use"

**Solution:**
```bash
# Trouver le processus
netstat -ano | findstr :3000

# Tuer le processus (remplacez PID par le numéro trouvé)
taskkill /PID <PID> /F
```

### Problème: "Port 3001 already in use"

**Solution:**
```bash
# Trouver le processus
netstat -ano | findstr :3001

# Tuer le processus
taskkill /PID <PID> /F
```

### Problème: "Failed to fetch" dans le chatbot

**Causes possibles:**
1. Backend n'est pas démarré
2. Backend est sur un port différent
3. Problème de CORS

**Solutions:**
1. Vérifiez que le backend est démarré: http://localhost:3000
2. Vérifiez les logs du backend pour les erreurs
3. Vérifiez que `NEXT_PUBLIC_API_URL` est correct dans `.env`

### Problème: "Groq API key invalid"

**Solution:**
1. Vérifiez que `GROQ_API_KEY` est dans `backend/.env`
2. Vérifiez que la clé commence par `gsk_`
3. Testez avec le script: `node backend/scripts/testGroqAI.js`

---

## 📋 Checklist de Démarrage

### Avant de démarrer:
- [ ] Node.js est installé (v18+)
- [ ] npm est installé
- [ ] SQL Server est démarré
- [ ] Base de données `STA_SAV_DB` existe
- [ ] Fichiers `.env` sont configurés

### Backend:
- [ ] `backend/.env` existe
- [ ] `GROQ_API_KEY` est configuré
- [ ] `DB_SERVER`, `DB_USER`, `DB_PASSWORD` sont corrects
- [ ] Port 3000 est disponible

### Frontend:
- [ ] `frontend/.env.local` existe (optionnel)
- [ ] Port 3001 est disponible

---

## 🔧 Configuration

### Backend (.env)
```env
# Serveur
PORT=3000

# Base de données
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=STA_SAV_DB
DB_USER=dali
DB_PASSWORD=Daligh2004

# Groq AI
GROQ_API_KEY=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
GROQ_MODEL=llama-3.3-70b-versatile

# JWT
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=24h
```

### Frontend (.env.local - optionnel)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 🧪 Tests

### 1. Test Backend
```bash
# Health check
curl http://localhost:3000/health

# Chatbot status
curl http://localhost:3000/api/chatbot/status

# Send message
curl -X POST http://localhost:3000/api/chatbot/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\": \"test\"}"
```

### 2. Test Frontend
1. Ouvrez http://localhost:3001
2. Naviguez vers /client/chatbot
3. Envoyez un message
4. Vérifiez la réponse (devrait arriver en 1-5 secondes)

### 3. Test Automatisé
1. Ouvrez http://localhost:3001/test-chatbot
2. Cliquez sur "Lancer les tests"
3. Attendez les résultats
4. Tous les tests devraient passer ✅

---

## 📊 Logs

### Backend Logs
Les logs apparaissent dans le terminal où vous avez démarré le backend:
```
🚀 Serveur monolithique démarré sur le port 3000
📍 http://localhost:3000
[AI Assistant] Initialized with: { provider: 'Groq', model: 'llama-3.3-70b-versatile' }
📨 Chatbot request: { message: 'Bonjour...', historyLength: 0 }
✅ Chatbot response received
```

### Frontend Logs
Les logs apparaissent dans:
1. Terminal (build logs)
2. Console du navigateur (runtime logs)

Ouvrez la console (F12) pour voir:
```
[axios.post] Request: { url: 'http://localhost:3000/api/chatbot/chat', hasToken: false }
[axios.post] Response: { status: 200, ok: true }
[axios.post] Success: { dataKeys: ['reply', 'timestamp'] }
```

---

## 🚦 Ordre de Démarrage

### Recommandé:
1. **SQL Server** (doit être déjà démarré)
2. **Backend** (port 3000)
3. **Frontend** (port 3001)

### Important:
- Le frontend a besoin du backend pour fonctionner
- Le backend a besoin de SQL Server pour fonctionner
- Le chatbot a besoin de Groq API (internet requis)

---

## 🔄 Redémarrage

### Quand redémarrer le backend:
- Après modification de `.env`
- Après modification du code backend
- Après modification des routes
- Si le chatbot ne répond plus

### Quand redémarrer le frontend:
- Après modification de `.env.local`
- Après modification du code frontend
- Si la page ne se charge plus
- Si les changements ne sont pas visibles

### Comment redémarrer:
1. Appuyez sur `Ctrl+C` dans le terminal
2. Relancez la commande `npm start` ou `npm run dev`

---

## 📞 Support

### Problèmes courants:

| Problème | Solution |
|----------|----------|
| Backend ne démarre pas | Vérifiez SQL Server, vérifiez `.env` |
| Frontend ne démarre pas | Vérifiez port 3001, supprimez `.next` |
| Chatbot ne répond pas | Vérifiez backend, vérifiez Groq API key |
| Erreur de connexion DB | Vérifiez SQL Server, vérifiez credentials |
| "Failed to fetch" | Vérifiez que backend est démarré |

### Commandes utiles:

```bash
# Voir les processus Node.js
tasklist | findstr node

# Tuer tous les processus Node.js
taskkill /F /IM node.exe

# Nettoyer le cache npm
npm cache clean --force

# Réinstaller les dépendances
cd backend && npm install
cd frontend && npm install

# Nettoyer le build Next.js
cd frontend && rmdir /s /q .next
```

---

## ✅ Tout fonctionne!

Si vous voyez:
- ✅ Backend démarré sur port 3000
- ✅ Frontend démarré sur port 3001
- ✅ Chatbot répond en 1-5 secondes
- ✅ Pas d'erreurs dans les logs

**Félicitations! Votre système est opérationnel! 🎉**

---

**Dernière mise à jour:** Janvier 2025  
**Version:** 2.0.0
