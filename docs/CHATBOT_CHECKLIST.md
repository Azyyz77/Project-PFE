# AI Chatbot - Verification Checklist

Use this checklist to verify your AI chatbot is working correctly.

---

## ✅ Configuration Check

### 1. Environment Variables
- [ ] `GROQ_API_KEY` is set in `backend/.env`
- [ ] `GROQ_MODEL` is set (default: `llama-3.3-70b-versatile`)
- [ ] No syntax errors in `.env` file
- [ ] API key starts with `gsk_`

**How to check:**
```bash
cd backend
grep GROQ_API_KEY .env
```

Expected output:
```
GROQ_API_KEY=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
```

---

## ✅ Service Check

### 2. AI Service Loads
- [ ] Service initializes without errors
- [ ] Groq is detected as primary provider
- [ ] No missing dependencies

**How to check:**
```bash
cd backend
node -e "require('./services/aiAssistantService'); console.log('OK')"
```

Expected output:
```
[AI Assistant] Initialized with: { provider: 'Groq', model: 'llama-3.3-70b-versatile' }
OK
```

---

## ✅ Test Script

### 3. Run Test Script
- [ ] Test script runs without errors
- [ ] All 3 tests pass
- [ ] Response times are under 10 seconds
- [ ] Responses are in French

**How to check:**
```bash
cd backend
node scripts/testGroqAI.js
```

Expected output:
```
✅ Réponse reçue en 4271 ms
✅ Réponse reçue en 1057 ms
✅ Réponse reçue en 1468 ms
✅ Tests terminés
```

---

## ✅ Backend Server

### 4. Server Starts
- [ ] Backend starts without errors
- [ ] Port 3000 is available
- [ ] Database connection successful
- [ ] All routes registered

**How to check:**
```bash
cd backend
npm start
```

Expected output:
```
Server running on port 3000
Database connected
[AI Assistant] Initialized with: { provider: 'Groq', ... }
```

### 5. Health Check Endpoint
- [ ] Health check endpoint responds
- [ ] Status is "online"
- [ ] Provider is "Groq"

**How to check:**
```bash
curl http://localhost:3000/api/chatbot/status
```

Expected output:
```json
{
  "status": "online",
  "provider": "Groq",
  "message": "Chatbot service is operational"
}
```

---

## ✅ API Testing

### 6. Chat Endpoint
- [ ] Chat endpoint accepts POST requests
- [ ] Returns valid JSON response
- [ ] Response time is under 10 seconds
- [ ] Reply is in French

**How to check:**
```bash
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour"}'
```

Expected output:
```json
{
  "reply": "Bonjour ! Je suis l'assistant SAV de Chery Tunisie...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 7. Error Handling
- [ ] Empty message returns 400 error
- [ ] Invalid JSON returns 400 error
- [ ] Service errors return 500 with user-friendly message

**How to check:**
```bash
# Test empty message
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'
```

Expected output:
```json
{
  "error": "Message requis",
  "reply": "Veuillez fournir un message"
}
```

---

## ✅ Frontend Testing

### 8. Frontend Starts
- [ ] Frontend starts without errors
- [ ] Port 3001 is available
- [ ] No build errors
- [ ] No TypeScript errors

**How to check:**
```bash
cd frontend
npm run dev
```

### 9. Chatbot Page Loads
- [ ] Navigate to `/client/chatbot`
- [ ] Page loads without errors
- [ ] Chat interface is visible
- [ ] Initial greeting message appears

**How to check:**
Open browser: `http://localhost:3001/client/chatbot`

Expected:
- ✅ Page loads
- ✅ "🚗 Assistant Chery" header visible
- ✅ Greeting message displayed
- ✅ Input field is functional

### 10. Send Message
- [ ] Can type in input field
- [ ] Send button is clickable
- [ ] Message appears in chat
- [ ] Typing indicator shows
- [ ] Bot response appears
- [ ] Response time is under 10 seconds

**How to check:**
1. Type "Bonjour" in input field
2. Click "Send" button
3. Wait for response

Expected:
- ✅ User message appears (red bubble, right side)
- ✅ Typing indicator shows (3 dots)
- ✅ Bot response appears (white bubble, left side)
- ✅ Response is relevant and in French

---

## ✅ Integration Testing

### 11. Multiple Messages
- [ ] Can send multiple messages
- [ ] Conversation history is maintained
- [ ] Scroll works correctly
- [ ] No memory leaks

**How to check:**
Send 5 different messages in a row:
1. "Bonjour"
2. "Quels sont les modèles Chery?"
3. "Quelle est la garantie?"
4. "Comment prendre un rendez-vous?"
5. "Merci"

Expected:
- ✅ All messages appear correctly
- ✅ Responses are relevant
- ✅ Page doesn't slow down
- ✅ Scroll to bottom works

### 12. Error Recovery
- [ ] Handles network errors gracefully
- [ ] Shows user-friendly error messages
- [ ] Can retry after error
- [ ] Doesn't crash on error

**How to check:**
1. Stop backend server
2. Send a message
3. Restart backend server
4. Send another message

Expected:
- ✅ Error message appears when backend is down
- ✅ Can send message after backend restarts
- ✅ No console errors

---

## ✅ Performance Testing

### 13. Response Time
- [ ] First message: < 10 seconds
- [ ] Subsequent messages: < 5 seconds
- [ ] Average response time: < 3 seconds

**How to check:**
Use browser DevTools Network tab to measure response times.

### 14. Concurrent Users
- [ ] Can handle multiple users simultaneously
- [ ] No rate limit errors (under 30 req/min)
- [ ] Responses remain fast

**How to check:**
Open 3 browser tabs and send messages simultaneously.

---

## ✅ Documentation Check

### 15. Documentation Complete
- [ ] `docs/AI_CHATBOT_SETUP.md` exists
- [ ] `docs/CHATBOT_FIX_SUMMARY.md` exists
- [ ] `docs/QUICK_START_CHATBOT.md` exists
- [ ] `docs/CHATBOT_IMPROVEMENTS.md` exists
- [ ] `docs/CHATBOT_CHECKLIST.md` exists (this file)

### 16. Code Comments
- [ ] Service code is well-commented
- [ ] Routes have JSDoc comments
- [ ] Complex logic is explained

---

## ✅ Security Check

### 17. API Key Security
- [ ] API key is in `.env` file (not in code)
- [ ] `.env` is in `.gitignore`
- [ ] API key is not exposed to frontend
- [ ] No API key in logs

**How to check:**
```bash
# Check .gitignore
grep ".env" .gitignore

# Check for exposed keys in code
grep -r "gsk_" frontend/
```

Expected:
- ✅ `.env` is in `.gitignore`
- ✅ No API keys found in frontend code

### 18. Input Validation
- [ ] Empty messages are rejected
- [ ] Very long messages are handled
- [ ] Special characters are handled
- [ ] SQL injection attempts are blocked

---

## ✅ Production Readiness

### 19. Error Logging
- [ ] Errors are logged to console
- [ ] Log format is consistent
- [ ] Sensitive data is not logged
- [ ] Logs are useful for debugging

### 20. Monitoring
- [ ] Can check service status via API
- [ ] Response times are logged
- [ ] Error rates can be tracked
- [ ] Provider (Groq/HF) is logged

---

## 📊 Final Score

Count your checkmarks:

- **50-50:** ✅ Perfect! Production ready
- **45-49:** ⚠️ Almost there, fix remaining issues
- **40-44:** ⚠️ Some work needed
- **< 40:** ❌ Review setup and fix issues

---

## 🚨 Common Issues

### Issue: "Groq API key invalid"
**Solution:** 
1. Check `.env` file has correct key
2. Verify key starts with `gsk_`
3. Test key at console.groq.com

### Issue: "Service not responding"
**Solution:**
1. Check backend is running
2. Check port 3000 is not blocked
3. Check firewall settings

### Issue: "Slow responses"
**Solution:**
1. Check internet connection
2. Reduce `AI_MAX_TOKENS` in `.env`
3. Try different Groq model

### Issue: "Rate limit exceeded"
**Solution:**
1. Wait 1 minute
2. Reduce request frequency
3. Consider upgrading Groq plan

---

## 📞 Need Help?

If you're stuck:

1. **Check logs** - Look for error messages
2. **Run test script** - `node scripts/testGroqAI.js`
3. **Read docs** - `docs/AI_CHATBOT_SETUP.md`
4. **Check Groq status** - console.groq.com

---

## ✅ Completion

Once all checks pass:

- [ ] Mark this checklist as complete
- [ ] Document any issues found
- [ ] Share with team
- [ ] Deploy to production (if ready)

**Date Completed:** _______________  
**Completed By:** _______________  
**Notes:** _______________

---

**Version:** 1.0.0  
**Last Updated:** January 2025
