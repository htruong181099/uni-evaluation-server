const mongoose = require('mongoose');

const Standard = mongoose.model(
    "Standard",
    new mongoose.Schema({
        code:{
            type: String,
            required: true,
            unique: true
        },
        name:{
            type: String,
            required: true
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

module.exports = Standard;