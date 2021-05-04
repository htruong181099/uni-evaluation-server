const db = require("../model");
const Form = db.form;
const EvaluationReview = db.evaluationReview;
const FormType = db.formType;

const {body, param, query, validationResult} = require("express-validator");

exports.validate = (method)=>{
    switch(method){
        case 'addForm': {
            return [
                param("rcode","Invalid Review ID").exists().isString(),
                param("ftcode","Invalid Form type ID").exists().isString(),
                body("code","Invalid code input").exists().isString(),
                body("name","Invalid name input").exists().isString()
            ]
        }
        case 'getForm': {
            return [
                param("id","Invalid Form ID").exists().isMongoId()
            ]
        }
        case 'getFormfromFormTypeandReview': {
            return [
                param("rid","Invalid Review ID").exists().isMongoId(),
                param("ftid","Invalid Form type ID").exists().isMongoId(),
            ]
        }
    }
}

exports.addForm = async (req,res,next)=>{
    try {
        const {rcode, ftcode} = req.params;
        const {code, name} = req.body;

        const review = await EvaluationReview.findOne({code: rcode}).select("_id");
        const type = await FormType.findById({code: ftcode}).select("_id");
        if(!review){
            return res.status(404).json({
                statusCode: 404,
                message: "Review not found!"
            })
        }
        if(!type){
            return res.status(404).json({
                statusCode: 404,
                message: "Form type not found!"
            })
        }

        const form = new Form({
            code,
            name,
            type: type._id,
            review: review._id
        })
        form.save((err)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                    return res.status(409).send({message: 'Evaluation Review already exists!'});
                }
                return next(err);
            }
            return res.status(200).json({
                message: "Add Form successfully"
            })
        })
    } catch (error) {
        next(error);
    }  

}

exports.getForm = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const form = await Form.findById(id)  
            .select("-__v");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        return res.status(200).json({
            statusCode: 200,
            message: "success",
            form
        })
    } catch (error) {
        next(error);
    }
}

exports.getFormfromFormTypeandReview = async (req,res,next)=>{
    try {
        const {rid, ftid} = req.params;
        const review = await EvaluationReview.findById(rid).select("_id");
        const type = await FormType.findById(ftid).select("_id");
        if(!review){
            return res.status(404).json({
                statusCode: 404,
                message: "Review not found!"
            })
        }
        if(!type){
            return res.status(404).json({
                statusCode: 404,
                message: "Form type not found!"
            })
        }
        const form = await Form.find({
            review: review._id,
            type: type._id
        }).select("-__v");

        return res.status(200).json({
            statusCode: 200,
            message: "success",
            form
        })
    } catch (error) {
        next(error);
    }
}