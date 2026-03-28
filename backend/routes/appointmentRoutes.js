const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const appointmentController = require('../controllers/appointmentController');

router.use(authMiddleware);

/**
 * @swagger
 * /api/appointments/agencies:
 *   get:
 *     summary: Lister les agences disponibles
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des agences
 */
router.get('/agencies', appointmentController.getAgencies);

/**
 * @swagger
 * /api/appointments/slots:
 *   get:
 *     summary: Lister les créneaux disponibles pour une agence et une date
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: agenceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: 2026-03-16
 *     responses:
 *       200:
 *         description: Liste des créneaux
 */
router.get('/slots', appointmentController.getAvailableSlots);

/**
 * @swagger
 * /api/appointments/interventions:
 *   get:
 *     summary: Catalogue des types et sous-types d'intervention
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Catalogue interventions
 */
router.get('/interventions', appointmentController.getInterventionCatalog);

/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Historique des rendez-vous du client connecté
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 */
router.get('/my', appointmentController.getMyAppointments);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Créer un rendez-vous SAV
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicule_id, agence_id, date_heure]
 *             properties:
 *               vehicule_id:
 *                 type: integer
 *               agence_id:
 *                 type: integer
 *               date_heure:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               sous_type_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Rendez-vous créé
 */
router.post('/', appointmentController.createAppointment);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Mettre à jour le statut d'un rendez-vous (staff)
 *     tags: [Appointments]
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
 *             required: [statut]
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [PLANIFIE, CONFIRME, EN_COURS, TERMINE, ANNULE, NO_SHOW]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Obtenir les détails d'un rendez-vous
 *     tags: [Appointments]
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
 *         description: Détails du rendez-vous
 *       404:
 *         description: Rendez-vous non trouvé
 */
router.get('/:id', appointmentController.getAppointmentDetails);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Annuler un rendez-vous
 *     tags: [Appointments]
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
 *               raison:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rendez-vous annulé
 */
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;
