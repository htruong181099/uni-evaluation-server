const mongoose = require('mongoose');

const EvaluateDescription = mongoose.model(
    "EvaluateDescription",
    new mongoose.Schema({
        evaluateCriteria: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EvaluateCriteria",
            required: true
        },
        name: {
            type: String,
        },
        value: {
            type: Number,
            default: 0,
            required: true
        },
        type: {
            type: String,
            enum: ["amount", "detail"],
            required: true
        },
        description: {
            type: String
        }
    })
)

module.exports = EvaluateDescription;