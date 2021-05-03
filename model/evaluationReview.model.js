const mongoose = require('mongoose');

//đợt đánh giá
const EvaluationReview = mongoose.model(
    "EvaluationReview",
    new mongoose.Schema({
        code: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        start_date: {
            type: Date,
            required: true
        },
        end_date: {
            type: Date,
            required: true
        },
        description :{
            type: String
        }
    })
)

module.exports = EvaluationReview;