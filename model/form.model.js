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
        formStandards : [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Standard"
            }
        ],
        formCriteria : [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Criteria"
            }
        ]
    })
)

module.exports = Form;