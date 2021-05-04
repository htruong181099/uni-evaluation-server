const mongoose = require('mongoose');

const Department = mongoose.model(
    "Department",
    new mongoose.Schema({
        department_code: {
            type: String,
            unique: true,
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Department"
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    })
)

module.exports = Department;