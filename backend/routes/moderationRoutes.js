const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Middleware pour vérifier les permissions de modération (AGENT ou ADMIN)
const requireModerationPermission = (req, res, next) => {
  if (!req.user || !['AGENT', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Permissions de modération requises.'
    });
  }
  next();
};

// Récupérer les fichiers en attente de modération
router.get('/pending', requireModerationPermission, moderationController.getPendingFiles);

// Approuver un fichier
router.post('/:id/approve', requireModerationPermission, moderationController.approveFile);

// Rejeter un fichier
router.post('/:id/reject', requireModerationPermission, moderationController.rejectFile);

// Obtenir l'historique de modération
router.get('/history', requireModerationPermission, moderationController.getModerationHistory);

// Statistiques de modération (ADMIN seulement)
router.get('/stats', (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé. Permissions administrateur requises.'
    });
  }
  next();
}, moderationController.getModerationStats);

// Obtenir les détails d'un fichier pour modération
router.get('/file/:id', requireModerationPermission, moderationController.getFileDetails);

module.exports = router;