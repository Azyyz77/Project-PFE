/**
 * ROUTES: Agency Management (Admin)
 */

const express = require('express');
const router = express.Router();
const AgencyController = require('../controllers/agencyController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Middleware: Admin only
const adminOnly = [authMiddleware, authorizeRoles('ADMIN', 'DIRECTION')];

// GET /api/admin/agencies - Liste des agences
router.get('/', adminOnly, AgencyController.getAgencies);

// GET /api/admin/agencies/:id - Détails d'une agence
router.get('/:id', adminOnly, AgencyController.getAgency);

// POST /api/admin/agencies - Créer une agence
router.post('/', adminOnly, AgencyController.createAgency);

// PUT /api/admin/agencies/:id - Modifier une agence
router.put('/:id', adminOnly, AgencyController.updateAgency);

// DELETE /api/admin/agencies/:id - Supprimer une agence
router.delete('/:id', adminOnly, AgencyController.deleteAgency);

// GET /api/admin/agencies/:id/stats - Statistiques d'une agence
router.get('/:id/stats', adminOnly, AgencyController.getAgencyStats);

module.exports = router;
