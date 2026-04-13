const axios = require('axios');

/**
 * Service pour interagir avec le modèle AI Chery Assistant sur Hugging Face
 */
class AIAssistantService {
  constructor() {
    // Configuration Hugging Face
    this.huggingFaceModelId = this.normalizeModelId(process.env.HUGGINGFACE_MODEL_ID || '');
    this.huggingFaceApiUrl = (process.env.HUGGINGFACE_API_URL || '').trim();
    this.huggingFaceToken = (process.env.HUGGINGFACE_API_TOKEN || '').trim();
    this.huggingFaceUseRouter = (process.env.HUGGINGFACE_USE_ROUTER || 'true').toLowerCase() === 'true';
    this.maxNewTokens = Number(process.env.HUGGINGFACE_MAX_NEW_TOKENS || 256);
    this.temperature = Number(process.env.HUGGINGFACE_TEMPERATURE || 0.7);
    this.topP = Number(process.env.HUGGINGFACE_TOP_P || 0.9);
    this.timeout = Number(process.env.HUGGINGFACE_TIMEOUT_MS || 30000);
    
    this.inferenceApiUrl = this.buildInferenceApiUrl();
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
    const systemPrompt = "Tu es l'assistant SAV officiel de Chery Tunisie. Réponds en français ou arabe tunisien, de façon claire et professionnelle.";

    const contextLines = [];
    if (context.userType) contextLines.push(`Role utilisateur: ${context.userType}`);
    if (context.userName) contextLines.push(`Nom utilisateur: ${context.userName}`);
    if (context.vehicleModel) contextLines.push(`Modele vehicule: ${context.vehicleModel}`);

    const contextBlock = contextLines.length
      ? `Contexte:\n${contextLines.join('\n')}\n\n`
      : '';

    return `${systemPrompt}\n\n${contextBlock}Question client: ${userQuestion}\nReponse:`;
  }

  /**
   * Obtenir une réponse de l'assistant AI via Hugging Face Inference API
   * @param {string} userQuestion - Question de l'utilisateur
   * @param {object} context - Contexte additionnel (optionnel)
   * @returns {Promise<string>} - Réponse de l'AI
   */
  async getResponse(userQuestion, context = {}) {
    try {
      console.log('[AI Assistant] Envoi de la question:', userQuestion);

      // Si un Space est configuré, l'utiliser en priorité
      if (this.huggingFaceApiUrl) {
        return await this.getResponseFromSpace(userQuestion, context);
      }

      // Sinon, utiliser l'API Inference
      return await this.getResponseFromInference(userQuestion, context);

    } catch (error) {
      console.error('[AI Assistant] Erreur:', error.message);
      throw new Error('Erreur lors de la communication avec l\'assistant AI');
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

      // Préparer le prompt
      const prompt = this.buildPrompt(userQuestion, context);

      const response = await axios.post(
        this.inferenceApiUrl,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: this.maxNewTokens,
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
