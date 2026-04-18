const express = require('express');
const router = express.Router();
const vehicleHistoryController = require('../controllers/vehicleHistoryController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

/**
 * @swagger
 * /api/vehicles/{id}/history:
 *   get:
 *     summary: Obtenir l'historique complet d'un véhicule
 *     tags: [Véhicules - Historique]
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
 *         description: Historique du véhicule
 */
router.get('/:id/history', vehicleHistoryController.getVehicleHistory);

/**
 * @swagger
 * /api/vehicles/{id}/interventions:
 *   get:
 *     summary: Obtenir les interventions d'un véhicule
 *     tags: [Véhicules - Historique]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Liste des interventions
 */
router.get('/:id/interventions', vehicleHistoryController.getVehicleInterventions);

/**
 * @swagger
 * /api/vehicles/{id}/appointments:
 *   get:
 *     summary: Obtenir les rendez-vous d'un véhicule
 *     tags: [Véhicules - Historique]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 */
router.get('/:id/appointments', vehicleHistoryController.getVehicleAppointments);

/**
 * @swagger
 * /api/vehicles/{id}/history/export:
 *   get:
 *     summary: Exporter l'historique d'un véhicule
 *     tags: [Véhicules - Historique]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, pdf, excel]
 *           default: json
 *     responses:
 *       200:
 *         description: Historique exporté
 */
router.get('/:id/history/export', vehicleHistoryController.exportHistory);

module.exports = router;
