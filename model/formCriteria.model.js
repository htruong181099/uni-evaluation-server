const mongoose = require('mongoose');

const FormCriteria = mongoose.model(
    "FormCriteria",
    new mongoose.Schema({
        criteria_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Criteria"
        },
        form_standard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormStandard"
        },
        criteria_order: {
            type: String,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = FormCriteria;
