//router
const CriteriaRouter = require("./admin/criteria.route");
const StandardRouter = require("./admin/standard.route");
const DepartmentRouter = require("./admin/department.route");
const UserFormRouter = require("./admin/userForm.route")

//controller
const adminController = require('../controller/admin.controller');
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
const { userController, evaluationController, userFormController } = require("../controller");

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
        userController.validate('deleteUser'),
        getValidationResult,
        userController.deleteUser
    )
    app.post("/admin/user/:ucode/recover",
        userController.validate('recoverUser'),
        getValidationResult,
        userController.recoverUser
    )

    //add existed user to department
    app.post("/admin/department/:dcode/user/add",
        // adminController.validate('addUser'),
        // getValidationResult,
        userController.addUsertoDepartment
    )
    //create new user to department
    app.post("/admin/department/:dcode/user/create",
        // adminController.validate('addUser'),
        // getValidationResult,
        userController.createNewUsertoDepartment
    )

    app.post("/admin/department/:dcode/user/:ucode/delete",
        // adminController.validate('addUser'),
        // getValidationResult,
        userController.removeUserDepartment
    )

    //router
    DepartmentRouter(app);
    StandardRouter(app);
    CriteriaRouter(app);
    UserFormRouter(app);

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

    app.get("/admin/form/:fcode/getEvaForm",
        formController.getEvaForm
    )

    //FormDepartment
    app.get("/admin/form/:fcode/getFormDepartments",
        formDepartmentController.getFormDepartments
    )
    app.post("/admin/form/:fcode/addFormDepartments",
        formDepartmentController.addFormDepartments,
        formUserController.addFormUsers
    )

    app.post("/admin/form/:fcode/addFormDepartments/v2",
        formDepartmentController.addFormDepartmentsV2,
        formUserController.addFormUsersV2
    )

    app.get("/admin/form/:fcode/:dcode/getFormDepartment",
        formDepartmentController.validate('getFormDepartment'),
        getValidationResult,
        formDepartmentController.getFormDepartment
    )

    app.post("/admin/form/:fcode/:dcode/addCouncil",
        formDepartmentController.validate('addCouncil'),
        getValidationResult,
        formDepartmentController.addFormDepartmentCouncil
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

    //Form User
    app.get("/admin/form/:fcode/:dcode/getFormUser",
        formUserController.getFormUsers
    )
    app.post("/admin/form/:fcode/:dcode/removeFormUser",
        formUserController.removeFormUser
    )
    app.post("/admin/form/:fcode/:dcode/addFormUser",
        formUserController.addFormUser
    )
    app.get("/admin/form/:fcode/:dcode/formUser/get",
        formUserController.getFormUserAdmin
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

    //userform
    app.get("/admin/form/:fcode/getResults",
        // formController.validate("getResults"),
        // getValidationResult,
        userFormController.getResults
    )

    app.get("/admin/form/:fcode/:dcode/getResults",
        // formController.validate("getResults"),
        // getValidationResult,
        userFormController.getResultsDepartment
    )

    app.get("/admin/form/:fcode/getPoints",
        // formController.validate("getResults"),
        // getValidationResult,
        userFormController.getPoints
    )

    app.get("/admin/form/:fcode/:dcode/getPoints",
        // formController.validate("getResults"),
        // getValidationResult,
        userFormController.getPointsDepartment
    )

    app.get("/admin/form/:fcode/getS",
        // formController.validate("getResults"),
        // getValidationResult,
        evaluationController.testS
    )

    //admin
    app.post("/admin/evaluateform/:id/deleteDB",
        evaluationController.deleteEvaluateFormDB
    )
}