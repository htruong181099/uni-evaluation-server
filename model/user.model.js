const mongoose = require('mongoose');

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        firstname:{
          type: String,
          required: true,
        },
        lastname:{
          type: String,
          required: true,
        },
        email: {
          type: String,
          unique: true,
          required: true
        },
        password: {
          type: String,
          required: true
        },
        roles: {
            type: String,
            required: true,
            default: 'user'
        },
        phone: {
          type: String,
          required: true
        },
        department: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
          }
        ],
        address: String
    })
)

module.exports = User;