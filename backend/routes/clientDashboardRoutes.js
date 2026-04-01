/**
 * ROUTES: Client Dashboard — REST API
 */

const express = require('express');
const router = express.Router();
const C = require('../controllers/clientDashboardController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification JWT
router.use(authMiddleware);

// ── Réclamations ────────────────────────────────────────────
router.get ('/complaints',               C.getComplaints);
router.post('/complaints',               C.submitComplaint);

// 404
router.use((req, res) =>
  res.status(404).json({ error: 'Route non trouvée', path: req.path })
);

module.exports = router;
