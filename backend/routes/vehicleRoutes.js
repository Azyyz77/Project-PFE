const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Toutes les routes véhicules nécessitent une authentification
router.use(authMiddleware);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Ajouter un nouveau véhicule
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [immatriculation, numero_chassis, version_id, annee]
 *             properties:
 *               immatriculation: { type: string, example: 'TU 123 456' }
 *               numero_chassis: { type: string, example: 'VF1RFD00X56789012' }
 *               version_id: { type: integer, example: 1 }
 *               couleur: { type: string, example: 'Blanc' }
 *               annee: { type: integer, example: 2021 }
 *     responses:
 *       201:
 *         description: Véhicule ajouté avec succès
 *       400:
 *         description: Champs requis manquants ou version introuvable
 *       401:
 *         description: Token manquant ou invalide
 *       409:
 *         description: Numéro d\'immatriculation déjà existant
 */
// Any authenticated user can add vehicles for themselves
router.post('/', vehicleController.addVehicle);

/**
 * @swagger
 * /api/vehicles/catalog/versions:
 *   get:
 *     summary: Obtenir les versions actives (marque/modèle/version)
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des versions actives
 *       401:
 *         description: Token manquant ou invalide
 */
router.get('/catalog/versions', vehicleController.getVersionCatalog);

/**
 * @swagger
 * /api/vehicles/user/{userId}:
 *   get:
 *     summary: Obtenir tous les véhicules d\'un utilisateur
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des véhicules
 *       401:
 *         description: Token manquant ou invalide
 *       403:
 *         description: Accès non autorisé
 */
router.get('/user/:userId', vehicleController.getVehiclesByUser);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Obtenir un véhicule par ID
 *     tags: [Vehicles]
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
 *         description: Informations du véhicule
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Véhicule non trouvé
 */
router.get('/:id', vehicleController.getVehicleById);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Mettre à jour un véhicule
 *     tags: [Vehicles]
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
 *             required: [immatriculation, numero_chassis, version_id, annee]
 *             properties:
 *               immatriculation: { type: string, example: 'TU 123 456' }
 *               numero_chassis: { type: string, example: 'VF1RFD00X56789012' }
 *               version_id: { type: integer, example: 1 }
 *               couleur: { type: string, example: 'Noir' }
 *               annee: { type: integer, example: 2022 }
 *     responses:
 *       200:
 *         description: Véhicule mis à jour
 *       401:
 *         description: Token manquant ou invalide
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Véhicule non trouvé
 */
router.put('/:id', authorizeRoles('client', 'admin'), vehicleController.updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Supprimer un véhicule
 *     tags: [Vehicles]
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
 *         description: Véhicule supprimé
 *       401:
 *         description: Token manquant ou invalide
 *       403:
 *         description: Accès non autorisé
 *       404:
 *         description: Véhicule non trouvé
 */
router.delete('/:id', authorizeRoles('client', 'admin'), vehicleController.deleteVehicle);

module.exports = router;
