# AI Chatbot System - Groq Integration

## Overview

The AI chatbot system uses **Groq AI** as the primary provider for fast and reliable responses. Groq offers:
- ⚡ Ultra-fast inference (1-5 seconds per response)
- 🆓 Free tier with generous limits
- 🧠 Powerful LLM models (Llama 3.3 70B)
- 🔄 Fallback to Hugging Face if needed

## Configuration

### Environment Variables

Add these to your `backend/.env` file:

```env
# Groq AI Configuration (Primary)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
AI_MAX_TOKENS=1024
AI_TEMPERATURE=0.7
AI_TOP_P=0.9
AI_TIMEOUT_MS=30000

# Hugging Face (Fallback - Optional)
HUGGINGFACE_MODEL_ID=your-model-id
HUGGINGFACE_API_TOKEN=your-hf-token
```

### Getting a Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

**Free Tier Limits:**
- 30 requests per minute
- 14,400 requests per day
- Perfect for development and small-scale production

## Available Models

### Recommended Models

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| `llama-3.3-70b-versatile` | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | **Default** - Best balance |
| `llama-3.1-70b-versatile` | ⚡⚡⚡ | ⭐⭐⭐⭐ | Alternative option |
| `mixtral-8x7b-32768` | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Faster, good quality |
| `gemma2-9b-it` | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | Fastest, lighter |

## Architecture

### Service Layer
**File:** `backend/services/aiAssistantService.js`

The service handles:
- Provider selection (Groq → HF Space → HF Inference)
- Prompt engineering with Chery-specific context
- Error handling and retries
- Response formatting

### API Routes

#### 1. Chatbot Route
**File:** `backend/routes/chatbot.js`
**Endpoint:** `POST /api/chatbot/chat`

```javascript
// Request
{
  "message": "Comment prendre un rendez-vous?",
  "history": [
    ["previous question", "previous answer"]
  ]
}

// Response
{
  "reply": "Pour prendre un rendez-vous...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### 2. AI Assistant Route
**File:** `backend/routes/aiAssistantRoutes.js`
**Endpoint:** `POST /api/ai-assistant/message`

Requires authentication. Used for authenticated users with context.

#### 3. Health Check
**Endpoint:** `GET /api/chatbot/status`

Returns the status of the AI service.

## Frontend Integration

### Chatbot Page
**File:** `frontend/app/client/chatbot/page.tsx`

Features:
- Real-time chat interface
- Message history
- Typing indicators
- Error handling
- Multi-language support (French/Arabic)

### API Client
**File:** `frontend/lib/api/chatbot.ts`

```typescript
import { chatbotApi } from '@/lib/api/chatbot';

const response = await chatbotApi.sendMessage({
  message: 'Bonjour',
  history: []
});
```

## Prompt Engineering

The system uses a carefully crafted system prompt:

```
Tu es l'assistant SAV officiel de Chery Tunisie.

Ton rôle:
- Répondre aux questions sur les véhicules Chery
- Aider avec les rendez-vous de maintenance
- Fournir des informations sur les services après-vente
- Répondre en français ou en arabe tunisien
- Être professionnel, courtois et précis

Informations importantes:
- Les rendez-vous peuvent être pris via la plateforme en ligne
- Le service client est disponible pour toute urgence
- Les garanties Chery couvrent généralement 5 ans ou 150,000 km
- Les révisions sont recommandées tous les 10,000 km ou 6 mois
```

## Testing

### Manual Test Script
**File:** `backend/scripts/testGroqAI.js`

Run the test:
```bash
cd backend
node scripts/testGroqAI.js
```

Expected output:
```
✅ Réponse reçue en 1057 ms
Réponse: Bonjour ! Nous sommes ravis...
```

### Integration Test

1. Start the backend server:
```bash
cd backend
npm start
```

2. Test the endpoint:
```bash
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Bonjour"}'
```

3. Access the chatbot UI:
```
http://localhost:3001/client/chatbot
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Clé API Groq invalide` | Invalid API key | Check `.env` file |
| `Limite de requêtes atteinte` | Rate limit exceeded | Wait or upgrade plan |
| `Service temporairement indisponible` | Groq API down | System falls back to HF |

### Fallback Chain

1. **Groq API** (Primary) - Fast and reliable
2. **Hugging Face Space** (Secondary) - If configured
3. **Hugging Face Inference** (Tertiary) - Last resort
4. **Error Message** - User-friendly fallback

## Performance

### Response Times

- **Groq:** 1-5 seconds (typical)
- **HF Space:** 5-15 seconds
- **HF Inference:** 10-30 seconds (cold start)

### Optimization Tips

1. **Reduce max_tokens** for faster responses
2. **Increase temperature** for more creative answers
3. **Use conversation history** for context
4. **Cache common responses** (future enhancement)

## Monitoring

### Logs

The service logs all requests:
```
[AI Assistant] Initialized with: { provider: 'Groq', model: 'llama-3.3-70b-versatile' }
[AI Assistant] Envoi de la question: Bonjour...
[AI Assistant] Réponse reçue de Groq
```

### Metrics to Track

- Response time
- Error rate
- API usage (stay within limits)
- User satisfaction

## Security

### Best Practices

1. ✅ **Never expose API keys** in frontend code
2. ✅ **Use environment variables** for configuration
3. ✅ **Implement rate limiting** on your endpoints
4. ✅ **Sanitize user input** before sending to AI
5. ✅ **Log errors** but not sensitive data

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const chatbotLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Trop de requêtes, veuillez réessayer plus tard'
});

router.post('/chat', chatbotLimiter, async (req, res) => {
  // ...
});
```

## Future Enhancements

### Planned Features

- [ ] Conversation history storage in database
- [ ] User feedback system (thumbs up/down)
- [ ] Multi-turn context awareness
- [ ] Voice input/output
- [ ] Integration with appointment booking
- [ ] Vehicle-specific knowledge base
- [ ] Sentiment analysis
- [ ] Auto-escalation to human agent

### Advanced Features

- [ ] RAG (Retrieval Augmented Generation) with vehicle manuals
- [ ] Fine-tuning on Chery-specific data
- [ ] Multi-language support (Arabic dialect)
- [ ] Image recognition for vehicle issues
- [ ] Proactive maintenance reminders

## Troubleshooting

### Issue: "Groq API not responding"

**Solution:**
1. Check internet connection
2. Verify API key is valid
3. Check Groq status page
4. System will auto-fallback to HF

### Issue: "Responses are slow"

**Solution:**
1. Reduce `AI_MAX_TOKENS` in `.env`
2. Use a faster model (e.g., `gemma2-9b-it`)
3. Check network latency
4. Consider caching common responses

### Issue: "Rate limit exceeded"

**Solution:**
1. Implement request queuing
2. Add rate limiting on your API
3. Upgrade Groq plan if needed
4. Use fallback providers

## Support

For issues or questions:
- Check logs in `backend/logs/`
- Review error messages in console
- Test with `testGroqAI.js` script
- Contact Groq support for API issues

## Resources

- [Groq Documentation](https://console.groq.com/docs)
- [Groq API Reference](https://console.groq.com/docs/api-reference)
- [Llama 3.3 Model Card](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)
- [Express.js Rate Limiting](https://www.npmjs.com/package/express-rate-limit)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
