const jwtMiddleware = require("../middleware/jwt.middleware")

const reviewController = require("../controller/evaluationReview.controller")

module.exports = function(app){
    app.use("/form/", 
        jwtMiddleware.verifyToken,
    )
    app.get("/form/review", 
        reviewController.getUserReviews
    );
    app.get("/form/review/:rcode/form", 
    );
}