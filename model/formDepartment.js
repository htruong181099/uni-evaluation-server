const mongoose = require('mongoose');

const Department = mongoose.model(
    "FormDepartment",
    new mongoose.Schema({
        department_code: {
            type: String,
            required: true
        },
    })
)

module.exports = FormDepartment;