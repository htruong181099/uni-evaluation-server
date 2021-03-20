const mongoose = require('mongoose');

const FormType = mongoose.model(
    "FormType",
    new mongoose.Schema({
        type: {
            type: String,
            required: true
        },
        content:{
            type: String
        }
    })
)

module.exports = FormType;