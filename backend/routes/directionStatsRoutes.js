const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  getAgencyStats,
  getGlobalStats,
  getRevenueStats,
  getSatisfactionStats,
  getPerformanceStats,
  getBillingStats,
  exportStats
} = require('../controllers/directionStatsController');

/**
 * Routes pour les statistiques de direction
 * Toutes les routes nécessitent le rôle ADMIN ou DIRECTION
 */

// Statistiques par agence
router.get(
  '/agencies',
  authMiddleware,
  authorizeRoles('ADMIN', 'DIRECTION'),
  getAgencyStats
);

// Statistiques globales
router.get(
  '/global',
  authMiddleware,
  authorizeRoles('ADMIN', 'DIRECTION'),
  getGlobalStats
);

// Statistiques de revenus
router.get(
  '/revenue',
  authMiddleware,
  authorizeRoles('ADMIN', 'DIRECTION'),
  getRevenueStats
);

// Statistiques de satisfaction client
router.get(
  '/satisfaction',
  authMiddleware,
  authorizeRoles('ADMIN', 'DIRECTION'),
  getSatisfactionStats
);

// Statistiques de performance des agents
router.get(
  '/performance',
  authMiddleware,
  authorizeRoles('ADMIN', 'DIRECTION'),
  getPerformanceStats
);

// Statistiques de facturation
router.get(
  '/billing',
  authMiddleware,
  authorizeRoles('ADMIN', 'DIRECTION'),
  getBillingStats
);

// Export des statistiques
router.get(
  '/export',
  authMiddleware,
  authorizeRoles('ADMIN', 'DIRECTION'),
  exportStats
);

module.exports = router;
