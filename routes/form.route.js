const jwtMiddleware = require("../middleware/jwt.middleware");

const reviewController = require("../controller/evaluationReview.controller");
const formController = require("../controller/form.controller");

module.exports = function(app){
    app.use("/form/", 
        jwtMiddleware.verifyToken,
    )
    app.get("/form/review", 
        reviewController.getUserReviews
    );

    //get forms from reviews
    app.get("/form/review/:rcode/form", 
        formController.getUserForms
    );

    app.get("/form/:fcode/", 
        formController.getEvaForm
    );

    app.get("/form/v2/:fid/", 
        formController.getEvaFormbyID
    );

}