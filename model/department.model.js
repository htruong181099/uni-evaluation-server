const mongoose = require('mongoose');

const Department = mongoose.model(
    "Department",
    new mongoose.Schema({
        department_code: {
            type: String,
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
        include: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref : "Department"
            }
        ]
    })
)

module.exports = Department;