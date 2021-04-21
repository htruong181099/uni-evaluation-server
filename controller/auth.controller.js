const db = require("../model/");
const User = db.user;
const jwt = require('jsonwebtoken');
const JWTconfig = require("../config/jwt.config");

exports.signin = async (req,res,next)=>{
    const {email, password} = req.body;
    const user = await User.findOne({email})
            .select("-__v -create_date");
    if(!user){
        return res.status(404).json({
            message: "User not found."
        })
    }

    user.comparePassword(password, function(err, isMatch){
        if(err){
            return next(err);
        }
        if(!isMatch){
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password"
            })
        }
        const token = jwt.sign({id:user._id}, JWTconfig.secret,{
            expiresIn:86400
        })
        req.userId = user._id;
        return res.json({
            userID : user._id,
            roles: user.roles,
            token
        })
    })

}