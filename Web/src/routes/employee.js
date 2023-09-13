const express = require('express');
const router = express.Router();

const employeeController = require('../app/controllers/EmployeeController');

router.get('/', employeeController.index);
router.put('/', employeeController.makeChanges);

module.exports = router;