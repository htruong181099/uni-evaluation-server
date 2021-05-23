//controller
const {userController, formUserController} = require("../controller/");

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

    //get Head
    app.get("/user/review/:rcode/head",
        userController.checkHead
    )
    //get formuser if head
    app.get("/user/head/:fcode/:dcode/get",
        formUserController.getFormUserIfHead
    )


    app.post("/user/:fuser/:fcode/submitForm",
        (req,res,next)=>{
            console.log(req.body);
            return res.status(200).json({
                body: req.body
            })
        }
    )
}