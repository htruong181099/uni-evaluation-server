const EvaluationReview = require("../model/").evaluationReview;

exports.addEvaluationReview = async (req,res,next)=>{
    try{
        const {code, name, starting_date, end_date, description} = req.body;
        const evaluationReview = new EvaluationReview({
            code,
            name,
            starting_date,
            end_date,
            description
        });
        await evaluationReview.save((err)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                    return res.status(409).send({message: 'Evaluation Review already exists!'});
                }
                return res.status(500).send({message: err});
            }
        })
        return res.status(200).json({
            message: "Add Evaluation Review successfully"
        })
    }
    catch(error){
        next(err);
    }
}