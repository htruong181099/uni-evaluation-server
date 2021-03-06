//router
const AdminRouter = require("./admin/")

//controller
const {formRatingController, evaluationController, userFormController, criteriaController, fileController} = require("../controller/");
const formController = require("../controller/form.controller");
const formDepartmentController = require("../controller/formDepartment.controller");
const formUserController = require("../controller/formUser.controller");
const formStandardController = require("../controller/formStandard.controller");
const formCriteriaController = require("../controller/formCriteria.controller");

//middleware
const jwtMiddleware = require('../middleware/jwt.middleware');
const {getValidationResult} = require("../middleware/validate.middleware");
const upload = require("../middleware/multer.middleware")


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

    AdminRouter(app);
    

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

    app.get("/admin/form/:fcode/getReviewForm",
        formController.getReviewFormAdmin
    )

    //formUser
    app.get("/admin/form/:fcode/:dcode/getFormUser",
        formUserController.validate('getFormUsers'),
        getValidationResult,
        formUserController.getFormUsers
    )
    app.post("/admin/form/:fcode/:dcode/removeFormUser",
        formUserController.validate('removeFormUser'),
        getValidationResult,
        formUserController.removeFormUser
    )
    app.post("/admin/form/:fcode/:dcode/addFormUser",
        formUserController.validate('addFormUser'),
        getValidationResult,
        formUserController.addFormUser
    )
    app.get("/admin/form/:fcode/:dcode/formUser/get",
        formUserController.validate('getFormUsersAdmin'),
        getValidationResult,
        formUserController.getFormUsersAdmin
    )

    //formStandard
    app.get("/admin/form/:fcode/getFormStandard",
        formStandardController.validate('getFormStandards'),
        getValidationResult,
        formStandardController.getFormStandards
    )
    app.post("/admin/form/:fcode/addFormStandard",
        formStandardController.addFormStandard
    )

    app.post("/admin/form/:fcode/addFormStandard/v2",
        formStandardController.validate('addFormStandardV2'),
        getValidationResult,
        formStandardController.addFormStandardV2
    )

    app.post("/admin/form/:fcode/editFormStandard",
        formStandardController.validate('editFormStandard'),
        getValidationResult,
        formStandardController.editFormStandard
    )

    app.get("/admin/form/:fcode/standard/:scode/getFormStandardAndCriteria",
        formStandardController.validate('getFormStandardAndCriteria'),
        getValidationResult,
        formStandardController.getFormStandardAndCriteria
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
    app.post("/admin/formrating/:id/edit",
        formRatingController.validate('editFormRating'),
        getValidationResult,
        formRatingController.editFormRating
    )
    app.post("/admin/formrating/:id/delete",
        formRatingController.validate('deleteFormRatingDB'),
        getValidationResult,
        formRatingController.deleteFormRatingDB
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

    app.post("/admin/formdep/:fcode/deleteDB",
        formDepartmentController.deleteDB
    )

    app.post("/:fcode/testA",
        upload.single('file'),
        fileController.readExcelEvaluateCriteria,
        fileController.importEvaluations,
        fileController.deleteFile
    )

    app.post("/xoarac/:id",
        fileController.a
    )

    app.post("/wwe/:id",
        fileController.a
    )

    app.post("/wwe2/:id",
        fileController.a2
    )

    app.post("/wwe3/",
        fileController.a3
    )

    app.post("/wwe4/",
        fileController.a4
    )

    app.post("/wwe5/:id",
        fileController.delEC
    )

    app.post("/tester",
        fileController.tester
    )

    app.post("/fd/:id/deleteDB",
        formDepartmentController.deleteDB
    )

    app.post("/upModel",
        fileController.upmodel
    )
}