const mongoose = require('mongoose');

//user evaluate form
const EvaluateForm = mongoose.model(
    "EvaluateForm",
    new mongoose.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormUser",
            required: true
        },
        //user's form
        userForm: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserForm",
            required: true
        },
        level: {
            type: Number,
            required: true
        },
        status: {
            type: Number,
            required: true,
            enum: [
                -1, // not start yet
                0, // ongoing
                1 // completed
            ],
            default: -1
        },
        point: {
            type: Number
        },
        uptime: {
            type: Date,
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = EvaluateForm;