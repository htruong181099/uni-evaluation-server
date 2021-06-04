const {adminController} = require('../../controller/');
const {getValidationResult} = require("../../middleware/validate.middleware");

module.exports = (app) =>{
    //user
    app.get("/admin/user",
        adminController.getUsers
    )

    app.get("/admin/user/deleted",
        adminController.getDeletedUsers
    )

    app.get("/admin/user/:id",
        adminController.validate('getUser'),
        getValidationResult,
        adminController.getUser
    )

    app.get("/admin/user/:ucode/get",
        adminController.validate('getUserbyCode'),
        getValidationResult,
        adminController.getUserbyCode
    )

    app.post("/admin/user/:ucode/edit",
        adminController.validate('getUserbyCode'),
        getValidationResult,
        adminController.editUser
    )

    app.post("/admin/user/add",
        adminController.validate('addUser'),
        getValidationResult,
        adminController.addUser
    )

    app.post("/admin/user/:ucode/delete",
        adminController.validate('deleteUser'),
        getValidationResult,
        adminController.deleteUser
    )
    app.post("/admin/user/:ucode/restore",
        adminController.validate('restoreUser'),
        getValidationResult,
        adminController.restoreUser
    )

    //add existed user to department
    app.post("/admin/department/:dcode/user/add",
        adminController.validate('addUsertoDepartment'),
        getValidationResult,
        adminController.addUsertoDepartment
    )
    //create new user to department
    app.post("/admin/department/:dcode/user/create",
        adminController.validate('createNewUsertoDepartment'),
        getValidationResult,
        adminController.createNewUsertoDepartment
    )

    app.post("/admin/department/:dcode/user/:ucode/delete",
        adminController.validate('removeUserDepartment'),
        getValidationResult,
        adminController.removeUserDepartment
    )
}