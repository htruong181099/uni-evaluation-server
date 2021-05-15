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
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = UserForm;