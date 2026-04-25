# 🚀 START HERE - Fix Your Chatbot Error

## ⚠️ You're seeing "Failed to fetch" because the backend is not running!

---

## 🔴 The Problem

Your browser shows:
```
❌ Impossible de se connecter au serveur. 
   Vérifiez que le backend est démarré sur http://localhost:3000
```

This means: **Backend server is not running!**

---

## ✅ The Solution (3 Steps)

### Step 1: Open a New Terminal

Press `Ctrl + Shift + ` ` (backtick) in VS Code

OR

Open Command Prompt / PowerShell

---

### Step 2: Start Backend

Copy and paste this command:

```bash
cd backend
npm start
```

Press Enter and **WAIT** for this message:

```
🚀 Serveur monolithique démarré sur le port 3000
📍 http://localhost:3000
[AI Assistant] Initialized with: { provider: 'Groq', model: 'llama-3.3-70b-versatile' }
```

✅ **When you see this, the backend is ready!**

---

### Step 3: Reload Chatbot Page

Go back to your browser and press `F5` or click reload.

The error should be gone and the chatbot should work! 🎉

---

## 🧪 Test It

1. Type "Bonjour" in the chatbot
2. Press Enter
3. You should get a response in **1-5 seconds**

---

## 🐛 Still Not Working?

### Check 1: Is Backend Running?

Open: http://localhost:3000

You should see:
```json
{
  "service": "Backend Monolithique - STA Chery Tunisia",
  "status": "UP"
}
```

### Check 2: Is Port 3000 Free?

If you see "Port already in use", run:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then try starting backend again
cd backend
npm start
```

### Check 3: Are Dependencies Installed?

```bash
cd backend
npm install
npm start
```

---

## 📚 More Help

- **Quick Start:** `QUICK_START.md`
- **Complete Guide:** `docs/START_SERVERS_GUIDE.md`
- **Troubleshooting:** `docs/CHATBOT_CHECKLIST.md`
- **Final Status:** `docs/FINAL_CHATBOT_STATUS.md`

---

## 🎯 Remember

**Frontend (Port 3001)** → Needs → **Backend (Port 3000)** → Needs → **Groq AI**

If backend is not running, frontend cannot connect!

---

## ✅ Success Looks Like This

### Terminal (Backend):
```
🚀 Serveur monolithique démarré sur le port 3000
[AI Assistant] Initialized with: { provider: 'Groq', ... }
📨 Chatbot request: { message: 'Bonjour...', ... }
✅ Chatbot response received
```

### Browser (Frontend):
```
User: Bonjour
[Typing indicator... 2 seconds]
Bot: Bonjour ! Je suis l'assistant SAV de Chery Tunisie. 
     Comment puis-je vous aider aujourd'hui ?
```

---

## 🎉 That's It!

Once backend is running, everything works perfectly!

**Your chatbot is now:**
- ⚡ Fast (1-5 second responses)
- 🎯 Accurate (powered by Groq AI)
- 😊 User-friendly (modern UI)
- 🔧 Production-ready

---

**Need help? Check the docs folder for detailed guides!**
