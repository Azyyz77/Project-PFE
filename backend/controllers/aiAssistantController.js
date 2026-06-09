const aiAssistantService = require('../services/aiAssistantService');

/**
 * Contrôleur pour l'assistant AI
 */

/**
 * Envoyer un message à l'assistant AI
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, context } = req.body;
    const user = req.user;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        error: 'Message requis',
        message: 'Veuillez fournir un message'
      });
    }

    console.log(`[AI Controller] Message de l'utilisateur ${user.id}:`, message);

    // Préparer le contexte utilisateur
    const userContext = {
      userId: user.id,
      userType: user.role,
      userName: user.name || user.email,
      ...context
    };

    // Obtenir la réponse de l'AI
    const aiResponse = await aiAssistantService.getResponse(message, userContext);

    if (aiResponse && typeof aiResponse === 'object' && aiResponse.reply) {
      res.json({
        success: true,
        reply: aiResponse.reply,
        rag: aiResponse.rag || null,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        reply: aiResponse,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('[AI Controller] Erreur:', error);
    res.status(500).json({
      error: 'Erreur du service AI',
      message: error.message || 'Impossible d\'obtenir une réponse de l\'assistant'
    });
  }
};

/**
 * Obtenir l'historique des conversations (à implémenter si nécessaire)
 */
exports.getConversationHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Implémenter la récupération de l'historique depuis la base de données
    
    res.json({
      success: true,
      conversations: [],
      message: 'Fonctionnalité en développement'
    });

  } catch (error) {
    console.error('[AI Controller] Erreur historique:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Impossible de récupérer l\'historique'
    });
  }
};

/**
 * Vérifier le statut du service AI
 */
exports.checkStatus = async (req, res) => {
  try {
    // Test simple avec une question basique
    const testResponse = await aiAssistantService.getResponse('test');
    
    res.json({
      success: true,
      status: 'online',
      message: 'Service AI opérationnel'
    });

  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'offline',
      message: 'Service AI non disponible',
      error: error.message
    });
  }
};
