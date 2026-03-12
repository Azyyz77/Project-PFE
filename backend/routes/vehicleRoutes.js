const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middleware/authMiddleware');

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
 *             required: [registration_number, vin, carte_grise_code, model, version, year]
 *             properties:
 *               registration_number: { type: string }
 *               vin: { type: string }
 *               carte_grise_code: { type: string }
 *               brand: { type: string, default: CHERY }
 *               model: { type: string }
 *               version: { type: string }
 *               color: { type: string }
 *               year: { type: integer }
 *               mileage: { type: integer }
 *     responses:
 *       201:
 *         description: Véhicule ajouté avec succès
 *       400:
 *         description: Champs requis manquants
 *       401:
 *         description: Token manquant ou invalide
 *       409:
 *         description: Numéro d'immatriculation déjà existant
 */
router.post('/', vehicleController.addVehicle);

/**
 * @swagger
 * /api/vehicles/user/{userId}:
 *   get:
 *     summary: Obtenir tous les véhicules d'un utilisateur
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
 * /api/vehicles/{id}/mileage:
 *   put:
 *     summary: Mettre à jour le kilométrage d'un véhicule
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
 *             required: [mileage]
 *             properties:
 *               mileage: { type: integer }
 *     responses:
 *       200:
 *         description: Kilométrage mis à jour
 *       400:
 *         description: Kilométrage invalide
 *       401:
 *         description: Token manquant ou invalide
 *       404:
 *         description: Véhicule non trouvé
 */
router.put('/:id/mileage', vehicleController.updateMileage);

module.exports = router;
