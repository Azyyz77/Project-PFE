const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent authentification et rôle ADMIN
router.use(authMiddleware);
router.use(authorizeRoles('ADMIN'));

/**
 * @swagger
 * /api/admin/permissions:
 *   get:
 *     summary: Obtenir toutes les permissions
 *     tags: [Admin - Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des permissions
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
router.get('/', permissionController.getPermissions);

/**
 * @swagger
 * /api/admin/permissions/modules:
 *   get:
 *     summary: Obtenir la liste des modules et actions disponibles
 *     tags: [Admin - Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des modules et actions
 */
router.get('/modules', permissionController.getModules);

/**
 * @swagger
 * /api/admin/permissions/check:
 *   get:
 *     summary: Vérifier si un utilisateur a une permission
 *     tags: [Admin - Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: module
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Résultat de la vérification
 */
router.get('/check', permissionController.checkPermission);

/**
 * @swagger
 * /api/admin/permissions/role/{roleId}:
 *   get:
 *     summary: Obtenir les permissions d'un rôle
 *     tags: [Admin - Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des permissions du rôle
 */
router.get('/role/:roleId', permissionController.getPermissionsByRole);

/**
 * @swagger
 * /api/admin/permissions/role/{roleId}/initialize:
 *   post:
 *     summary: Initialiser les permissions par défaut pour un rôle
 *     tags: [Admin - Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permissions initialisées
 */
router.post('/role/:roleId/initialize', permissionController.initializeDefaultPermissions);

/**
 * @swagger
 * /api/admin/permissions:
 *   post:
 *     summary: Créer une permission
 *     tags: [Admin - Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role_id
 *               - module
 *               - action
 *             properties:
 *               role_id:
 *                 type: integer
 *               module:
 *                 type: string
 *               action:
 *                 type: string
 *               actif:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Permission créée
 *       400:
 *         description: Données invalides
 *       409:
 *         description: Permission déjà existante
 */
router.post('/', permissionController.createPermission);

/**
 * @swagger
 * /api/admin/permissions/{id}:
 *   put:
 *     summary: Mettre à jour une permission (activer/désactiver)
 *     tags: [Admin - Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - actif
 *             properties:
 *               actif:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Permission mise à jour
 *       404:
 *         description: Permission non trouvée
 */
router.put('/:id', permissionController.updatePermission);

/**
 * @swagger
 * /api/admin/permissions/{id}:
 *   delete:
 *     summary: Supprimer une permission
 *     tags: [Admin - Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Permission supprimée
 *       404:
 *         description: Permission non trouvée
 */
router.delete('/:id', permissionController.deletePermission);

module.exports = router;
