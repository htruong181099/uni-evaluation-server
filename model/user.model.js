const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  staff_id: {
    type: String,
    required: true,
    unique: true
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true
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
    type: String
  },
  department: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    }
  ],
  address: String
});

UserSchema.pre('save', (next)=>{
  let user = this;
  if(!user.isModified('password')){
    return next();
  }
  user.password = bcrypt.hashSync(password, 8);
  next();
})

UserSchema.methods.comparePassword = (candidatePassword, cb)=>{
  bcrypt.compare(candidatePassword, this.password, (err,isMatch)=>{
    if(err){
      return cb(err);
    }
    cb(null, isMatch);
  })
}

const User = mongoose.model("User",UserSchema);

module.exports = User;