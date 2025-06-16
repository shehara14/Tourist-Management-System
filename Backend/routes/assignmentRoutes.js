const express = require('express');
const router = express.Router();
const assignmentController = require('../Controllers/AssignmentController');

// Assign driver to vehicle
router.post('/', assignmentController.createAssignment);

// Get all assignments
router.get('/', assignmentController.getAllAssignments);

// Get active assignments
router.get('/active', assignmentController.getActiveAssignments);

// End assignment
router.put('/:id/end', assignmentController.endAssignment);

// Get assignments by driver
router.get('/driver/:driverId', assignmentController.getAssignmentsByDriver);

// Get assignments by vehicle
router.get('/vehicle/:vehicleId', assignmentController.getAssignmentsByVehicle);

module.exports = router;