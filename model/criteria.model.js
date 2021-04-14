const mongoose = require('mongoose');

const Criteria = mongoose.model(
    "Criteria",
    new mongoose.Schema({
        code: {
            type: String,
            unique: true,
            required: true
        },
        content:{
            type: String,
            required: true
        },
        standard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Standard"
        }
    })
)

module.exports = Criteria;