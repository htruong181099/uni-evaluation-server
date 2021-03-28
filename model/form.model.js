const mongoose = require('mongoose');

const Form = mongoose.model(
    "Form",
    new mongoose.Schema({
        title: {
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
        }
    })
)

module.exports = Form;