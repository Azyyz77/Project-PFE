/**
 * ROUTES: Agent Dashboard — REST API complète
 */

const express  = require('express');
const router   = express.Router();
const C        = require('../controllers/agentDashboardController');
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent une authentification JWT
router.use(authMiddleware);

const agentAuth = authorizeRoles('AGENT', 'ADMIN');

// ── Dashboard ──────────────────────────────────────────────
router.get('/summary', C.getSummary);

// ── Rendez-vous ────────────────────────────────────────────
router.get  ('/appointments',                          C.getAppointments);
router.put  ('/appointments/:appointmentId/confirm',   agentAuth, C.confirmAppointment);
router.put  ('/appointments/:appointmentId/update',    agentAuth, C.updateAppointment);
router.put  ('/appointments/:appointmentId/start',     agentAuth, C.startIntervention);
router.put  ('/appointments/:appointmentId/finish',    agentAuth, C.finishIntervention);
router.put  ('/appointments/:appointmentId/cancel',    agentAuth, C.cancelAppointment);

// ── Clients ────────────────────────────────────────────────
router.get('/clients/:clientId', C.getClientProfile);

// ── Véhicules ──────────────────────────────────────────────
router.get('/vehicles',                           C.getAllVehicles);
router.get('/vehicles/to-validate',               C.getVehiclesToValidate);
router.put('/vehicles/:vehicleId/validate', agentAuth, C.validateVehicle);
router.put('/vehicles/:vehicleId/reject',   agentAuth, C.rejectVehicle);

// ── Réclamations ───────────────────────────────────────────
router.get ('/complaints',                                C.getComplaints);
router.post('/complaints/:complaintId/answer',    agentAuth,  C.answerComplaint);
router.put ('/complaints/:complaintId/status',    agentAuth,  C.updateComplaintStatus);
router.put ('/complaints/:complaintId/resolve',   agentAuth,  C.resolveComplaint);

// ── Notifications ──────────────────────────────────────────
router.get('/notifications',                             C.getNotifications);
router.put('/notifications/:notifId/read',        agentAuth, C.markNotificationRead);
router.put('/notifications/read-all',             agentAuth, C.markAllNotificationsRead);

// ── Statistiques ───────────────────────────────────────────
router.get('/statistics', C.getStatistics);

// 404
router.use((req, res) =>
  res.status(404).json({ error: 'Route non trouvée', path: req.path })
);

module.exports = router;
