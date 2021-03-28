const mongoose = require('mongoose');

//đợt đánh giá
const EvaluationReview = mongoose.model(
    "EvaluationReview",
    new mongoose.Schema({
        name: {
            type: String,
            required: true
        },
        starting_date: {
            type: Date
        },
        end_date: {
            type: Date
        },
        description :{
            type: String
        }
    })
)

module.exports = EvaluationReview;