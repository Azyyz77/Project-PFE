// routes/chatbot.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const aiAssistantService = require('../services/aiAssistantService');

// Extract userId from Authorization header if present (optional auth)
function extractUserId(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
}

/**
 * Chatbot endpoint - Uses Groq AI for fast responses
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        error: 'Message requis',
        reply: 'Veuillez fournir un message'
      });
    }

    console.log('📨 Chatbot request:', {
      message: message?.substring(0, 50) + '...',
      historyLength: history?.length || 0
    });

    const userId = extractUserId(req);

    // Build context from conversation history
    const context = {
      userType: 'client',
      userId,
      conversationHistory: history || []
    };

    // Get response from AI service (Groq or fallback)
    let reply = await aiAssistantService.getResponse(message, context);
    // Normalize: getResponse may return a string or {reply, rag} object
    if (reply && typeof reply === 'object' && reply.reply) reply = reply.reply;

    console.log('✅ Chatbot response received');
    
    res.json({ 
      reply,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    
    // User-friendly error messages
    let errorMessage = '⚠️ Service temporairement indisponible. Veuillez réessayer.';
    
    if (error.message.includes('Groq')) {
      errorMessage = '⚠️ Le service AI est temporairement indisponible. Veuillez réessayer dans quelques instants.';
    } else if (error.message.includes('Limite')) {
      errorMessage = '⚠️ Trop de requêtes. Veuillez patienter un moment avant de réessayer.';
    }
    
    res.status(500).json({ 
      error: 'Chatbot unavailable',
      reply: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Health check endpoint for chatbot service
 */
router.get('/status', async (req, res) => {
  try {
    // Simple test to check if AI service is available
    const testResponse = await aiAssistantService.getResponse('test', { userType: 'system' });
    
    res.json({
      status: 'online',
      provider: process.env.GROQ_API_KEY ? 'Groq' : 'Hugging Face',
      message: 'Chatbot service is operational'
    });
  } catch (error) {
    res.status(503).json({
      status: 'offline',
      message: 'Chatbot service unavailable',
      error: error.message
    });
  }
});

module.exports = router;