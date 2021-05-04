const EvaluationReview = require("../model/").evaluationReview;
const {body, param, query, validationResult} = require("express-validator");

exports.validate = (method)=>{
    switch(method){
        case 'add': {
            return [
                body('code','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('start_date', 'Invalid starting date').exists(),
                body('end_date', 'Invalid starting date').exists(),
                body('description', "Invalid description format").optional().isString()
            ]
        };
    }
}

exports.addEvaluationReview = async (req,res,next)=>{
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
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                    return res.status(409).send({message: 'Evaluation Review already exists!'});
                }
                return res.status(500).send({message: err});
            }
            return res.status(200).json({
                message: "Add Evaluation Review successfully"
            })
        })
    }
    catch(error){
        next(err);
    }
}

exports.getEvaluationReview = async (req,res,next)=>{
    try{
        const reviews = await EvaluationReview.find()
                            .sort({"end_date": 1})
                            .select("-__v")
        return res.status(200).json({
            statusCode: 200,
            reviews
        })
    }
    catch(err){
        next(err);
    }
}

exports.test = async (req,res,next)=>{
    console.log(req.body);
    res.status(200).json({
        message: "ok",
        test: new Date(req.body.start_date)
    })

}