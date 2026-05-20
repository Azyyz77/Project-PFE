const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');

// Routes client
router.get('/', authMiddleware, documentController.getAllDocuments);
router.get('/category/:categorie', authMiddleware, documentController.getDocumentsByCategory);
router.get('/:id/download', documentController.downloadDocument);

// Routes admin
router.post(
	'/upload',
	authMiddleware,
	authorizeRoles('ADMIN'),
	upload.single('file'),
	handleMulterError,
	documentController.uploadDocument
);
router.post('/', authMiddleware, authorizeRoles('ADMIN'), documentController.createDocument);
router.put(
	'/:id',
	authMiddleware,
	authorizeRoles('ADMIN'),
	upload.single('file'),
	handleMulterError,
	documentController.updateDocument
);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), documentController.deleteDocument);

module.exports = router;
