const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/interventionCatalogController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent une authentification (CLIENT, AGENT, ADMIN, DIRECTION)
router.use(authMiddleware);

// Routes du catalogue
router.get('/types', catalogController.getInterventionTypes);
router.get('/subtypes', catalogController.getSubTypes);
router.get('/packages', catalogController.getPackages);
router.get('/packages/:id', catalogController.getPackageDetails);
router.get('/stats', catalogController.getCatalogStats);

module.exports = router;
