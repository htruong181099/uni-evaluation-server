const jwt = require('jsonwebtoken');
const jwtConfig = require("../config/jwt.config");
const SECRET = jwtConfig.secret;
const User = require("../model").user;

verifyToken = (req,res,next)=>{
    const authHeader = req.headers["authorization"];
    if(!authHeader){
        return res.status(401).send({
            message: "Required Token!!!"
        })
    }
    const token = authHeader.split(" ")[1];
    if(!token){
        return res.status(401).send({
            message: "Required Token!!!"
        })
    }
    jwt.verify(token, SECRET, (err, decoded)=>{
        if(err){
            return res.status(401).send({
                message: "Unauthorized or token had been expired!!"
            })
        }
        req.userId = decoded.id;
        next();
    })
}

getUser = async (req,res,next)=>{
    if(req.userId){
        const user = await User.findById(req.userId);
        req.user = user;
        return next();
    }
}

isAdmin = async (req,res,next) =>{
    try {
        const user = await User.findById(req.userId);
        if(user.roles == 'admin'){
            return next();
        }
        res.status(403).send({message: "Require Admin Role!" });
    } catch (err) {
        next(err);   
    }
}

module.exports = {
    verifyToken,
    isAdmin
}