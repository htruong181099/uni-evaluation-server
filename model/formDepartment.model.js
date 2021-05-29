const mongoose = require('mongoose');

//schema
const FormDepartmentSchema = new mongoose.Schema({
    form_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Form",
        required: true
    },
    department_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        required: true
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    level: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})

//model
const FormDepartment = mongoose.model(
    "FormDepartment",
    FormDepartmentSchema
)

module.exports = FormDepartment;