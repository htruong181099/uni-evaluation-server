const mongoose = require('mongoose');

const FormDepartment = mongoose.model(
    "FormDepartment",
    new mongoose.Schema({
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },
        department_code: {
            type: String,
            required: true
        },
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

module.exports = FormDepartment;