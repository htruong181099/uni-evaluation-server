const authJWT = require("../middleware/jwt.middleware");
const authController = require("../controller/auth.controller");

module.exports = function(app){
    app.post("/signin", authController.signin)
    
}