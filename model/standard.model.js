const mongoose = require('mongoose');

const Standard = mongoose.model(
    "Standard",
    new mongoose.Schema({
        content:{
            type: String,
            required: true
        }
    })
)

module.exports = Standard;