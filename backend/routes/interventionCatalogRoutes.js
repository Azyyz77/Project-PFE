const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/interventionCatalogController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const cache = require('../middleware/cache');

// Toutes les routes nécessitent une authentification (CLIENT, AGENT, ADMIN, DIRECTION)
router.use(authMiddleware);

// Routes du catalogue
router.get('/', cache(600), catalogController.getInterventionTypes);
router.get('/types', cache(600), catalogController.getInterventionTypes);
router.get('/subtypes', cache(600), catalogController.getSubTypes);
router.get('/packages', cache(600), catalogController.getPackages);
router.get('/packages/:id', cache(600), catalogController.getPackageDetails);
router.get('/stats', cache(600), catalogController.getCatalogStats);

module.exports = router;
