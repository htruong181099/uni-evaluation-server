const {departmentController} = require("../../controller")
const {getValidationResult} = require("../../middleware/validate.middleware");

module.exports = (app) =>{
    //department
    app.get("/admin/department",
        departmentController.getDepartments
    )
    app.post("/admin/department/addDepartment",
        departmentController.addDepartment
    )
    app.get("/admin/department/parent",
        departmentController.getParentDepartments
    )
    app.get("/admin/department/:id",
        departmentController.getDepartment
    )
    app.get("/admin/department/:id/user",
        departmentController.getDepartmentUser
    )
    app.get("/admin/department/:code/children",
        departmentController.getChildDepartments
    )
}