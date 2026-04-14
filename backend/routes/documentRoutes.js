const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes client
router.get('/', authMiddleware, documentController.getAllDocuments);
router.get('/category/:categorie', authMiddleware, documentController.getDocumentsByCategory);

// Routes admin
router.post('/', authMiddleware, authorizeRoles('ADMIN'), documentController.createDocument);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), documentController.updateDocument);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), documentController.deleteDocument);

module.exports = router;
