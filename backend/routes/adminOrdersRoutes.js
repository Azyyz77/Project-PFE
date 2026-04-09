const express = require('express');
const router = express.Router();
const adminOrdersController = require('../controllers/adminOrdersController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(authMiddleware);
router.use(authorizeRoles('ADMIN', 'DIRECTION'));

router.get('/', adminOrdersController.getAllOrders);
router.get('/stats', adminOrdersController.getOrdersStats);

module.exports = router;
