const db = require("../model/");
const {body, param, query, validationResult} = require("express-validator");
const { criteria } = require("../model/");
const Criteria = db.criteria;
const CriteriaOption = db.criteriaOption;

exports.validate = (method)=>{
    switch(method){
        case 'addCriteriaOption':{

        }
    }
}

exports.addCriteriaOption = async (req,res,next)=>{
    const {ccode} = req.params;
    const {code, name, max_point, description } = req.body;

    const criteria = await Criteria.findOne({
        ccode
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