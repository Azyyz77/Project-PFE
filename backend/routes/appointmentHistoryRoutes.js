const express = require('express');
const router = express.Router();
const appointmentHistoryController = require('../controllers/appointmentHistoryController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

/**
 * @swagger
 * /api/appointments/:id/history:
 *   get:
 *     summary: Récupérer l'historique d'un rendez-vous
 *     tags: [AppointmentHistory]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/history', authMiddleware, appointmentHistoryController.getAppointmentHistory);

/**
 * @swagger
 * /api/appointments/:id/history:
 *   post:
 *     summary: Ajouter une entrée dans l'historique
 *     tags: [AppointmentHistory]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/history', authMiddleware, authorizeRoles('AGENT', 'ADMIN'), appointmentHistoryController.addHistoryEntry);

/**
 * @swagger
 * /api/appointments/history/recent:
 *   get:
 *     summary: Récupérer l'historique récent (Admin/Agent)
 *     tags: [AppointmentHistory]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history/recent', authMiddleware, authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'), appointmentHistoryController.getRecentHistory);

/**
 * @swagger
 * /api/appointments/history/stats:
 *   get:
 *     summary: Statistiques sur l'historique (Admin/Direction)
 *     tags: [AppointmentHistory]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history/stats', authMiddleware, authorizeRoles('ADMIN', 'DIRECTION'), appointmentHistoryController.getHistoryStats);

/**
 * @swagger
 * /api/appointments/history/user/:userId:
 *   get:
 *     summary: Historique des actions d'un utilisateur
 *     tags: [AppointmentHistory]
 *     security:
 *       - bearerAuth: []
 */
router.get('/history/user/:userId', authMiddleware, authorizeRoles('ADMIN', 'DIRECTION'), appointmentHistoryController.getUserHistory);

/**
 * @swagger
 * /api/appointments/:id/history/:historyId:
 *   delete:
 *     summary: Supprimer une entrée d'historique (Admin)
 *     tags: [AppointmentHistory]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id/history/:historyId', authMiddleware, authorizeRoles('ADMIN'), appointmentHistoryController.deleteHistoryEntry);

module.exports = router;
