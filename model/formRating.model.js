const mongoose = require('mongoose');

const FormRating = mongoose.model(
    "FormRating",
    new mongoose.Schema({
        form_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Form",
            required: true
        },
        name: {
            type: String,
            required: true
        },
        min_point: {
            type: Number,
            default: 0,
            required: true
        },
        max_point: {
            type: Number,
            default: 100,
            required: true
        }
    })
)

module.exports = FormRating;