/**
 * Routes pour la gestion des promotions véhicules
 */

const express = require('express');
const router = express.Router();
const vehiclePromotionController = require('../controllers/vehiclePromotionController');
const { authMiddleware, hasRole } = require('../middleware/authMiddleware');

// ============================================
// ROUTES PUBLIQUES (Clients) - NO AUTH
// ============================================

/**
 * @route   GET /api/vehicle-promotions/public/active
 * @desc    Obtenir toutes les promotions actives
 * @access  Public
 */
router.get(
  '/public/active',
  vehiclePromotionController.getActivePromotions
);

/**
 * @route   GET /api/vehicle-promotions/public/:id
 * @desc    Obtenir une promotion par ID (public)
 * @access  Public
 */
router.get(
  '/public/:id',
  vehiclePromotionController.getPromotionById
);

// ============================================
// ROUTES ADMIN - AUTH REQUIRED
// ============================================

/**
 * @route   GET /api/vehicle-promotions
 * @desc    Obtenir toutes les promotions (admin)
 * @access  Admin
 */
router.get(
  '/',
  authMiddleware,
  hasRole('ADMIN'),
  vehiclePromotionController.getAllPromotions
);

/**
 * @route   GET /api/vehicle-promotions/:id
 * @desc    Obtenir une promotion par ID (admin)
 * @access  Admin
 */
router.get(
  '/:id',
  authMiddleware,
  hasRole('ADMIN'),
  vehiclePromotionController.getPromotionById
);

/**
 * @route   POST /api/vehicle-promotions
 * @desc    Créer une nouvelle promotion
 * @access  Admin
 */
router.post(
  '/',
  authMiddleware,
  hasRole('ADMIN'),
  vehiclePromotionController.createPromotion
);

/**
 * @route   PUT /api/vehicle-promotions/:id
 * @desc    Mettre à jour une promotion
 * @access  Admin
 */
router.put(
  '/:id',
  authMiddleware,
  hasRole('ADMIN'),
  vehiclePromotionController.updatePromotion
);

/**
 * @route   DELETE /api/vehicle-promotions/:id
 * @desc    Supprimer (désactiver) une promotion
 * @access  Admin
 */
router.delete(
  '/:id',
  authMiddleware,
  hasRole('ADMIN'),
  vehiclePromotionController.deletePromotion
);

module.exports = router;
