const mongoose = require('mongoose');
const TYPE = ['radio', 'checkbox', 'custom'];


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
            ref: "Standard",
            required: true
        },
        type: {
            type: String,
            required: true    
        },
        description: {
            type: String
        },
        create_date:{
            type: Date,
            default: Date.now()
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = Criteria;