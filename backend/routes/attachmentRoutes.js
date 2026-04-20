const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const { upload, handleMulterError, validateEntityParams } = require('../middleware/uploadMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Upload de fichiers
router.post('/upload', 
  upload.array('files', 5), // Maximum 5 fichiers, champ 'files'
  handleMulterError,
  validateEntityParams,
  attachmentController.uploadFile
);

// Récupérer les pièces jointes d'une entité
router.get('/:entiteType/:entiteId', attachmentController.getAttachments);

// Supprimer une pièce jointe
router.delete('/:id', attachmentController.deleteAttachment);

// Télécharger une pièce jointe
router.get('/:id/download', attachmentController.downloadAttachment);

// Statistiques des pièces jointes (admin seulement)
router.get('/stats/overview', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé'
    });
  }
  next();
}, attachmentController.getAttachmentStats);

module.exports = router;