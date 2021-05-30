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
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = EvaluateCriteria;