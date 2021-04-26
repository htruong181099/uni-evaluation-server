const db = require("../model/");
const User = db.user;
const jwt = require('jsonwebtoken');
const JWTconfig = require("../config/jwt.config");

const { body, validationResult } = require('express-validator');

exports.validate = ()=>{
    console.log("Run");
    return [
        body('email').exists().isEmail(),
        body('password', "Password required").exists(),
        body('password', "Invalid password").isString()
    ]
}

exports.signin = async (req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors: [...new Set(errors.array().map(err=>err.msg))] });
        return;
    }
    const {email, password} = req.body;
    const user = await User.findOne({email})
            .select("-__v -create_date");
    if(!user){
        return res.status(404).json({
            message: "User not found"
        })
    }

    user.comparePassword(password, function(err, isMatch){
        if(err){
            return next(err);
        }
        if(!isMatch){
            return res.status(401).send({
                message: "Invalid User or Password"
            })
        }
        const token = jwt.sign({id:user._id}, JWTconfig.secret,{
            expiresIn:86400
        })
        req.userId = user._id;
        return res.status(200).json({
            userID : user._id,
            roles: user.roles,
            token
        })
    })

}

exports.logout = (req,res,next)=>{
    req.session.destroy();
    return res.send({
        message: "Log out success"
    })
}