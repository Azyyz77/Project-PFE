const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const { upload, handleMulterError, validateEntityParams } = require('../middleware/uploadMiddleware');
const { authMiddleware } = require('../middleware/authMiddleware');

// Upload de fichiers (nécessite authentification)
router.post('/upload', 
  authMiddleware,
  upload.array('files', 5), // Maximum 5 fichiers, champ 'files'
  handleMulterError,
  validateEntityParams,
  attachmentController.uploadFile
);

// Télécharger une pièce jointe (gère l'auth dans le contrôleur pour les tokens query)
router.get('/:id/download', attachmentController.downloadAttachment);

// Les autres routes nécessitent une authentification
router.use(authMiddleware);

// Récupérer les pièces jointes d'une entité
router.get('/:entiteType/:entiteId', attachmentController.getAttachments);

// Supprimer une pièce jointe
router.delete('/:id', attachmentController.deleteAttachment);

// Statistiques des pièces jointes (admin seulement)
router.get('/stats/overview', (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé'
    });
  }
  next();
}, attachmentController.getAttachmentStats);

module.exports = router;