const mongoose = require('mongoose');

//user evaluate criteria
const EvaluateCriteria = mongoose.model(
    "EvaluateCriteria",
    new mongoose.Schema({
        evaluateForm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EvaluateForm",
            required: true
        },
        form_criteria: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormCriteria",
            required: true
        },
        point: {
            type: Number,
        },
        read_only: {
            type: Boolean,
            default: false,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = EvaluateCriteria;