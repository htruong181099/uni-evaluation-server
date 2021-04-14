const jwtMiddleware = require('../middleware/jwt.middleware');

module.exports = function(app){

    app.use("/admin",jwtMiddleware.verifyToken, jwtMiddleware.isAdmin)

    app.get("/admin",(req,res,next)=>{
        res.json({
            message: "admin"
        });
    })
}