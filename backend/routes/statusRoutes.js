const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

/**
 * @swagger
 * /api/admin/statuses:
 *   get:
 *     summary: Obtenir tous les statuts de tous les types
 *     tags: [Admin - Statuts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tous les statuts groupés par type
 */
router.get('/', requirePermission('SETTINGS', 'READ'), statusController.getAllStatuses);

/**
 * @swagger
 * /api/admin/statuses/{type}:
 *   get:
 *     summary: Obtenir les statuts d'un type spécifique
 *     tags: [Admin - Statuts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [rdv, intervention, reclamation]
 *     responses:
 *       200:
 *         description: Liste des statuts
 *       400:
 *         description: Type invalide
 */
router.get('/:type', requirePermission('SETTINGS', 'READ'), statusController.getStatuses);

/**
 * @swagger
 * /api/admin/statuses/{type}/stats:
 *   get:
 *     summary: Obtenir les statistiques d'utilisation des statuts
 *     tags: [Admin - Statuts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [rdv, intervention, reclamation]
 *     responses:
 *       200:
 *         description: Statistiques d'utilisation
 */
router.get('/:type/stats', requirePermission('SETTINGS', 'READ'), statusController.getStatusUsageStats);

/**
 * @swagger
 * /api/admin/statuses/{type}:
 *   post:
 *     summary: Créer un nouveau statut
 *     tags: [Admin - Statuts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [rdv, intervention, reclamation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - libelle
 *             properties:
 *               code:
 *                 type: string
 *                 description: Code du statut (majuscules et underscores uniquement)
 *                 example: EN_ATTENTE
 *               libelle:
 *                 type: string
 *                 description: Libellé du statut
 *                 example: En attente
 *     responses:
 *       201:
 *         description: Statut créé
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Code déjà existant
 */
router.post('/:type', requirePermission('SETTINGS', 'UPDATE'), statusController.createStatus);

/**
 * @swagger
 * /api/admin/statuses/{type}/{code}:
 *   put:
 *     summary: Mettre à jour un statut
 *     tags: [Admin - Statuts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [rdv, intervention, reclamation]
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - libelle
 *             properties:
 *               libelle:
 *                 type: string
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *       404:
 *         description: Statut non trouvé
 */
router.put('/:type/:code', requirePermission('SETTINGS', 'UPDATE'), statusController.updateStatus);

/**
 * @swagger
 * /api/admin/statuses/{type}/{code}:
 *   delete:
 *     summary: Supprimer un statut
 *     tags: [Admin - Statuts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [rdv, intervention, reclamation]
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut supprimé
 *       404:
 *         description: Statut non trouvé
 *       409:
 *         description: Statut utilisé, impossible de supprimer
 */
router.delete('/:type/:code', requirePermission('SETTINGS', 'UPDATE'), statusController.deleteStatus);

module.exports = router;
