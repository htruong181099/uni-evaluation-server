const mongoose = require('mongoose');

const FormDepartment = mongoose.model(
    "FormDepartment",
    new mongoose.Schema({
        form_id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Form",
            required: true
        },
        department_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },/*
        formDepartment_parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormDepartment"
        },
        head: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FormUser",
            required: true
        },*/
        level: {
            type: Number
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = FormDepartment;