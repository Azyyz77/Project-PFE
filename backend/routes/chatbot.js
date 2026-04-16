// routes/chatbot.js
const express = require('express');
const router = express.Router();

// Hugging Face Space API endpoint
const HF_API_URL = "https://dali4444444-chery-sav-api1.hf.space/api/chat";

router.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    console.log('📨 Chatbot request:', { 
      message: message?.substring(0, 50) + '...', 
      historyLength: history?.length || 0,
      url: HF_API_URL
    });

    // Call your Hugging Face Space chatbot
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        message: message, 
        history: history || [] 
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('📡 HF Space response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HF Space error:', response.status, errorText);
      throw new Error(`HF Space API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Chatbot response received:', data);
    
    const reply = data.reply || data.response || data.message || data;
    res.json({ reply: typeof reply === 'string' ? reply : JSON.stringify(reply) });

  } catch (error) {
    console.error('❌ Chatbot error:', error.message);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        reply: '⚠️ Le service met trop de temps à répondre. Veuillez réessayer.'
      });
    }
    
    res.status(500).json({ 
      error: 'Chatbot unavailable',
      reply: '⚠️ Service temporairement indisponible. Appelez-nous au +216 XX XXX XXX',
      details: error.message
    });
  }
});

module.exports = router;