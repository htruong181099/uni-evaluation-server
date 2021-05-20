//controller
const {userController} = require("../controller/");

//middleware
const jwtMiddleware = require("../middleware/jwt.middleware");
const {getValidationResult} = require("../middleware/validate.middleware");

module.exports = function(app){
    //get user info
    app.use("/user/", 
        jwtMiddleware.verifyToken,
    )

    app.get("/user/", 
        userController.getUser
    );

    //edit user info
    app.post("/user/editUser",
        userController.validate("editUser"),
        getValidationResult,
        userController.editUser
    )
    //change password
    app.post("/user/changePassword",
        userController.validate("changePassword"),
        getValidationResult,
        userController.changePassword
    )

    app.get("/user/review/:rcode/head",
        userController.checkHead
    )
}