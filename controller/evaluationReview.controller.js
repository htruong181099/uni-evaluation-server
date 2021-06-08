const db = require("../model/");
const EvaluationReview = db.evaluationReview;
const User = db.user;
const Form = db.form;
const FormUser = db.formUser;
const {body, param, query} = require("express-validator");


validate = (method)=>{
    switch(method){
        case 'addEvaluationReview': {
            return [
                body('code','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('start_date', 'Invalid starting date').exists(),
                body('end_date', 'Invalid starting date').exists(),
                body('description', "Invalid description format").optional().isString()
            ]
        };
        case 'editEvaluationReview': {
            return [
                param("rcode", "Invalid Code").exists().isString(),
                body('new_rcode','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('start_date', 'Invalid starting date').exists(),
                body('end_date', 'Invalid starting date').exists(),
                body('description', "Invalid description format").optional().isString()
            ]
        };
        case 'getEvaluationReview':
        case 'deleteEvaluationReview':
        case 'restoreEvaluationReview':
        {
            return [
                param("rcode", "Invalid Code").exists().isString()
            ]
        }
    }
}

//create new review
addEvaluationReview = async (req,res,next)=>{
    try{
        const {code, name, start_date, end_date, description} = req.body;
        const evaluationReview = new EvaluationReview({
            code,
            name,
            start_date: new Date(start_date),
            end_date: new Date(end_date),
            description
        });
        await evaluationReview.save((err)=>{
            if(err && err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                return res.status(409).send({
                    statusCode: 409,
                    message: 'Evaluation Review already exists!'
                });
            }
            
            return res.status(200).json({
                statusCode: 200,
                message: "Add Evaluation Review successfully"
            })
        })
    }
    catch(error){
        next(error);
    }
}

//edit review
editEvaluationReview = async (req,res,next)=>{
    try{
        const {rcode} = req.params;
        const {new_rcode, name, start_date, end_date, description} = req.body;
        const evaluationReview = await EvaluationReview.findOne({
            code: rcode,
            isDeleted: false
        });

        evaluationReview.code = new_rcode;
        evaluationReview.name = name;
        evaluationReview.start_date = new Date(start_date),
        evaluationReview.end_date = new Date(end_date),
        evaluationReview.description = description;

        
        await evaluationReview.save((err)=>{
            if (err && err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                return res.status(409).send({
                    statusCode: 409,
                    message: 'Evaluation Review already exists!'
                });
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Success"
            })
        })
    }
    catch(error){
        next(error);
    }
}

//get all reviews
getEvaluationReviews = async (req,res,next)=>{
    try{
        const reviews = await EvaluationReview.find({
            isDeleted: false
        })
        .sort({"end_date": 1})
        .select("-__v -isDeleted")
        return res.status(200).json({
            statusCode: 200,
            reviews
        })
    }
    catch(err){
        next(err);
    }
}

//get all deleted reviews
getDeletedEvaluationReviews = async (req,res,next)=>{
    try{
        const reviews = await EvaluationReview.find({
            isDeleted: true
        }).lean()
        .sort({"end_date": 1})
        .select("-__v -isDeleted")
        return res.status(200).json({
            statusCode: 200,
            reviews
        })
    }
    catch(err){
        next(err);
    }
}

//delete review
deleteEvaluationReview = async (req,res,next)=>{
    try{
        const {rcode} = req.params;
        const review = await EvaluationReview.findOne({
            code: rcode,
            isDeleted: false
        })
        .sort({"end_date": 1})
        .select("-__v -isDeleted")
        if(!review){
            return res.status(404).json({
                statusCode: 404,
                message: "Review not found"
            })
        }
        review.isDeleted = true;
        review.save();
        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
    }
    catch(err){
        next(err);
    }
}

//restore review
restoreEvaluationReview = async (req,res,next)=>{
    try{
        const {rcode} = req.params;
        const review = await EvaluationReview.findOne({
            code: rcode,
            isDeleted: true
        })
        .sort({"end_date": 1})
        .select("-__v -isDeleted")
        if(!review){
            return res.status(404).json({
                statusCode: 404,
                message: "Review not found"
            })
        }
        review.isDeleted = false;
        review.save();
        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
    }
    catch(err){
        next(err);
    }
}

//get review
getEvaluationReview = async (req,res,next)=>{
    try{
        const {rcode}= req.params;
        const review = await EvaluationReview.findOne({
            code: rcode,
            isDeleted: false
        })
        .lean()
        .sort({"end_date": 1})
        .select("-__v -isDeleted")
        if(!review){
            return res.status(404).json({
                statusCode: 404,
                message: "Review not found"
            })
        }

        return res.status(200).json({
            statusCode: 200,
            review
        })
    }
    catch(err){
        next(err);
    }
}

getUserReviews = async (req,res,next)=>{
    try{
        const user = await User.findOne({
            _id: req.userId,
            isDeleted: false
        }).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }
        const formUsers = await FormUser.find({
            user_id: user._id,
            isDeleted: false
        }).select("form_id");

        const forms = await Form.find({
            _id: formUsers.map(e=>e.form_id),

        }).select("review")
        const reviews = await EvaluationReview.find({
            _id: forms.map(form => form.review),
            isDeleted: false
        })
        .lean()
        .sort({"end_date": 1})
        .select("-__v -isDeleted")
        return res.status(200).json({
            statusCode: 200,
            reviews
        })
    }
    catch(err){
        next(err);
    }
}

module.exports = {
    validate,
    addEvaluationReview,    //create new review
    editEvaluationReview,   //edit review
    getEvaluationReviews,   // get all reviews
    getDeletedEvaluationReviews,    //get all deleted reviews
    deleteEvaluationReview,     //delete review
    restoreEvaluationReview,    //restore review
    getEvaluationReview,    //get review
    getUserReviews  //get reviews that user attending
}