//controller
const adminController = require('../controller/admin.controller');
const departmentController = require("../controller/department.controller");
const standardController = require("../controller/standard.controller");
const criteriaController = require("../controller/criteria.controller");
const reviewController = require("../controller/evaluationReview.controller");
const formTypeController = require("../controller/formType.controller");
const formController = require("../controller/form.controller");

//middleware
const jwtMiddleware = require('../middleware/jwt.middleware');
const {getValidationResult} = require("../middleware/validate.middleware");

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
        getValidationResult,
        standardController.getStandard
    )
    app.post("/admin/standard/:id/delete",
        standardController.validate('deleteStandard'),
        getValidationResult,
        standardController.deleteStandard
    )
    app.post("/admin/standard/add",
        standardController.validate('addStandard'),
        getValidationResult,
        standardController.addStandard
    )
    app.post("/admin/standard/:id/criteria/add",
        criteriaController.addCriteria
    )
    app.get("/admin/standard/:id/criteria",
        criteriaController.validate('getCriterions'),
        getValidationResult,
        criteriaController.getCriterions
    )

    //criteria
    app.get("/admin/criteria",
        criteriaController.getAllCriterions
    )
    app.get("/admin/criteria/:id/",
        criteriaController.validate('getCriteria'),
        getValidationResult,
        criteriaController.getCriteria
    )
    app.post("/admin/criteria/:id/delete",
        criteriaController.validate('deleteCriteria'),
        getValidationResult,
        criteriaController.deleteCriteria
    )

    //evaluation review
    app.get("/admin/review",
        reviewController.getEvaluationReview
    )
    app.post("/admin/review/add",
        reviewController.validate('add'),
        getValidationResult,
        reviewController.addEvaluationReview
    )

    //formtype
    app.get("/admin/review/formtype",
        formTypeController.getFormTypes
    )

    //form
    app.post("/admin/review/:rid/formtype/:ftid/form/addForm",
        formController.validate('addForm'),
        getValidationResult,
        formController.addForm
    )
    app.get("/admin/form/:id",
        formController.getForm
    )

    app.get("/admin/review/:rid/formtype/:ftid/form/",
        formController.getFormfromFormTypeandReview
    )
}