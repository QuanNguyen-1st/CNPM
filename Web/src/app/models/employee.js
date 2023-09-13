const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const EmployeeSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        position: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        phone_number: {type: String, required: true, unique: true},
        assign_vehicle: {type: Boolean, required: true},
        assign_MCP: {type: Boolean, required: true},
        license: {type: String}
    },
    {collection: 'employee'}
);

module.exports = mongoose.model('Employee', EmployeeSchema);