/**
 * ROUTES: Agent Planning
 * Mounted at /api/agent/planning
 */

const express = require('express');
const router = express.Router();
const PlanningController = require('../controllers/planningController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// All routes require JWT authentication
router.use(authMiddleware);

const agentOrAdmin = authorizeRoles('AGENT', 'ADMIN', 'DIRECTION');

// GET /api/agent/planning
// Query: agenceId (optional), dateDebut, dateFin
router.get('/', agentOrAdmin, PlanningController.getPlanning);

// GET /api/agent/planning/agencies
router.get('/agencies', agentOrAdmin, PlanningController.getAgencies);

// GET /api/agent/planning/agent/:agentId?date=YYYY-MM-DD
router.get('/agent/:agentId', agentOrAdmin, PlanningController.getAgentPlanning);

// PUT /api/agent/planning/rdv/:id/move
router.put('/rdv/:id/move', agentOrAdmin, PlanningController.updateSlot);

// 404
router.use((req, res) =>
  res.status(404).json({ error: 'Route non trouvée', path: req.path })
);

module.exports = router;
