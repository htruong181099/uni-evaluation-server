const mongoose = require('mongoose');

const FormStandard = mongoose.model(
    "FormStandard",
    new mongoose.Schema({
        standard_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Standard"
        },
        form_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Form"
        },
        standard_order: {
            type: Number,
            required: true
        },
        standard_point: {
            type: Number
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = FormStandard;