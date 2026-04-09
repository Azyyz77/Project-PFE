const express = require('express');
const router = express.Router();
const adminMessagesController = require('../controllers/adminMessagesController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Routes pour tous les utilisateurs authentifiés
router.use(authMiddleware);

router.get('/', adminMessagesController.getUserNotifications);
router.get('/unread-count', adminMessagesController.getUnreadCount);
router.put('/:id/read', adminMessagesController.markAsRead);
router.put('/mark-all-read', adminMessagesController.markAllAsRead);

module.exports = router;
