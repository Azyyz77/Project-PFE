const express = require('express');
const router = express.Router();
const informationController = require('../controllers/informationController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// ============================================================================
// ROUTES PUBLIQUES (Clients)
// ============================================================================

// Sections
router.get('/public/sections', informationController.getActiveSections);
router.get('/public/sections/:slug', informationController.getSectionBySlug);

// Contenus
router.get('/public/sections/:sectionId/contents', informationController.getContentsBySection);

// Documents
router.get('/public/documents', informationController.getAllDocuments);
router.get('/public/sections/:sectionId/documents', informationController.getDocumentsBySection);
router.post('/public/documents/:id/download', informationController.incrementDownloadCount);

// ============================================================================
// ROUTES ADMIN (Gestion)
// ============================================================================

// Sections - Admin
router.get('/admin/sections', authMiddleware, authorizeRoles('ADMIN'), informationController.getAllSections);
router.post('/admin/sections', authMiddleware, authorizeRoles('ADMIN'), informationController.createSection);
router.put('/admin/sections/:id', authMiddleware, authorizeRoles('ADMIN'), informationController.updateSection);
router.delete('/admin/sections/:id', authMiddleware, authorizeRoles('ADMIN'), informationController.deleteSection);

// Contenus - Admin
router.get('/admin/contents', authMiddleware, authorizeRoles('ADMIN'), informationController.getAllContents);
router.post('/admin/contents', authMiddleware, authorizeRoles('ADMIN'), informationController.createContent);
router.put('/admin/contents/:id', authMiddleware, authorizeRoles('ADMIN'), informationController.updateContent);
router.delete('/admin/contents/:id', authMiddleware, authorizeRoles('ADMIN'), informationController.deleteContent);

// Documents - Admin
router.post('/admin/documents', authMiddleware, authorizeRoles('ADMIN'), informationController.createDocument);
router.put('/admin/documents/:id', authMiddleware, authorizeRoles('ADMIN'), informationController.updateDocument);
router.delete('/admin/documents/:id', authMiddleware, authorizeRoles('ADMIN'), informationController.deleteDocument);

module.exports = router;
