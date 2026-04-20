const express = require('express');
const router = express.Router();
const predefinedProblemController = require('../controllers/predefinedProblemController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

/**
 * Routes accessibles aux agents et admins
 */

// Obtenir tous les problèmes (avec filtres)
router.get('/', 
  requirePermission('DIAGNOSTICS', 'READ'),
  predefinedProblemController.getProblems
);

// Obtenir les catégories
router.get('/categories',
  requirePermission('DIAGNOSTICS', 'READ'),
  predefinedProblemController.getCategories
);

// Obtenir un problème par ID
router.get('/:id',
  requirePermission('DIAGNOSTICS', 'READ'),
  predefinedProblemController.getProblemById
);

/**
 * Routes réservées aux admins
 */

// Créer un nouveau problème
router.post('/',
  requirePermission('DIAGNOSTICS', 'CREATE'),
  predefinedProblemController.createProblem
);

// Mettre à jour un problème
router.put('/:id',
  requirePermission('DIAGNOSTICS', 'UPDATE'),
  predefinedProblemController.updateProblem
);

// Supprimer un problème (soft delete)
router.delete('/:id',
  requirePermission('DIAGNOSTICS', 'DELETE'),
  predefinedProblemController.deleteProblem
);

// Obtenir les statistiques d'utilisation
router.get('/stats/usage',
  requirePermission('DIAGNOSTICS', 'READ'),
  predefinedProblemController.getProblemStats
);

module.exports = router;
