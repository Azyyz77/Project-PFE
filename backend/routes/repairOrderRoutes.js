const express = require('express');
const router = express.Router();
const repairOrderController = require('../controllers/repairOrderController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

/**
 * Routes pour la gestion des commandes de réparation
 */

// Routes AGENT/ADMIN
router.post(
  '/from-appointment/:rdvId',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN'),
  repairOrderController.createFromAppointment
);

router.get(
  '/',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'),
  repairOrderController.listRepairOrders
);

// Routes CLIENT - DOIT ÊTRE AVANT /:id pour éviter le conflit
router.get(
  '/my',
  authMiddleware,
  authorizeRoles('CLIENT'),
  repairOrderController.getMyRepairOrders
);

router.get(
  '/:id',
  authMiddleware,
  repairOrderController.getRepairOrder
);

router.post(
  '/:id/lines',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN'),
  repairOrderController.addLine
);

router.delete(
  '/:id/lines/:ligneId',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN'),
  repairOrderController.deleteLine
);

router.put(
  '/:id/status',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN'),
  repairOrderController.updateStatus
);

router.post(
  '/:id/invoice',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN'),
  repairOrderController.createInvoice
);

router.get(
  '/:id/invoice',
  authMiddleware,
  repairOrderController.getInvoice
);

module.exports = router;
