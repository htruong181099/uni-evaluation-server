const mongoose = require('mongoose');

const FormEvaluation = mongoose.model(
    "FormEvaluation",
    new mongoose.Schema({
        mainUser_id: {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        
        formCriteria: {
            type: mongoose.Schema.ObjectId,
            ref: "FormCriteria"
        },
        point :{
            type: Number,
            required: true,
        },
        description: {
            type: String
        },
        files: [{
            type: String
        }],
        level: {
            type: Number,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = FormEvaluation;