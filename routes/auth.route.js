const authJWT = require("../middleware/jwt.middleware");
const authController = require("../controller/auth.controller");

module.exports = function(app){
    app.post("/auth/signin", 
        authController.validate(),
        authController.signin
    )
    /*
    app.post("/auth/logout",
        authController.logout
    )
    */
}