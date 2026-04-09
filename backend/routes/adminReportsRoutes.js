const express = require('express');
const router = express.Router();
const adminReportsController = require('../controllers/adminReportsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(authMiddleware);
router.use(authorizeRoles('ADMIN', 'DIRECTION'));

router.get('/global', adminReportsController.getGlobalReport);
router.get('/agencies', adminReportsController.getAgencyReport);
router.get('/period', adminReportsController.getPeriodReport);
router.get('/top-interventions', adminReportsController.getTopInterventions);

module.exports = router;
