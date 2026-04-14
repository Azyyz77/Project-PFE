const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes client
router.post('/', authMiddleware, feedbackController.submitFeedback);

// Routes admin/agent
router.get('/', authMiddleware, authorizeRoles('ADMIN', 'AGENT', 'DIRECTION'), feedbackController.getAllFeedbacks);
router.get('/stats', authMiddleware, authorizeRoles('ADMIN', 'DIRECTION'), feedbackController.getFeedbackStats);

module.exports = router;
