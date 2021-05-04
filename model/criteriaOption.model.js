const mongoose = require('mongoose');

const CriteriaOption = mongoose.model(
    "CriteriaOption",
    new mongoose.Schema({
        formCriteria_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Criteria",
            required: true
        },
        max_point: {
            type: String
        },
        min_point: {
            type: String
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
