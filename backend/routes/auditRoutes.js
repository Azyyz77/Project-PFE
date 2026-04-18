/**
 * ROUTES: Audit Logs (Admin)
 */

const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/auditController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent une authentification ADMIN
router.use(authMiddleware);
router.use(authorizeRoles('ADMIN', 'DIRECTION'));

/**
 * @route   GET /api/admin/audit
 * @desc    Liste des logs d'audit avec filtres
 * @access  Admin, Direction
 * @query   {
 *   utilisateur_id?: number,
 *   action?: string,
 *   entite_type?: string,
 *   date_debut?: string,
 *   date_fin?: string,
 *   statut?: string,
 *   search?: string,
 *   page?: number,
 *   limit?: number
 * }
 */
router.get('/', AuditController.getAuditLogs);

/**
 * @route   GET /api/admin/audit/stats
 * @desc    Statistiques des logs d'audit
 * @access  Admin, Direction
 * @query   {
 *   date_debut?: string,
 *   date_fin?: string
 * }
 */
router.get('/stats', AuditController.getAuditStats);

/**
 * @route   GET /api/admin/audit/export
 * @desc    Export des logs en Excel ou CSV
 * @access  Admin, Direction
 * @query   {
 *   utilisateur_id?: number,
 *   action?: string,
 *   entite_type?: string,
 *   date_debut?: string,
 *   date_fin?: string,
 *   statut?: string,
 *   format?: 'excel' | 'csv'
 * }
 */
router.get('/export', AuditController.exportLogs);

/**
 * @route   GET /api/admin/audit/:entiteType/:entiteId
 * @desc    Historique complet d'une entité
 * @access  Admin, Direction
 * @params  {
 *   entiteType: string,
 *   entiteId: string
 * }
 */
router.get('/:entiteType/:entiteId', AuditController.getEntityHistory);

module.exports = router;
