const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlotController');
const { authMiddleware } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');

// Routes client
router.get('/available', authMiddleware, timeSlotController.getAvailableSlots);

// Routes admin
router.get('/', authMiddleware, authorizeRoles('ADMIN'), timeSlotController.getAllTimeSlots);
router.get('/agency/:agenceId', authMiddleware, authorizeRoles('ADMIN'), timeSlotController.getAgencyTimeSlots);
router.post('/', authMiddleware, authorizeRoles('ADMIN'), timeSlotController.createTimeSlot);
router.put('/:id', authMiddleware, authorizeRoles('ADMIN'), timeSlotController.updateTimeSlot);
router.delete('/:id', authMiddleware, authorizeRoles('ADMIN'), timeSlotController.deleteTimeSlot);

module.exports = router;
