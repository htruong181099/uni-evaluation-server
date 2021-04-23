const userController = require("../controller/user.controller");
const jwtMiddleware = require("../middleware/jwt.middleware")

module.exports = function(app){
    app.use("/user/", 
        jwtMiddleware.verifyToken,
    )
    app.get("/user/:id", userController.getUser);
}