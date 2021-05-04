const mongoose = require('mongoose');

const FormType = mongoose.model(
    "FormType",
    new mongoose.Schema({
        code: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = FormType;