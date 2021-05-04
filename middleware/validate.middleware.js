const {validationResult} = require("express-validator");

exports.getValidationResult = (req,res,next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            statusCode: 422,
            errors: [...new Set(errors.array().map(err=>err.msg))]
        });
    }
    next();
}