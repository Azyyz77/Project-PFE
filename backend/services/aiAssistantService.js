// services/aiAssistantService.js
// ═══════════════════════════════════════════════════════════
//  AI Assistant Service — Chery Tunisie SAV
//  Intégré avec RAG Graph + Vector Search
//  Provider : Groq (principal) → Hugging Face (fallback)
// ═══════════════════════════════════════════════════════════

const axios = require('axios');
const { getConnection } = require('../config/database');
// Import anticipé : démarre la connexion PG dès le chargement du module
const ragService = process.env.PG_URL ? require('./ragService') : null;

class AIAssistantService {
  constructor() {
    // ── Groq (provider principal) ──
    this.groqApiKey  = (process.env.GROQ_API_KEY || process.env.ai || '').trim();
    this.groqModel   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.groqApiUrl  = 'https://api.groq.com/openai/v1/chat/completions';

    // ── Hugging Face (fallback) ──
    this.huggingFaceModelId    = this.normalizeModelId(process.env.HUGGINGFACE_MODEL_ID || '');
    this.huggingFaceApiUrl     = (process.env.HUGGINGFACE_API_URL || '').trim();
    this.huggingFaceToken      = (process.env.HUGGINGFACE_API_TOKEN || '').trim();
    this.huggingFaceUseRouter  = (process.env.HUGGINGFACE_USE_ROUTER || 'true').toLowerCase() === 'true';

    // ── Paramètres modèle ──
    this.maxTokens   = Number(process.env.AI_MAX_TOKENS  || 1024);
    this.temperature = Number(process.env.AI_TEMPERATURE || 0.4);  // Réduit pour plus de précision
    this.topP        = Number(process.env.AI_TOP_P       || 0.9);
    this.timeout     = Number(process.env.AI_TIMEOUT_MS  || 30000);

    this.inferenceApiUrl = this.buildInferenceApiUrl();

    console.log('[AI Assistant] Initialisé avec:', {
      provider : this.groqApiKey ? 'Groq' : 'Hugging Face',
      model    : this.groqApiKey ? this.groqModel : this.huggingFaceModelId,
      ragActive: !!(process.env.PG_URL && process.env.OLLAMA_URL),
    });
  }

  isAgencyQuestion(userQuestion = '') {
    return /\b(agence|agences|garage|garages|concessionnaire|succursale|succursales)\b/i.test(userQuestion);
  }

  async getAgenciesContext() {
    try {
      const pool = await getConnection();
      const result = await pool.request().query(`
        SELECT nom, ville, adresse, telephone
        FROM Agence
        ORDER BY ville, nom
      `);

      if (!result.recordset.length) {
        return '';
      }

      const lines = ['=== Nos Agences ==='];
      result.recordset.forEach((agency) => {
        lines.push(`• ${agency.nom} | ${agency.ville} | ${agency.adresse || 'Adresse non renseignée'} | Tél: ${agency.telephone || 'Non renseigné'}`);
      });

      return lines.join('\n');
    } catch (error) {
      console.error('[AI Assistant] Erreur chargement agences:', error.message);
      return '';
    }
  }

  // ─────────────────────────────────────────────
  //  Helpers Hugging Face
  // ─────────────────────────────────────────────
  normalizeModelId(modelIdOrUrl) {
    const input = modelIdOrUrl.trim();
    if (!input) return '';
    const marker = '/models/';
    if (input.includes(marker)) {
      return (input.split(marker)[1] || '').replace(/^\/+|\/+$/g, '');
    }
    return input.replace(/^\/+|\/+$/g, '');
  }

  buildInferenceApiUrl() {
    const explicit = (process.env.HUGGINGFACE_INFERENCE_URL || '').trim();
    if (explicit) return explicit;
    if (!this.huggingFaceModelId) return '';
    return this.huggingFaceUseRouter
      ? `https://router.huggingface.co/hf-inference/models/${this.huggingFaceModelId}`
      : `https://api-inference.huggingface.co/models/${this.huggingFaceModelId}`;
  }

  extractTextResponse(data) {
    if (!data) return '';
    if (Array.isArray(data)) {
      const first = data[0] || {};
      return first.generated_text || first.summary_text || first.answer || first.text || '';
    }
    return (
      data.generated_text ||
      data.summary_text   ||
      data.answer         ||
      data.response       ||
      data.output_text    ||
      data.text           ||
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text             ||
      ''
    );
  }

  // ─────────────────────────────────────────────
  //  Construction du prompt système
  //  Utilise le systemPrompt du RAG s'il existe,
  //  sinon construit un prompt de base
  // ─────────────────────────────────────────────
  buildPrompt(userQuestion, context = {}) {
    // ✅ Si le RAG a déjà construit un prompt complet → l'utiliser directement
    if (context.systemPrompt) {
      const contextLines = [];
      if (context.userType) contextLines.push(`Rôle: ${context.userType}`);
      if (context.userName) contextLines.push(`Nom: ${context.userName}`);

      const userCtx = contextLines.length
        ? `\n\nContexte utilisateur:\n${contextLines.join('\n')}`
        : '';

      return {
        system: context.systemPrompt + userCtx,
        user  : userQuestion,
      };
    }

    // ── Prompt de base (sans RAG) ──
    const ragBlock = context.ragContext
      ? `\n\n════════════════════════════════
DONNÉES DU SYSTÈME (utilise UNIQUEMENT ces informations):
${context.ragContext}
════════════════════════════════`
      : '';

    const langInstruction = context.lang === 'ar'
      ? 'Réponds OBLIGATOIREMENT en arabe tunisien (darija).'
      : 'Réponds en français de façon claire et professionnelle.';

    const systemPrompt = `Tu es l'assistant SAV officiel de STA Chery Tunisie.

${langInstruction}

RÈGLES ABSOLUES:
- Utilise UNIQUEMENT les données fournies ci-dessous
- Ne dis JAMAIS "je n'ai pas cette information" si les données contiennent la réponse
- Si l'information est vraiment absente, oriente le client vers une agence
- Sois concis, précis et professionnel
- Termine toujours par une invitation à poser d'autres questions

Informations générales STA Chery:
• Garantie: 5 ans ou 150 000 km
• Révisions: tous les 10 000 km ou 6 mois
• RDV disponibles via la plateforme en ligne${ragBlock}`;

    const contextLines = [];
    if (context.userType)    contextLines.push(`Rôle: ${context.userType}`);
    if (context.userName)    contextLines.push(`Nom: ${context.userName}`);
    if (context.vehicleModel) contextLines.push(`Véhicule: ${context.vehicleModel}`);

    const userCtx = contextLines.length
      ? `\n\nContexte utilisateur:\n${contextLines.join('\n')}`
      : '';

    return { system: systemPrompt + userCtx, user: userQuestion };
  }

  // ─────────────────────────────────────────────
  //  Méthode principale
  // ─────────────────────────────────────────────
  async getResponse(userQuestion, context = {}) {
    try {
      console.log('[AI Assistant] Question:', userQuestion.substring(0, 100));

      // ── Étape 1 : RAG Graph + Vector Search ──
      try {
        if (ragService) {
          const rag = await ragService.searchContext(userQuestion, context.userId || null);

          if (rag && rag.context) {
            context.ragContext    = rag.context;
            context.systemPrompt  = rag.systemPrompt;
            context.intent        = rag.intent;
            context.lang          = rag.lang;
            console.log(`[AI Assistant] ✅ RAG actif — intent: ${rag.intent} | lang: ${rag.lang}`);
          } else {
            console.log('[AI Assistant] ⚠️  RAG sans résultat — réponse générale');
          }
        } else {
          console.log('[AI Assistant] RAG non configuré (PG_URL ou GROQ_API_KEY manquant)');
        }
      } catch (ragErr) {
        console.log('[AI Assistant] RAG indisponible:', ragErr.message);
      }

      // ── Complément local pour les questions sur les agences ──
      if (this.isAgencyQuestion(userQuestion) && !context.ragContext) {
        const agencyContext = await this.getAgenciesContext();
        if (agencyContext) {
          context.ragContext = agencyContext;
          context.intent = context.intent || 'agence';
          console.log('[AI Assistant] ✅ Contexte agences chargé depuis SQL Server');
        }
      }

      // ── Étape 2 : Appel LLM ──
      // Préparer un petit objet RAG pour debug si demandé
      const _ragDebug = {
        intent: context.intent,
        lang: context.lang,
        ragContext: context.ragContext,
        systemPrompt: context.systemPrompt,
      };

      if (this.groqApiKey) {
        const aiReply = await this.getResponseFromGroq(userQuestion, context);
        if (context.debug) return { reply: aiReply, rag: _ragDebug };
        return aiReply;
      }
      if (this.huggingFaceApiUrl) {
        const aiReply = await this.getResponseFromSpace(userQuestion, context);
        if (context.debug) return { reply: aiReply, rag: _ragDebug };
        return aiReply;
      }
      const aiReply = await this.getResponseFromInference(userQuestion, context);
      if (context.debug) return { reply: aiReply, rag: _ragDebug };
      return aiReply;

    } catch (error) {
      console.error('[AI Assistant] Erreur:', error.message);
      throw new Error('Erreur lors de la communication avec l\'assistant AI');
    }
  }

  // ─────────────────────────────────────────────
  //  Groq — provider principal
  // ─────────────────────────────────────────────
  async getResponseFromGroq(userQuestion, context = {}) {
    try {
      if (!this.groqApiKey) throw new Error('Clé API Groq non configurée');

      const prompt = this.buildPrompt(userQuestion, context);

      console.log('[AI Assistant] Envoi à Groq...');
      console.log('[AI Assistant] Aperçu system prompt:', prompt.system.substring(0, 200));

      const response = await axios.post(
        this.groqApiUrl,
        {
          model      : this.groqModel,
          messages   : [
            { role: 'system', content: prompt.system },
            { role: 'user',   content: prompt.user   },
          ],
          temperature: this.temperature,
          max_tokens : this.maxTokens,
          top_p      : this.topP,
          stream     : false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.groqApiKey}`,
            'Content-Type' : 'application/json',
          },
          timeout: this.timeout,
        }
      );

      const aiResponse = response.data?.choices?.[0]?.message?.content;
      if (!aiResponse) throw new Error('Format de réponse Groq invalide');

      console.log('[AI Assistant] ✅ Réponse Groq reçue');
      return aiResponse.trim();

    } catch (error) {
      console.error('[AI Assistant] Erreur Groq:', error.message);
      if (error.response?.status === 401) throw new Error('Clé API Groq invalide');
      if (error.response?.status === 429) throw new Error('Limite Groq atteinte. Réessayez dans un moment.');
      if (error.response?.status === 503) throw new Error('Service Groq indisponible. Réessayez.');
      throw error;
    }
  }

  // ─────────────────────────────────────────────
  //  Hugging Face Inference API — fallback
  // ─────────────────────────────────────────────
  async getResponseFromInference(userQuestion, context = {}) {
    try {
      if (!this.huggingFaceToken)      throw new Error('Token Hugging Face non configuré');
      if (!this.huggingFaceModelId)    throw new Error('Model ID Hugging Face non configuré');
      if (!this.inferenceApiUrl)       throw new Error('URL Inference Hugging Face non configurée');

      const prompt     = this.buildPrompt(userQuestion, context);
      const fullPrompt = `${prompt.system}\n\nQuestion: ${prompt.user}\nRéponse:`;

      const response = await axios.post(
        this.inferenceApiUrl,
        {
          inputs    : fullPrompt,
          parameters: {
            max_new_tokens  : this.maxTokens,
            temperature     : this.temperature,
            top_p           : this.topP,
            do_sample       : true,
            return_full_text: false,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.huggingFaceToken}`,
            'Content-Type' : 'application/json',
          },
          timeout: this.timeout,
        }
      );

      const aiResponse = this.extractTextResponse(response.data);
      if (!aiResponse) throw new Error('Format de réponse invalide');

      console.log('[AI Assistant] ✅ Réponse Inference API reçue');
      return aiResponse.trim();

    } catch (error) {
      console.error('[AI Assistant] Erreur Inference API:', error.message);
      if (error.response?.status === 503) throw new Error('Modèle en chargement. Réessayez.');
      if (error.response?.status === 401) throw new Error('Token Hugging Face invalide');
      if (error.response?.status === 429) throw new Error('Limite HuggingFace atteinte. Réessayez.');
      if (error.response?.status === 403) throw new Error('Accès refusé. Vérifiez les permissions du token.');
      throw error;
    }
  }

  // ─────────────────────────────────────────────
  //  Hugging Face Space — fallback alternatif
  // ─────────────────────────────────────────────
  async getResponseFromSpace(userQuestion, context = {}) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.huggingFaceToken) {
        headers['Authorization'] = `Bearer ${this.huggingFaceToken}`;
      }

      const response = await axios.post(
        this.huggingFaceApiUrl,
        { question: userQuestion, ...context },
        { headers, timeout: this.timeout }
      );

      const aiResponse = response.data.reponse || response.data.response || response.data.answer;
      if (!aiResponse) throw new Error('Format de réponse AI invalide');

      console.log('[AI Assistant] ✅ Réponse Space reçue');
      return aiResponse;

    } catch (error) {
      console.error('[AI Assistant] Erreur Space:', error.message);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Service AI non disponible. Veuillez réessayer plus tard.');
      }
      throw error;
    }
  }

  // ─────────────────────────────────────────────
  //  Méthodes publiques pour les controllers
  // ─────────────────────────────────────────────

  /**
   * Réponse pour un client (avec son historique via Graph)
   */
  async getClientResponse(question, userInfo = {}) {
    return this.getResponse(question, {
      userType : 'client',
      userId   : userInfo.id   || null,
      userName : userInfo.name || null,
    });
  }

  /**
   * Réponse pour un agent SAV
   */
  async getAgentResponse(question, agentInfo = {}) {
    return this.getResponse(question, {
      userType : 'agent',
      agentId  : agentInfo.id       || null,
      agencyId : agentInfo.agencyId || null,
    });
  }

  /**
   * Enregistrer un feedback négatif pour l'auto-apprentissage
   */
  async saveFeedback(question, answer, rating, correction = null) {
    if (!process.env.PG_URL) return;
    try {
      const { Pool } = require('pg');
      if (!this._feedbackPool) {
        this._feedbackPool = new Pool({ connectionString: process.env.PG_URL });
      }
      await this._feedbackPool.query(
        `INSERT INTO chat_feedback (question, answer, rating, correction)
         VALUES ($1, $2, $3, $4)`,
        [question, answer, rating, correction]
      );
      console.log('[AI Assistant] 💾 Feedback sauvegardé');

      if (rating === -1 && correction && ragService) {
        await ragService.learnFromFeedbacks();
      }
    } catch (err) {
      console.error('[AI Assistant] Erreur sauvegarde feedback:', err.message);
    }
  }
}

module.exports = new AIAssistantService();