const express = require('express');
const router = express.Router();

const mcpController = require('../app/controllers/MCPController');

router.get('/', mcpController.index);
router.delete('/:id', mcpController.destroy);
router.post('/', mcpController.create);

module.exports = router;