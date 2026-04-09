const express = require('express');
const router = express.Router();
const adminCatalogController = require('../controllers/adminCatalogController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent une authentification et le rôle ADMIN
router.use(authMiddleware);
router.use(authorizeRoles('ADMIN'));

// Types d'intervention
router.get('/intervention-types', adminCatalogController.getInterventionTypes);
router.post('/intervention-types', adminCatalogController.createInterventionType);
router.put('/intervention-types/:id', adminCatalogController.updateInterventionType);
router.delete('/intervention-types/:id', adminCatalogController.deleteInterventionType);

// Sous-types d'intervention
router.get('/intervention-types/:typeId/sub-types', adminCatalogController.getSubTypes);
router.post('/sub-types', adminCatalogController.createSubType);
router.put('/sub-types/:id', adminCatalogController.updateSubType);
router.delete('/sub-types/:id', adminCatalogController.deleteSubType);

// Marques
router.get('/brands', adminCatalogController.getBrands);
router.post('/brands', adminCatalogController.createBrand);
router.get('/brands/:brandId/models', adminCatalogController.getBrandModels);
router.post('/models', adminCatalogController.createModel);

module.exports = router;
