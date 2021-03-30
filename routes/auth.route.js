const authJWT = require("../middleware/jwt.middleware");
const authController = require("../controller/auth.controller");

module.exports = function(app){
    app.use((req,res,next)=>{
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    })

    app.post("/signin", authController.signin)
}