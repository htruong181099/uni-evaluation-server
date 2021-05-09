const mongoose = require('mongoose');

const FormUser = mongoose.model(
    "FormUser",
    new mongoose.Schema({
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        department_form_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormDepartment",
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

module.exports = FormUser;