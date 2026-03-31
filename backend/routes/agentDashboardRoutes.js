/**
 * ROUTES: Agent Dashboard — REST API complète
 */

const express  = require('express');
const router   = express.Router();
const C        = require('../controllers/agentDashboardController');
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification JWT
router.use(authMiddleware);

const agent = hasRole('AGENT', 'ADMIN');

// ── Dashboard ──────────────────────────────────────────────
router.get('/summary', C.getSummary);

// ── Rendez-vous ────────────────────────────────────────────
router.get  ('/appointments',                          C.getAppointments);
router.put  ('/appointments/:appointmentId/confirm',   agent, C.confirmAppointment);
router.put  ('/appointments/:appointmentId/update',    agent, C.updateAppointment);
router.put  ('/appointments/:appointmentId/start',     agent, C.startIntervention);
router.put  ('/appointments/:appointmentId/finish',    agent, C.finishIntervention);
router.put  ('/appointments/:appointmentId/cancel',    agent, C.cancelAppointment);

// ── Clients ────────────────────────────────────────────────
router.get('/clients/:clientId', C.getClientProfile);

// ── Véhicules ──────────────────────────────────────────────
router.get('/vehicles',                           C.getAllVehicles);
router.get('/vehicles/to-validate',               C.getVehiclesToValidate);
router.put('/vehicles/:vehicleId/validate', agent, C.validateVehicle);
router.put('/vehicles/:vehicleId/reject',   agent, C.rejectVehicle);

// ── Réclamations ───────────────────────────────────────────
router.get ('/complaints',                                C.getComplaints);
router.post('/complaints/:complaintId/answer',    agent,  C.answerComplaint);
router.put ('/complaints/:complaintId/status',    agent,  C.updateComplaintStatus);
router.put ('/complaints/:complaintId/resolve',   agent,  C.resolveComplaint);

// ── Notifications ──────────────────────────────────────────
router.get('/notifications',                             C.getNotifications);
router.put('/notifications/:notifId/read',        agent, C.markNotificationRead);
router.put('/notifications/read-all',             agent, C.markAllNotificationsRead);

// ── Statistiques ───────────────────────────────────────────
router.get('/statistics', C.getStatistics);

// 404
router.use((req, res) =>
  res.status(404).json({ error: 'Route non trouvée', path: req.path })
);

module.exports = router;
