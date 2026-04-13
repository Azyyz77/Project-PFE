const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const aiAssistantController = require('../controllers/aiAssistantController');

/**
 * Routes pour l'assistant AI Chery
 * Toutes les routes nécessitent une authentification
 */

// Envoyer un message à l'assistant
router.post('/message', authMiddleware, aiAssistantController.sendMessage);

// Obtenir l'historique des conversations
router.get('/history', authMiddleware, aiAssistantController.getConversationHistory);

// Vérifier le statut du service AI
router.get('/status', authMiddleware, aiAssistantController.checkStatus);

module.exports = router;
