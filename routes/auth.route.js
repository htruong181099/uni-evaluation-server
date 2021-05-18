const authJWT = require("../middleware/jwt.middleware");
const authController = require("../controller/auth.controller");
const {getValidationResult} = require("../middleware/validate.middleware");

module.exports = function(app){
    app.post("/auth/signin", 
        authController.validate(),
        getValidationResult,
        authController.signin
    )
    /*
    app.post("/auth/logout",
        authController.logout
    )
    */
}