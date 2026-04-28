/**
 * Routes pour la gestion des ouvriers et affectations
 */

const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { hasRole } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// ============================================
// ROUTES OUVRIERS
// ============================================

/**
 * @route   GET /api/workers
 * @desc    Obtenir tous les ouvriers (Admin uniquement)
 * @access  Admin
 */
router.get(
  '/',
  hasRole('ADMIN'),
  workerController.getAllWorkers
);

/**
 * @route   GET /api/workers/agency/:agenceId
 * @desc    Obtenir tous les ouvriers d'une agence
 * @access  Agent, Admin
 */
router.get(
  '/agency/:agenceId',
  hasRole('AGENT', 'ADMIN'),
  workerController.getWorkersByAgency
);

/**
 * @route   POST /api/workers
 * @desc    Créer un nouvel ouvrier
 * @access  Agent, Admin
 */
router.post(
  '/',
  hasRole('AGENT', 'ADMIN'),
  workerController.createWorker
);

/**
 * @route   GET /api/workers/agency/:agenceId/available
 * @desc    Obtenir les ouvriers disponibles pour une date/heure
 * @access  Agent, Admin
 */
router.get(
  '/agency/:agenceId/available',
  hasRole('AGENT', 'ADMIN'),
  workerController.getAvailableWorkers
);

/**
 * @route   GET /api/workers/agency/:agenceId/assignments
 * @desc    Obtenir toutes les affectations d'une agence
 * @access  Agent, Admin
 */
router.get(
  '/agency/:agenceId/assignments',
  hasRole('AGENT', 'ADMIN'),
  workerController.getAgencyAssignments
);

/**
 * @route   GET /api/workers/agency/:agenceId/statistics
 * @desc    Obtenir les statistiques des ouvriers
 * @access  Agent, Admin
 */
router.get(
  '/agency/:agenceId/statistics',
  hasRole('AGENT', 'ADMIN'),
  workerController.getWorkerStatistics
);

// ============================================
// ROUTES AFFECTATIONS
// ============================================

/**
 * @route   GET /api/workers/assignments
 * @desc    Obtenir toutes les affectations (Admin uniquement)
 * @access  Admin
 */
router.get(
  '/assignments',
  hasRole('ADMIN'),
  workerController.getAllAssignments
);

/**
 * @route   POST /api/workers/assignments
 * @desc    Affecter un ouvrier à un rendez-vous
 * @access  Agent, Admin
 */
router.post(
  '/assignments',
  hasRole('AGENT', 'ADMIN'),
  workerController.assignWorkerToAppointment
);

/**
 * @route   GET /api/workers/:ouvrierId/assignments
 * @desc    Obtenir les affectations d'un ouvrier
 * @access  Agent, Admin
 */
router.get(
  '/:ouvrierId/assignments',
  hasRole('AGENT', 'ADMIN'),
  workerController.getWorkerAssignments
);

/**
 * @route   PUT /api/workers/assignments/:assignmentId
 * @desc    Mettre à jour le statut d'une affectation
 * @access  Agent, Admin
 */
router.put(
  '/assignments/:assignmentId',
  hasRole('AGENT', 'ADMIN'),
  workerController.updateAssignmentStatus
);

module.exports = router;
