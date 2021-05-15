//controller
const adminController = require('../controller/admin.controller');
const departmentController = require("../controller/department.controller");
const standardController = require("../controller/standard.controller");
const criteriaController = require("../controller/criteria.controller");
const criteriaOptionController = require("../controller/criteriaOption.controller");
const reviewController = require("../controller/evaluationReview.controller");
const formTypeController = require("../controller/formType.controller");
const formController = require("../controller/form.controller");
const formDepartmentController = require("../controller/formDepartment.controller");
const formUserController = require("../controller/formUser.controller");
const formStandardController = require("../controller/formStandard.controller");
const formCriteriaController = require("../controller/formCriteria.controller");

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
    

    //standard
    app.get("/admin/standard/",
        standardController.getStandards
    )
    app.get("/admin/standard/criteria",
        standardController.getStandardsWithCriteria
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

    //criteria option
    app.get("/admin/criteria/:ccode/option",
        // criteriaOptionController.validate('addCriteriaOption'),
        // getValidationResult,
        criteriaOptionController.getCriteriaOption
    )
    
    app.post("/admin/criteria/:ccode/addCriteriaOption",
        // criteriaOptionController.validate('addCriteriaOption'),
        // getValidationResult,
        criteriaOptionController.addCriteriaOption
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
    app.post("/admin/review/:rcode/formtype/:ftcode/form/addForm",
        formController.validate('addForm'),
        getValidationResult,
        formController.addForm
    )
    app.get("/admin/form/:id",
        formController.validate('getForm'),
        getValidationResult,
        formController.getForm
    )

    app.get("/admin/review/:rcode/formtype/:ftcode/form/",
        formController.validate('getFormfromFormTypeandReview'),
        getValidationResult,
        formController.getFormfromFormTypeandReview
    )

    //FormDepartment
    app.get("/admin/form/:fcode/getFormDepartments",
        formDepartmentController.getFormDepartments
    )
    app.post("/admin/form/:fcode/addFormDepartments",
        formDepartmentController.addFormDepartments,
        formUserController.addFormUser
    )

    //Form User
    app.get("/admin/form/:fcode/:dcode/getFormUser",
        formUserController.getFormUsers
    )
    app.post("/admin/form/:fcode/:dcode/removeFormUser",
        formUserController.removeFormUser
    )

    //formStandard
    app.get("/admin/form/:fcode/getFormStandard",
        formStandardController.getFormStandards
    )

    app.post("/admin/form/:fcode/addFormStandard",
        formStandardController.addFormStandard

    )

    //formCriteria
    app.get("/admin/form/:fcode/standard/:scode/getFormCriteria",
        formCriteriaController.getFormCriteria
    )
    app.post("/admin/form/:fcode/standard/:scode/addFormCriteria",
        formCriteriaController.addFormCriteria
    )
}