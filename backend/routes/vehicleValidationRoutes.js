const express = require('express');
const router = express.Router();
const vehicleValidationController = require('../controllers/vehicleValidationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);
router.use(authorizeRoles('AGENT', 'ADMIN'));

/**
 * @swagger
 * /api/agent/vehicles/pending:
 *   get:
 *     summary: Obtenir les véhicules en attente de validation
 *     tags: [Agent - Validation Véhicules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des véhicules en attente
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/pending', vehicleValidationController.getPendingVehicles);

/**
 * @swagger
 * /api/agent/vehicles:
 *   get:
 *     summary: Obtenir tous les véhicules avec filtres
 *     tags: [Agent - Validation Véhicules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDE, REFUSE]
 *       - in: query
 *         name: client_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des véhicules
 */
router.get('/', vehicleValidationController.getAllVehicles);

/**
 * @swagger
 * /api/agent/vehicles/stats:
 *   get:
 *     summary: Obtenir les statistiques de validation
 *     tags: [Agent - Validation Véhicules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques de validation
 */
router.get('/stats', vehicleValidationController.getValidationStats);

/**
 * @swagger
 * /api/agent/vehicles/{id}/validate:
 *   post:
 *     summary: Valider un véhicule
 *     tags: [Agent - Validation Véhicules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentaire:
 *                 type: string
 *     responses:
 *       200:
 *         description: Véhicule validé
 *       400:
 *         description: Véhicule déjà traité
 *       404:
 *         description: Véhicule non trouvé
 */
router.post('/:id/validate', vehicleValidationController.validateVehicle);

/**
 * @swagger
 * /api/agent/vehicles/{id}/reject:
 *   post:
 *     summary: Refuser un véhicule
 *     tags: [Agent - Validation Véhicules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - raison
 *             properties:
 *               raison:
 *                 type: string
 *                 description: Raison du refus
 *     responses:
 *       200:
 *         description: Véhicule refusé
 *       400:
 *         description: Raison manquante ou véhicule déjà traité
 *       404:
 *         description: Véhicule non trouvé
 */
router.post('/:id/reject', vehicleValidationController.rejectVehicle);

module.exports = router;
