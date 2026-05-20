const express = require('express');
const router = express.Router();
const predefinedProblemController = require('../controllers/predefinedProblemController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

/**
 * Routes accessibles aux agents et admins
 */

// Obtenir tous les problèmes (avec filtres)
router.get('/', 
  authorizeRoles('AGENT', 'ADMIN'),
  predefinedProblemController.getProblems
);

// Obtenir les catégories
router.get('/categories',
  authorizeRoles('AGENT', 'ADMIN'),
  predefinedProblemController.getCategories
);

// Obtenir un problème par ID
router.get('/:id',
  authorizeRoles('AGENT', 'ADMIN'),
  predefinedProblemController.getProblemById
);

/**
 * Routes réservées aux admins
 */

// Créer un nouveau problème
router.post('/',
  authorizeRoles('ADMIN'),
  predefinedProblemController.createProblem
);

// Mettre à jour un problème
router.put('/:id',
  authorizeRoles('ADMIN'),
  predefinedProblemController.updateProblem
);

// Supprimer un problème (soft delete)
router.delete('/:id',
  authorizeRoles('ADMIN'),
  predefinedProblemController.deleteProblem
);

// Obtenir les statistiques d'utilisation
router.get('/stats/usage',
  authorizeRoles('AGENT', 'ADMIN'),
  predefinedProblemController.getProblemStats
);

module.exports = router;
