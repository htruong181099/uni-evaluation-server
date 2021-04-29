const adminController = require('../controller/admin.controller');
const departmentController = require("../controller/department.controller");
const standardController = require("../controller/standard.controller");
const criteriaController = require("../controller/criteria.controller");
const jwtMiddleware = require('../middleware/jwt.middleware');

module.exports = function(app){

    app.use("/admin",
        jwtMiddleware.verifyToken,
        jwtMiddleware.isAdmin
    )

    app.get("/admin",(req,res,next)=>{
        res.json({
            message: "Admin page"
        });
    })

    //user
    app.get("/admin/user",
        adminController.getUsers
    )
    app.get("/admin/user/:id",
        adminController.getUser
    )

    //department
    app.get("/admin/department",
        departmentController.getDepartments
    )
    app.get("/admin/department/:id",
        departmentController.getDepartment
    )
    app.get("/admin/department/:id/user",
        departmentController.getDepartmentUser
    )

    //standard
    app.get("/admin/standard/",
        standardController.getStandards
    )
    app.get("/admin/standard/:id",
        standardController.validate('getStandard'),
        standardController.getStandard
    )
    app.post("/admin/standard/:id/delete",
        standardController.validate('deleteStandard'),
        standardController.deleteStandard
    )
    app.post("/admin/standard/add",
        standardController.validate('add'),
        standardController.addStandard
    )
    app.post("/admin/standard/:id/criteria/add",
        criteriaController.addCriteria
    )
    app.get("/admin/standard/:id/criteria",
        criteriaController.getCriterions
    )

    //criteria
    app.get("/admin/criteria",
        criteriaController.getAllCriterions
    )
    app.get("/admin/criteria/:id/",
        criteriaController.validate('getCriteria'),
        criteriaController.getCriteria
    )
    app.post("/admin/criteria/:id/delete",
        criteriaController.validate('deleteCriteria'),
        criteriaController.deleteCriteria
    )
}