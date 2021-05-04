const mongoose = require('mongoose');

const Form = mongoose.model(
    "Form",
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
        type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormType"
        },
        review: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EvaluationReview"
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = Form;