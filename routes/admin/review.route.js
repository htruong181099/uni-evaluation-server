const {getValidationResult} = require("../../middleware/validate.middleware");
const {evaluationReviewController} = require("../../controller/");

module.exports = (app) =>{
    //evaluation review
    app.get("/admin/review",
        evaluationReviewController.getEvaluationReviews
    )
    app.post("/admin/review/add",
        evaluationReviewController.validate('addEvaluationReview'),
        getValidationResult,
        evaluationReviewController.addEvaluationReview
    )
    app.post("/admin/review/:rcode/edit",
        evaluationReviewController.validate('editEvaluationReview'),
        getValidationResult,
        evaluationReviewController.editEvaluationReview
    )
    app.post("/admin/review/:rcode/delete",
        evaluationReviewController.validate('deleteEvaluationReview'),
        getValidationResult,
        evaluationReviewController.deleteEvaluationReview
    )
    app.post("/admin/review/:rcode/restore",
        evaluationReviewController.validate('restoreEvaluationReview'),
        getValidationResult,
        evaluationReviewController.restoreEvaluationReview
    )
    //get deleted review
    app.get("/admin/review/deleted",
        evaluationReviewController.getDeletedEvaluationReviews
    )
    //get review
    app.get("/admin/review/:rcode",
        evaluationReviewController.validate('getEvaluationReview'),
        getValidationResult,
        evaluationReviewController.getEvaluationReview
    )
}