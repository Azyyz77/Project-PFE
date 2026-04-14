const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes client
router.get('/', authMiddleware, packageController.getAllPackages);
router.post('/suggest', authMiddleware, packageController.suggestPackages);

// Routes admin
router.post('/', authMiddleware, authorizeRoles('ADMIN'), packageController.createPackage);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), packageController.updatePackage);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), packageController.deletePackage);

module.exports = router;
