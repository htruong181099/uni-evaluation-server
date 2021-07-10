const {departmentController} = require("../../controller")
const {getValidationResult} = require("../../middleware/validate.middleware");

module.exports = (app) =>{
    //department
    app.get("/admin/department",
        departmentController.getDepartments
    )
    app.post("/admin/department/addDepartment",
        departmentController.validate('addDepartment'),
        getValidationResult,
        departmentController.addDepartment,
        departmentController.addUserDepartment
    )
    app.get("/admin/department/parent",
        departmentController.getParentDepartments
    )

    //deleted
    app.get("/admin/department/deleted/",
        departmentController.getDeletedDepartments
    )
    app.get("/admin/department/deleted/parent",
        departmentController.getDeletedParent
    )
    app.get("/admin/department/deleted/:dcode/children",
        departmentController.validate('getDeletedChildren'),
        getValidationResult,
        departmentController.getDeletedChildren
    )

    app.get("/admin/department/:id",
        departmentController.validate('getDepartment'),
        getValidationResult,
        departmentController.getDepartment
    )
    app.get("/admin/department/:dcode/user",
        departmentController.validate('getDepartmentUser'),
        getValidationResult,
        departmentController.getDepartmentUsers
    )
    app.get("/admin/department/:dcode/children",
        departmentController.validate('getChildDepartments'),
        getValidationResult,
        departmentController.getChildDepartments
    )

    app.get("/admin/department/parent/children/get",
        departmentController.getParentsWithChildren
    )

    //edit
    app.post("/admin/department/:dcode/edit",
        departmentController.validate('editDepartment'),
        getValidationResult,
        departmentController.editDepartment
    )
    //edit Department head (manager)
    app.post("/admin/department/:dcode/editHead",
        departmentController.validate('editDepartmentHead'),
        getValidationResult,
        departmentController.editDepartmentHead
    )

    //set isDeleted
    app.post("/admin/department/:dcode/delete",
        departmentController.validate('deleteDepartment'),
        getValidationResult,
        departmentController.deleteDepartment
    )
    app.post("/admin/department/:dcode/restore",
        departmentController.validate('restoreDepartment'),
        getValidationResult,
        departmentController.restoreDepartment
    )

    
    app.post("/admin/department/:dcode/deleteDB",
        departmentController.deleteDepartmentDB
    )

}