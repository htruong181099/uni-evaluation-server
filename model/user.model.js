const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const GENDER = ["Male", "Female", "Other"];
const ROLES = ['user','admin','root'];

const UserSchema = new mongoose.Schema({
    staff_id: {
        type: String,
        unique: true,
        required: true
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date
    },
    gender: {
        type: String,
        enum: GENDER
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
        default: 'user',
        enum: ROLES
    },
    phone: {
        type: String
    },
    address: {
        type: String
    },
    department: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department"
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    }
})

//hash password before save to db
UserSchema.pre('save', function(next){
    let user = this;
    if(!user.isModified('password')){
        return next();
    }
    user.password = bcrypt.hashSync(user.password, 8);
    next();
})
  
//check password method
UserSchema.methods.comparePassword = function(candidatePassword, cb){
    if(!candidatePassword){
        cb(null, false);
    }
    bcrypt.compare(candidatePassword, this.password, (err,isMatch)=>{
        if(err){
            return cb(err);
        }
        cb(null, isMatch);
    })
}

const User = mongoose.model("User", UserSchema);

module.exports = User;