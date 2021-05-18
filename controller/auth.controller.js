const db = require("../model/");
const User = db.user;
const jwt = require('jsonwebtoken');
const JWTconfig = require("../config/jwt.config");

const { body, validationResult } = require('express-validator');

exports.validate = ()=>{
    return [
        body('email',"Invalid email").exists().isEmail(),
        body('password', "Password required").exists(),
        body('password', "Invalid password").isString()
    ]
}

exports.signin = async (req,res,next)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email})
                .select("-__v -create_date");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        user.comparePassword(password, function(err, isMatch){
            if(err){
                return next(err);
            }
            if(!isMatch){
                return res.status(401).send({
                    statusCode: 401,
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
    } catch (error) {
        next(error);
    }
}

exports.logout = (req,res,next)=>{
    req.session.destroy();
    return res.send({
        message: "Log out success"
    })
}