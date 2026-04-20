const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnosticController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

/**
 * Routes pour les diagnostics
 */

// Obtenir tous les diagnostics (avec filtres)
router.get('/',
  requirePermission('DIAGNOSTICS', 'READ'),
  diagnosticController.getAllDiagnostics
);

// Obtenir un diagnostic par RDV ID
router.get('/rdv/:rdvId',
  requirePermission('DIAGNOSTICS', 'READ'),
  diagnosticController.getDiagnosticByRDV
);

// Créer un diagnostic
router.post('/',
  requirePermission('DIAGNOSTICS', 'CREATE'),
  diagnosticController.createDiagnostic
);

// Mettre à jour un diagnostic
router.put('/:id',
  requirePermission('DIAGNOSTICS', 'UPDATE'),
  diagnosticController.updateDiagnostic
);

// Ajouter un problème à un diagnostic
router.post('/:id/problemes',
  requirePermission('DIAGNOSTICS', 'UPDATE'),
  diagnosticController.addProbleme
);

// Retirer un problème d'un diagnostic
router.delete('/:id/problemes/:problemeId',
  requirePermission('DIAGNOSTICS', 'UPDATE'),
  diagnosticController.removeProbleme
);

module.exports = router;
