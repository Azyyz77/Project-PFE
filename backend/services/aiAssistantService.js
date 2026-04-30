const axios = require('axios');

/**
 * Service pour interagir avec le modèle AI Chery Assistant via Groq
 */
class AIAssistantService {
  constructor() {
    // Configuration Groq
    this.groqApiKey = (process.env.GROQ_API_KEY || process.env.ai || '').trim();
    this.groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'; // Fast and capable model
    this.groqApiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Fallback to Hugging Face if Groq not configured
    this.huggingFaceModelId = this.normalizeModelId(process.env.HUGGINGFACE_MODEL_ID || '');
    this.huggingFaceApiUrl = (process.env.HUGGINGFACE_API_URL || '').trim();
    this.huggingFaceToken = (process.env.HUGGINGFACE_API_TOKEN || '').trim();
    this.huggingFaceUseRouter = (process.env.HUGGINGFACE_USE_ROUTER || 'true').toLowerCase() === 'true';
    
    // Model parameters
    this.maxTokens = Number(process.env.AI_MAX_TOKENS || 1024);
    this.temperature = Number(process.env.AI_TEMPERATURE || 0.7);
    this.topP = Number(process.env.AI_TOP_P || 0.9);
    this.timeout = Number(process.env.AI_TIMEOUT_MS || 30000);
    
    this.inferenceApiUrl = this.buildInferenceApiUrl();
    
    console.log('[AI Assistant] Initialized with:', {
      provider: this.groqApiKey ? 'Groq' : 'Hugging Face',
      model: this.groqApiKey ? this.groqModel : this.huggingFaceModelId
    });
  }

  normalizeModelId(modelIdOrUrl) {
    const input = modelIdOrUrl.trim();
    if (!input) {
      return '';
    }

    // Accepte aussi une URL complète et en extrait owner/model
    // Ex: https://api-inference.huggingface.co/models/owner/model -> owner/model
    const marker = '/models/';
    if (input.includes(marker)) {
      const extracted = input.split(marker)[1] || '';
      return extracted.replace(/^\/+/, '').replace(/\/+$/, '');
    }

    return input.replace(/^\/+/, '').replace(/\/+$/, '');
  }

  buildInferenceApiUrl() {
    const explicitUrl = (process.env.HUGGINGFACE_INFERENCE_URL || '').trim();
    if (explicitUrl) {
      return explicitUrl;
    }

    if (!this.huggingFaceModelId) {
      return '';
    }

    if (this.huggingFaceUseRouter) {
      return `https://router.huggingface.co/hf-inference/models/${this.huggingFaceModelId}`;
    }

    return `https://api-inference.huggingface.co/models/${this.huggingFaceModelId}`;
  }

  extractTextResponse(data) {
    if (!data) {
      return '';
    }

    if (Array.isArray(data)) {
      const first = data[0] || {};
      return (
        first.generated_text ||
        first.summary_text ||
        first.answer ||
        first.text ||
        ''
      );
    }

    return (
      data.generated_text ||
      data.summary_text ||
      data.answer ||
      data.response ||
      data.output_text ||
      data.text ||
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      ''
    );
  }

  buildPrompt(userQuestion, context = {}) {
    const ragBlock = context.ragContext
      ? `\n\nDONNÉES RÉELLES DU SYSTÈME (utilise UNIQUEMENT ces informations exactes, ne complète pas avec des suppositions):\n${context.ragContext}`
      : '';

    const systemPrompt = `Tu es l'assistant SAV officiel de STA Chery Tunisie.

RÈGLES STRICTES:
- Utilise UNIQUEMENT les données fournies ci-dessous, mot pour mot
- Ne complète JAMAIS avec des descriptions inventées
- Si une info n'est pas dans les données, dis "Je n'ai pas cette information"
- Répondre en français ou arabe tunisien selon la langue du client
- Sois concis et précis

Informations générales:
- Garantie Chery: 5 ans ou 150,000 km
- Révisions: tous les 10,000 km ou 6 mois
- Rendez-vous disponibles via la plateforme en ligne${ragBlock}`;

    const contextLines = [];
    if (context.userType) contextLines.push(`Rôle: ${context.userType}`);
    if (context.userName) contextLines.push(`Nom: ${context.userName}`);
    if (context.vehicleModel) contextLines.push(`Véhicule: ${context.vehicleModel}`);

    const contextBlock = contextLines.length
      ? `\n\nContexte:\n${contextLines.join('\n')}`
      : '';

    return {
      system: systemPrompt + contextBlock,
      user: userQuestion
    };
  }

  /**
   * Obtenir une réponse de l'assistant AI via Groq ou Hugging Face
   * @param {string} userQuestion - Question de l'utilisateur
   * @param {object} context - Contexte additionnel (optionnel)
   * @returns {Promise<string>} - Réponse de l'AI
   */
  async getResponse(userQuestion, context = {}) {
    try {
      console.log('[AI Assistant] Envoi de la question:', userQuestion.substring(0, 100));

      // Chercher contexte RAG depuis pgvector (optionnel)
      let ragContext = '';
      try {
        // Vérifier si RAG est configuré
        if (process.env.PG_URL && process.env.OLLAMA_URL) {
          const { searchContext } = require('./ragService');
          const found = await searchContext(userQuestion);
          if (found) {
            ragContext = `\n\nInformations disponibles dans notre système:\n${found}`;
            console.log('[AI Assistant] Contexte RAG trouvé ✅');
          }
        } else {
          console.log('[AI Assistant] RAG non configuré (PG_URL ou OLLAMA_URL manquant)');
        }
      } catch (e) {
        console.log('[AI Assistant] RAG non disponible:', e.message);
      }

      // Ajouter le contexte RAG au contexte existant
      context.ragContext = ragContext;

      // Priorité 1: Groq (rapide et fiable)
      if (this.groqApiKey) {
        return await this.getResponseFromGroq(userQuestion, context);
      }

      // Priorité 2: Hugging Face Space (si configuré)
      if (this.huggingFaceApiUrl) {
        return await this.getResponseFromSpace(userQuestion, context);
      }

      // Priorité 3: Hugging Face Inference API
      return await this.getResponseFromInference(userQuestion, context);

    } catch (error) {
      console.error('[AI Assistant] Erreur:', error.message);
      throw new Error('Erreur lors de la communication avec l\'assistant AI');
    }
  }

  /**
   * Obtenir une réponse via Groq API (rapide et fiable)
   */
  async getResponseFromGroq(userQuestion, context = {}) {
    try {
      if (!this.groqApiKey) {
        throw new Error('Clé API Groq non configurée');
      }

      const prompt = this.buildPrompt(userQuestion, context);

      const response = await axios.post(
        this.groqApiUrl,
        {
          model: this.groqModel,
          messages: [
            {
              role: 'system',
              content: prompt.system
            },
            {
              role: 'user',
              content: prompt.user
            }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
          top_p: this.topP,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      const aiResponse = response.data?.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Format de réponse Groq invalide');
      }

      console.log('[AI Assistant] Réponse reçue de Groq');
      return aiResponse.trim();

    } catch (error) {
      console.error('[AI Assistant] Erreur Groq:', error.message);
      
      if (error.response?.status === 401) {
        throw new Error('Clé API Groq invalide');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Limite de requêtes Groq atteinte. Réessayez dans un moment.');
      }

      if (error.response?.status === 503) {
        throw new Error('Service Groq temporairement indisponible. Réessayez dans quelques secondes.');
      }
      
      throw error;
    }
  }

  /**
   * Obtenir une réponse via Hugging Face Inference API
   */
  async getResponseFromInference(userQuestion, context = {}) {
    try {
      if (!this.huggingFaceToken) {
        throw new Error('Token Hugging Face non configuré');
      }

      if (!this.huggingFaceModelId) {
        throw new Error('Model ID Hugging Face non configuré');
      }

      if (!this.inferenceApiUrl) {
        throw new Error('URL Inference Hugging Face non configurée');
      }

      // Préparer le prompt (format ancien pour compatibilité)
      const prompt = this.buildPrompt(userQuestion, context);
      const fullPrompt = `${prompt.system}\n\nQuestion: ${prompt.user}\nRéponse:`;

      const response = await axios.post(
        this.inferenceApiUrl,
        {
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: this.maxTokens,
            temperature: this.temperature,
            top_p: this.topP,
            do_sample: true,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceToken}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      let aiResponse = this.extractTextResponse(response.data);
      if (!aiResponse) {
        throw new Error('Format de réponse invalide');
      }

      // Nettoyer la réponse
      aiResponse = aiResponse.trim();
      
      console.log('[AI Assistant] Réponse reçue de Inference API');
      return aiResponse;

    } catch (error) {
      console.error('[AI Assistant] Erreur Inference API:', error.message);
      
      if (error.response?.status === 503) {
        throw new Error('Le modèle est en cours de chargement. Veuillez réessayer dans quelques secondes.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Token Hugging Face invalide');
      }

      if (error.response?.status === 429) {
        throw new Error('Limite de requêtes Hugging Face atteinte. Réessayez dans un moment.');
      }

      if (error.response?.status === 403) {
        throw new Error('Accès refusé par Hugging Face. Vérifiez les permissions Inference Providers de votre token.');
      }
      
      throw error;
    }
  }

  /**
   * Obtenir une réponse via un Space Hugging Face déployé
   */
  async getResponseFromSpace(userQuestion, context = {}) {
    try {
      const payload = {
        question: userQuestion,
        ...context
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      if (this.huggingFaceToken) {
        headers['Authorization'] = `Bearer ${this.huggingFaceToken}`;
      }

      const response = await axios.post(this.huggingFaceApiUrl, payload, {
        headers,
        timeout: this.timeout
      });

      const aiResponse = response.data.reponse || response.data.response || response.data.answer;
      
      if (!aiResponse) {
        throw new Error('Format de réponse AI invalide');
      }

      console.log('[AI Assistant] Réponse reçue du Space');
      return aiResponse;

    } catch (error) {
      console.error('[AI Assistant] Erreur Space:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Service AI non disponible. Veuillez réessayer plus tard.');
      }
      
      throw error;
    }
  }

  /**
   * Obtenir une réponse contextuelle pour un client
   * @param {string} question - Question du client
   * @param {object} userInfo - Informations du client
   * @returns {Promise<string>}
   */
  async getClientResponse(question, userInfo = {}) {
    const context = {
      userType: 'client',
      userId: userInfo.id,
      userName: userInfo.name
    };

    return this.getResponse(question, context);
  }

  /**
   * Obtenir une réponse pour un agent
   * @param {string} question - Question de l'agent
   * @param {object} agentInfo - Informations de l'agent
   * @returns {Promise<string>}
   */
  async getAgentResponse(question, agentInfo = {}) {
    const context = {
      userType: 'agent',
      agentId: agentInfo.id,
      agencyId: agentInfo.agencyId
    };

    return this.getResponse(question, context);
  }
}

module.exports = new AIAssistantService();
