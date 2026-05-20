const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnosticController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

/**
 * Routes pour les diagnostics
 */

// Obtenir tous les diagnostics (avec filtres)
router.get('/',
  authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'),
  diagnosticController.getAllDiagnostics
);

// Obtenir un diagnostic par RDV ID
router.get('/rdv/:rdvId',
  authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'),
  diagnosticController.getDiagnosticByRDV
);

// Créer un diagnostic
router.post('/',
  authorizeRoles('AGENT', 'ADMIN'),
  diagnosticController.createDiagnostic
);

// Mettre à jour un diagnostic
router.put('/:id',
  authorizeRoles('AGENT', 'ADMIN'),
  diagnosticController.updateDiagnostic
);

// Ajouter un problème à un diagnostic
router.post('/:id/problemes',
  authorizeRoles('AGENT', 'ADMIN'),
  diagnosticController.addProbleme
);

// Retirer un problème d'un diagnostic
router.delete('/:id/problemes/:problemeId',
  authorizeRoles('AGENT', 'ADMIN'),
  diagnosticController.removeProbleme
);

module.exports = router;
