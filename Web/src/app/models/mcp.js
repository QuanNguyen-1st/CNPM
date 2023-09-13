const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const MCPSchema = new mongoose.Schema(
    {
        address: {type: String, required: true},
        // latitude: {type: String, required: true},
        // longitude: {type: String, required: true},
        fill_percentage: {type: Number, required: true},
    },
    {collection: 'mcp'}
);

module.exports = mongoose.model('MCP', MCPSchema);