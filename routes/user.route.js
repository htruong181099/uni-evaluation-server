const userController = require("../controller/user.controller");

module.exports = function(app){
    // app.use("/user/", )
    app.get("/user/:id", userController.getUser);
}