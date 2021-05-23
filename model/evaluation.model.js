const mongoose = require('mongoose');

//user evaluate criteria
const Evaluation = mongoose.model(
    "Evaluation",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormUser"
        },
        userForm:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserForm",
            required: true
        },
        form_crtieria: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormCriteria",
            required: true
        },
        point: {
            type: Number,
            required: true,
            default: 0
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = Evaluation;