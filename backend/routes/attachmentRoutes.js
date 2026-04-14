const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Routes pour tous les utilisateurs authentifiés
router.post('/upload', authMiddleware, attachmentController.uploadAttachment);
router.get('/:entite_type/:entite_id', authMiddleware, attachmentController.getAttachments);
router.delete('/:id', authMiddleware, attachmentController.deleteAttachment);

module.exports = router;
