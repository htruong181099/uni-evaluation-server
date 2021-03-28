const jwt = require('jsonwebtoken');
const jwtConfig = require("../config/jwt.config");
const SECRET = jwtConfig.secret;

verifyToken = (req,res,next)=>{
    const token = req.headers["Authorization"];
    if(!token){
        return res.status(403).send({
            message: "Required Token!!!"
        })
    }
    jwt.verify(token, SECRET, (err, decoded)=>{
        if(err){
            return res.status(403).send({
                message: "Unauthorized or token had been expired!!"
            })
        }
        req.userId = decoded.id;
        next();
    })
}