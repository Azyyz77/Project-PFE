const express = require('express');
const router = express.Router();
const clientOrdersController = require('../controllers/clientOrdersController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent une authentification client
router.use(authMiddleware);
router.use(authorizeRoles('CLIENT'));

/**
 * @swagger
 * /api/client/orders:
 *   get:
 *     summary: Récupérer toutes les commandes du client
 *     tags: [Client Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes
 */
router.get('/', clientOrdersController.getMyOrders);

/**
 * @swagger
 * /api/client/orders/stats:
 *   get:
 *     summary: Statistiques des commandes du client
 *     tags: [Client Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques
 */
router.get('/stats', clientOrdersController.getOrdersStats);

/**
 * @swagger
 * /api/client/orders/{id}:
 *   get:
 *     summary: Détails d'une commande spécifique
 *     tags: [Client Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la commande
 */
router.get('/:id', clientOrdersController.getOrderDetails);

module.exports = router;
