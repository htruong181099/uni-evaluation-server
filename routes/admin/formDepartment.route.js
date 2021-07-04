const {formDepartmentController, formUserController} = require("../../controller/");

//validator
const {getValidationResult} = require("../../middleware/validate.middleware");

module.exports = (app) =>{
    //FormDepartment
    app.get("/admin/form/:fcode/getFormDepartments",
        formDepartmentController.validate('getFormDepartments'),
        getValidationResult,
        formDepartmentController.getFormDepartments
    )

    //new
    app.post("/admin/form/:fcode/addFormDepartments",
        formDepartmentController.validate('addFormDepartments'),
        getValidationResult,
        formDepartmentController.addFormDepartments,
        formUserController.addFormUsers
    )

    app.post("/admin/form/:fcode/:dcode/delete",
        formDepartmentController.validate('deleteFormDepartmentAndUsers'),
        getValidationResult,
        formDepartmentController.deleteFormDepartmentAndUsers
    )

    app.get("/admin/form/:fcode/:dcode/getFormDepartment",
        formDepartmentController.validate('getFormDepartment'),
        getValidationResult,
        formDepartmentController.getFormDepartment
    )

    app.post("/admin/form/:fcode/:dcode/addCouncil",
        formDepartmentController.validate('addCouncil'),
        getValidationResult,
        formDepartmentController.addFormDepartmentCouncil,
        formUserController.addFormUsers
    )

    app.get("/admin/form/:fcode/checkCouncil",
        formDepartmentController.validate('checkCouncil'),
        getValidationResult,
        formDepartmentController.checkCouncil
    )

    app.post("/admin/form/:fcode/:dcode/addHead",
        formDepartmentController.validate('addHead'),
        getValidationResult,
        formDepartmentController.addHead
    )




    //outdated
    app.post("/admin/form/:fcode/addFormDepartments/v2",
        formDepartmentController.validate('addFormDepartmentsV2'),
        getValidationResult,
        formDepartmentController.addFormDepartmentsV2,
        formUserController.addFormUsersV2
    )


}