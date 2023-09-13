const express = require('express');
const router = express.Router();

const taskController = require('../app/controllers/TaskController');

router.get('/:id/assign', taskController.assign);
router.post('/:id/assign', taskController.assignment);
router.delete('/:id/assign', taskController.deleteAssign);
// router.patch('/:id/assign', taskController.);

router.delete('/:id', taskController.destroy);
router.patch('/:id', taskController.update);

router.get('/', taskController.index);
router.post('/', taskController.create);


module.exports = router;