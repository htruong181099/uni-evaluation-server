const mongoose = require('mongoose');

const Form = mongoose.model(
    "Form",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        form: {
            type: mongoose.Schema.ObjectId,
            ref: "Form"
        },
        criteria: {
            type: mongoose.Schema.ObjectId,
            ref: "Criteria"
        }
    })
)

module.exports = Form;