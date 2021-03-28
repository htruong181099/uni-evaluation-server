const mongoose = require('mongoose');

const Criteria = mongoose.model(
    "Criteria",
    new mongoose.Schema({
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