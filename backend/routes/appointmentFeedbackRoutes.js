const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/appointmentFeedbackController');
const historyController = require('../controllers/appointmentHistoryController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes de feedback/historique nécessitent une authentification
router.use(['/appointments', '/feedbacks'], authMiddleware);

// ── Feedback ───────────────────────────────────────────────
// Client peut soumettre un feedback
router.post('/appointments/:id/feedback', feedbackController.submitFeedback);

// Agent/Admin peuvent voir les feedbacks
router.get('/feedbacks', authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'), feedbackController.getFeedbacks);
router.get('/feedbacks/stats', authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'), feedbackController.getFeedbackStats);

// ── Historique ─────────────────────────────────────────────
// Historique d'un rendez-vous (client voit le sien, agent/admin voient tous)
router.get('/appointments/:id/history', historyController.getAppointmentHistory);

// Statistiques de durée (agent/admin uniquement)
router.get('/appointments/stats/duration', authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'), historyController.getDurationStats);

// Historique des annulations (agent/admin uniquement)
router.get('/appointments/cancellations/history', authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'), historyController.getCancellationHistory);

module.exports = router;
