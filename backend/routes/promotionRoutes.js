const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes publiques
router.get('/active', promotionController.getActivePromotions);

// Routes admin
router.get('/', authMiddleware, authorizeRoles('ADMIN'), promotionController.getAllPromotions);
router.post('/', authMiddleware, authorizeRoles('ADMIN'), promotionController.createPromotion);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), promotionController.updatePromotion);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), promotionController.deletePromotion);

module.exports = router;
