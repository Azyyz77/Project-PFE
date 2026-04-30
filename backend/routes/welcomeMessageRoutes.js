/**
 * Routes pour la gestion des messages d'accueil
 */

const express = require('express');
const router = express.Router();
const welcomeMessageController = require('../controllers/welcomeMessageController');
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');

// ============================================
// ROUTES AUTHENTIFIÉES (Clients)
// ============================================

router.use(authMiddleware);

/**
 * @route   GET /api/welcome-messages/active
 * @desc    Obtenir les messages actifs pour l'utilisateur connecté
 * @access  Authenticated
 */
router.get(
  '/active',
  welcomeMessageController.getActiveMessages
);

/**
 * @route   POST /api/welcome-messages/:id/read
 * @desc    Marquer un message comme lu
 * @access  Authenticated
 */
router.post(
  '/:id/read',
  welcomeMessageController.markAsRead
);

// ============================================
// ROUTES ADMIN
// ============================================

/**
 * @route   GET /api/welcome-messages
 * @desc    Obtenir tous les messages (admin)
 * @access  Admin
 */
router.get(
  '/',
  hasRole('ADMIN'),
  welcomeMessageController.getAllMessages
);

/**
 * @route   GET /api/welcome-messages/:id
 * @desc    Obtenir un message par ID
 * @access  Admin
 */
router.get(
  '/:id',
  hasRole('ADMIN'),
  welcomeMessageController.getMessageById
);

/**
 * @route   POST /api/welcome-messages
 * @desc    Créer un nouveau message
 * @access  Admin
 */
router.post(
  '/',
  hasRole('ADMIN'),
  welcomeMessageController.createMessage
);

/**
 * @route   PUT /api/welcome-messages/:id
 * @desc    Mettre à jour un message
 * @access  Admin
 */
router.put(
  '/:id',
  hasRole('ADMIN'),
  welcomeMessageController.updateMessage
);

/**
 * @route   DELETE /api/welcome-messages/:id
 * @desc    Supprimer (désactiver) un message
 * @access  Admin
 */
router.delete(
  '/:id',
  hasRole('ADMIN'),
  welcomeMessageController.deleteMessage
);

module.exports = router;
