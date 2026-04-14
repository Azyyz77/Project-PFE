const express = require('express');
const router = express.Router();
const diagnosticController = require('../controllers/diagnosticController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes client
router.get('/', authMiddleware, diagnosticController.getAllProblems);
router.get('/category/:categorie', authMiddleware, diagnosticController.getProblemsByCategory);
router.get('/search', authMiddleware, diagnosticController.searchProblems);

// Routes admin
router.post('/', authMiddleware, authorizeRoles('ADMIN'), diagnosticController.createProblem);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), diagnosticController.updateProblem);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), diagnosticController.deleteProblem);

module.exports = router;
