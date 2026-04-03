const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

/**
 * @swagger
 * /api/complaints/my-complaints:
 *   get:
 *     summary: Obtenir toutes mes réclamations
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réclamations du client
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/my-complaints', complaintController.getMyComplaints);

/**
 * @swagger
 * /api/complaints:
 *   post:
 *     summary: Créer une nouvelle réclamation
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sujet, description]
 *             properties:
 *               sujet: { type: string, example: 'Problème avec la réparation' }
 *               description: { type: string, example: 'La réparation effectuée ne correspond pas à mes attentes' }
 *     responses:
 *       201:
 *         description: Réclamation créée avec succès
 *       400:
 *         description: Champs requis manquants
 *       401:
 *         description: Token manquant ou invalide
 */
router.post('/', complaintController.createComplaint);

/**
 * @swagger
 * /api/complaints:
 *   get:
 *     summary: Obtenir toutes les réclamations (staff uniquement)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [SOUMISE, EN_COURS, TRAITEE, CLOTUREE]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des réclamations
 *       401:
 *         description: Token manquant ou invalide
 *       403:
 *         description: Accès non autorisé
 */
router.get('/', authorizeRoles('admin', 'agent', 'direction'), complaintController.getAllComplaints);

/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: Obtenir une réclamation par ID
 *     tags: [Complaints]
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
 *         description: Informations de la réclamation
 *       401:
 *         description: Token manquant ou invalide
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Réclamation non trouvée
 */
router.get('/:id', complaintController.getComplaintById);

/**
 * @swagger
 * /api/complaints/{id}/status:
 *   put:
 *     summary: Mettre à jour le statut d'une réclamation (staff uniquement)
 *     tags: [Complaints]
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
 *             required: [statut]
 *             properties:
 *               statut: { type: string, enum: [SOUMISE, EN_COURS, TRAITEE, CLOTUREE] }
 *               reponse: { type: string, example: 'Nous avons traité votre réclamation...' }
 *     responses:
 *       200:
 *         description: Réclamation mise à jour
 *       400:
 *         description: Statut invalide
 *       401:
 *         description: Token manquant ou invalide
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Réclamation non trouvée
 */
router.put('/:id/status', authorizeRoles('admin', 'agent', 'direction'), complaintController.updateComplaintStatus);

module.exports = router;
