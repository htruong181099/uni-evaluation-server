const mongoose = require('mongoose');

const Criteria = mongoose.model(
    "Criteria",
    new mongoose.Schema({
        code: {
            type: String,
            unique: true,
            required: true
        },
        name:{
            type: String,
            required: true
        },
        standard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Standard"
        },
        description: {
            type: String
        },
        create_date:{
            type: Date,
            default: Date.now()
        }
    })
)

module.exports = Criteria;