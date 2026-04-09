const express = require('express');
const router = express.Router();
const adminMessagesController = require('../controllers/adminMessagesController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes admin (publication de messages)
router.post('/publish', authMiddleware, authorizeRoles('ADMIN'), adminMessagesController.publishMessage);
router.get('/recent', authMiddleware, authorizeRoles('ADMIN'), adminMessagesController.getRecentMessages);

module.exports = router;
