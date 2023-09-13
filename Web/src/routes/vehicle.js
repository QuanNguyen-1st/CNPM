const express = require('express');
const router = express.Router();

const vehicleController = require('../app/controllers/VehicleController');

router.get('/', vehicleController.index);

router.get('/assign', vehicleController.assign);
router.patch('/assign/:vehicle_id/:employee_id', vehicleController.assignment);
router.patch('/:id', vehicleController.unassignment);

router.get('/:id/assign', vehicleController.assignMCP)
router.post('/:id/assign', vehicleController.assignmentMCP)
router.delete('/:vehicle_id/assign/:mcp_id', vehicleController.unassignmentMCP);

module.exports = router;