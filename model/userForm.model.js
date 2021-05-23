const mongoose = require('mongoose');

//user's form model
const UserForm = mongoose.model(
    "UserForm",
    new mongoose.Schema({
        form_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormUser",
            required: true
        },
        form_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Form",
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
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = UserForm;