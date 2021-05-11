const mongoose = require('mongoose');

const CriteriaOption = mongoose.model(
    "CriteriaOption",
    new mongoose.Schema({
        criteria_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Criteria",
            required: true
        },
        code: {
            type: String,
            required: true,
            unique: true
        },
        max_point: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = CriteriaOption;
