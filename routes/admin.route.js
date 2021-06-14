//router
const CriteriaRouter = require("./admin/criteria.route");
const StandardRouter = require("./admin/standard.route");
const DepartmentRouter = require("./admin/department.route");
const UserFormRouter = require("./admin/userForm.route")
const ReviewRouter = require("./admin/review.route");
const userRouter = require("./admin/user.route");

//controller
const {formRatingController, evaluationController, userFormController} = require("../controller/");
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
        res.status(200).json({
            message: "Admin page"
        });
    })

    //router
    userRouter(app);
    DepartmentRouter(app);
    StandardRouter(app);
    CriteriaRouter(app);
    UserFormRouter(app);
    ReviewRouter(app);

    //form
    //get form
    app.get("/admin/form/:id",
        formController.validate('getFormbyID'),
        getValidationResult,
        formController.getFormbyID
    )
    app.post("/admin/review/:rcode/formtype/:ftcode/form/addForm",
        formController.validate('addForm'),
        getValidationResult,
        formController.addForm
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

    //formUser
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

    app.post("/admin/form/:fcode/addFormStandard/v2",
        formStandardController.addFormStandardV2
    )

    app.post("/admin/form/:fcode/editFormStandard",
        formStandardController.editFormStandard
    )

    //formCriteria
    app.get("/admin/form/:fcode/standard/:scode/getFormCriteria",
        formCriteriaController.validate('getFormCriteria'),
        getValidationResult,
        formCriteriaController.getFormCriteria
    )

    //#outdated#
    app.post("/admin/form/:fcode/standard/:scode/addFormCriteria",
        formCriteriaController.addFormCriteria
    )
    //#outdated#

    //add single formCriteria to formStandard
    app.post("/admin/form/:fcode/standard/:scode/addSingleFormCriteria",
        formCriteriaController.validate('addSingleFormCriteria'),
        getValidationResult,
        formCriteriaController.addSingleFormCriteria
    )

    app.post("/admin/form/:fcode/standard/:scode/editFormCriteria",
        formCriteriaController.validate('editFormCriteria'),
        getValidationResult,
        formCriteriaController.editFormCriteria
    )

    //formRating
    app.get("/admin/formrating/:id",
        formRatingController.validate('getFormRating'),
        getValidationResult,
        formRatingController.getFormRating
    )
    app.get("/admin/form/:fcode/formRating",
        formRatingController.validate('getFormRatings'),
        getValidationResult,
        formRatingController.getFormRatings
    )
    app.post("/admin/form/:fcode/formRating",
        formRatingController.validate('addFormRating'),
        getValidationResult,
        formRatingController.addFormRating
    )


    //userform
    app.get("/admin/form/:fcode/getResults",
        userFormController.validate("getResults"),
        getValidationResult,
        userFormController.getResults
    )

    app.get("/admin/form/:fcode/:dcode/getResults",
        userFormController.validate("getResultsDepartment"),
        getValidationResult,
        userFormController.getResultsDepartment
    )

    app.get("/admin/form/:fcode/getPoints",
        userFormController.validate("getPoints"),
        getValidationResult,
        userFormController.getPoints
    )

    app.get("/admin/form/:fcode/:dcode/getPoints",
        userFormController.validate("getPointsDepartment"),
        getValidationResult,
        userFormController.getPointsDepartment
    )

    app.get("/admin/form/:fcode/classifyStandard",
        evaluationController.validate("classifyStandard"),
        getValidationResult,
        evaluationController.classifyStandard
    )

    app.get("/admin/form/:fcode/classifyStandards",
        evaluationController.validate("classifyStandards"),
        getValidationResult,
        evaluationController.classifyStandards
    )

    //admin
    app.post("/admin/evaluateform/:id/deleteDB",
        evaluationController.deleteEvaluateFormDB
    )
}