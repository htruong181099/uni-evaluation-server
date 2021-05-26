const jwtMiddleware = require("../middleware/jwt.middleware");

const reviewController = require("../controller/evaluationReview.controller");
const formController = require("../controller/form.controller");
const {userFormController, evaluationController} = require("../controller/");

const {getValidationResult} = require("../middleware/validate.middleware");

module.exports = function(app){
    app.use("/form/", 
        jwtMiddleware.verifyToken,
    )
    app.get("/form/review",
        reviewController.getUserReviews
    );

    //get forms from reviews
    app.get("/form/review/:rcode/form", 
        formController.validate("getUserForms"),
        getValidationResult,
        formController.getUserForms
    );

    app.get("/form/:fcode/v1", 
        formController.validate("getEvaForm"),
        getValidationResult,
        userFormController.getUserForm,
        formController.getEvaForm
    );

    app.get("/form/:ufid/v2", 
        formController.validate("getEvaFormv2"),
        getValidationResult,
        userFormController.getUserFormV2,
        formController.getEvaFormV2
    );
    //v1
    app.post("/form/:ufid/submitForm",
        evaluationController.submitEvaluation
    )

    app.post("/form/:ufid/saveForm",
        evaluationController.saveEvaluation
    )
    //v2
    app.post("/form/:ufid/submitForm/v2",
        evaluationController.submitEvaluationV2
    )

    app.post("/form/:ufid/saveForm/v2",
        evaluationController.saveEvaluationV2
    )
    app.get("/form/:ufid/evaluation/get",
        formController.validate("getEvaluation"),
        getValidationResult,
        evaluationController.getEvaluation
    )

    app.post("/form/:ufid/evaluation/test",
        (req,res,next) => {
            console.log(req.body)
            return res.status(200).send({
                body: req.body
            })
        }
    )

}