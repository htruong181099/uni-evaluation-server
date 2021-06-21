const mongoose = require('mongoose');

const RatingRequirement = mongoose.model(
    "RatingRequirement",
    new mongoose.Schema({
        form_rating: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormRating",
            required: true
        },
        form_standard: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormStandard",
            required: true
        },
        min_point: {
            type: Number,
            default: Number.NEGATIVE_INFINITY,
            required: true
        },
        max_point: {
            type: Number,
            default: Number.POSITIVE_INFINITY,
            required: true
        }
    })
)

module.exports = RatingRequirement;