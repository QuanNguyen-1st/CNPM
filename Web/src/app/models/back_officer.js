const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const BackOfficerSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true},
        password: { type: String, required: true }
    },
    {collection: 'backofficer'}
);

module.exports = mongoose.model('BackOfficer', BackOfficerSchema);