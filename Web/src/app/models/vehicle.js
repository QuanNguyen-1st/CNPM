const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const { EmployeeSchema } = require('./employee');
const { MCPSchema } = require('./mcp');

const VehicleSchema = new mongoose.Schema(
    {
        type: {type: String, require: true},
        assigned: {type: Boolean, require: true},
        assign_empolyee: {type: ObjectId, ref: 'Employee'},
        weight_capacity: {type: Number, require: true},
        volume_capacity: {type: Number, require: true},
        fuel_consumption: {type: Number, require: true},
        plate: {type: String, require: true, unique: true},
        state: {type: Number, required: true},
        mcp_list: [{type: ObjectId, ref: 'MCP'}]

    },
    {collection: 'vehicle'}
);

module.exports = mongoose.model('Vehicle', VehicleSchema);