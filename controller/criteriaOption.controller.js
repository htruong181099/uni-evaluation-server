const db = require("../model/");
const {body, param, query, validationResult} = require("express-validator");
const Criteria = db.criteria;
const CriteriaOption = db.criteriaOption;

exports.validate = (method)=>{
    switch(method){
        case 'getCriteriaOption':{
            return [
                param("ccode", "invalid Criteria Code").exists().isString()
            ]
        }
        case 'addCriteriaOption':{
            return [
                param("ccode", "invalid Criteria Code").exists().isString(),
                body("code", "Invalid Option code").exists().isString(),
                body("name", "Invalid Name").exists().isString(),
                body("max_point", "Max point required").exists(),
                body("max_point", "Invalid max point").exists().isNumeric(),
                body("description", "Invalid description").optional().isString(),
            ]
        }
    }
}

exports.getCriteriaOption = async (req,res,next)=>{
    const {ccode} = req.params;
    const criteria = await Criteria.findOne({
        code: ccode
    }).select("_id");
    if(!criteria){
        return res.status(404).json({
            statusCode: 404,
            message: "Criteria not found"
        })
    }
    console.log(criteria);
    const criteriaOptions = await CriteriaOption.find({
        criteria_id: criteria._id,
        isDeleted: false
    }).select("-__v -isDeleted").sort({"max_point": -1});
    
    return res.status(200).json({
        statusCode: 200,
        message: "Success",
        criteriaOptions
    })
}

exports.addCriteriaOption = async (req,res,next)=>{
    const {ccode} = req.params;
    const {code, name, max_point, description } = req.body;

    const criteria = await Criteria.findOne({
        code: ccode
    }).select("_id");
    if(!criteria){
        return res.status(404).json({
            statusCode: 404,
            message: "Criteria not found"
        })
    }

    const criteriaOption = new CriteriaOption({
        criteria_id: criteria._id,
        code,
        name,
        max_point,
        description
    })
    criteriaOption.save((err)=>{
        if(err){
            if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                return res.status(409).send({
                    statusCode: 409,
                    message: 'Criteria already exists!'
                });
            }
            return next(err);
        }
        return res.status(200).json({
            statusCode: 200,
            message: "Add criteria option successfully"
        })
    })
}