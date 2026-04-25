# 🚀 Quick Start - Chatbot Fix

## ⚠️ IMPORTANT: Start Backend First!

The chatbot needs the backend server to be running.

---

## Step 1: Start Backend Server

Open a **NEW terminal** and run:

```bash
cd backend
npm start
```

**Wait for this message:**
```
🚀 Serveur monolithique démarré sur le port 3000
📍 http://localhost:3000
[AI Assistant] Initialized with: { provider: 'Groq', model: 'llama-3.3-70b-versatile' }
```

---

## Step 2: Verify Backend is Running

Open your browser and go to:
```
http://localhost:3000
```

You should see:
```json
{
  "service": "Backend Monolithique - STA Chery Tunisia",
  "status": "UP"
}
```

---

## Step 3: Test Chatbot

Now the chatbot should work! Go to:
```
http://localhost:3001/client/chatbot
```

Send a message like "Bonjour" and you should get a response in 1-5 seconds.

---

## 🐛 Still Not Working?

### Check Backend Logs

Look at the terminal where you started the backend. You should see:
```
📨 Chatbot request: { message: 'Bonjour...', historyLength: 0 }
[AI Assistant] Envoi de la question: Bonjour
[AI Assistant] Réponse reçue de Groq
✅ Chatbot response received
```

### Test Backend Directly

Run this command:
```bash
curl -X POST http://localhost:3000/api/chatbot/chat -H "Content-Type: application/json" -d "{\"message\": \"test\"}"
```

Expected response:
```json
{
  "reply": "...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## ✅ Summary

1. **Backend MUST be running** on port 3000
2. **Frontend** runs on port 3001
3. **Chatbot** connects frontend to backend
4. **Groq AI** provides fast responses (1-5 seconds)

---

## 📞 Need Help?

Check these files:
- `docs/START_SERVERS_GUIDE.md` - Complete guide
- `docs/CHATBOT_CHECKLIST.md` - Verification checklist
- `docs/QUICK_START_CHATBOT.md` - Chatbot setup

Or run the test script:
```bash
cd backend
node scripts/testGroqAI.js
```

---

**Remember: Backend first, then frontend!** 🚀
