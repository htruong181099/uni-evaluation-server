const mongoose = require('mongoose');

const FormCriteria = mongoose.model(
    "FormCriteria",
    new mongoose.Schema({
        criteria_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Criteria",
            required: true
        },
        form_standard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormStandard",
            required: true
        },
        criteria_order: {
            type: Number,
            required: true
        },
        point:{
            type: Number
        },
        // read_only: {
        //     type: Boolean,
        //     default: false,
        //     required: true
        // },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = FormCriteria;
