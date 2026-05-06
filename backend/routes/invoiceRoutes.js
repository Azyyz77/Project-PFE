const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

/**
 * Routes pour la gestion des factures
 */

// Routes AGENT/ADMIN
router.get(
  '/',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN', 'DIRECTION'),
  invoiceController.listInvoices
);

// Routes CLIENT - DOIT ÊTRE AVANT /:id
router.get(
  '/my/invoices',
  authMiddleware,
  authorizeRoles('CLIENT'),
  invoiceController.getMyInvoices
);

router.get(
  '/:id',
  authMiddleware,
  invoiceController.getInvoice
);

router.put(
  '/:id/status',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN'),
  invoiceController.updateStatus
);

router.post(
  '/:id/send',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN'),
  invoiceController.sendByEmail
);

router.get(
  '/:id/pdf',
  authMiddleware,
  invoiceController.downloadPDF
);

router.post(
  '/:id/cancel',
  authMiddleware,
  authorizeRoles('AGENT', 'ADMIN'),
  invoiceController.cancelInvoice
);

module.exports = router;
