const { formController, evaluationController } = require("../../controller/");
const { getValidationResult } = require("../../middleware/validate.middleware");

module.exports = (app) => {

    app.get("/admin/userform/:ufid/get",
        formController.validate("getEvaFormv2"),
        getValidationResult,
        formController.getEvaFormAdmin
    )

    app.get("/admin/userform/:ufid/evaluation/get",
        formController.validate("getEvaluation"),
        getValidationResult,
        evaluationController.getEvaluationAdmin
    )
}