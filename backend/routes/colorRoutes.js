const express = require('express');
const router = express.Router();
const colorController = require('../controllers/colorController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes publiques/client
router.get('/', authMiddleware, colorController.getAllColors);

// Routes admin
router.post('/', authMiddleware, authorizeRoles('ADMIN'), colorController.createColor);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), colorController.updateColor);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), colorController.deleteColor);

module.exports = router;
