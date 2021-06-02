const db = require("../model/");
const {body, param, query} = require("express-validator");
const Criteria = db.criteria;
const CriteriaOption = db.criteriaOption;

exports.validate = (method)=>{
    switch(method){
        case 'getCriteriaOptions':{
            return [
                param("ccode", "Invalid Criteria Code").exists().isString()
            ]
        }
        case 'addCriteriaOption':{
            return [
                param("ccode", "Invalid Criteria Code").exists().isString(),
                body("code", "Invalid Option code").exists().isString(),
                body("name", "Invalid Name").exists().isString(),
                body("max_point", "Max point required").exists(),
                body("max_point", "Invalid max point").exists().isNumeric(),
                body("description", "Invalid description").optional().isString(),
            ]
        }
        case 'editCriteriaOption': {
            return [
                param("ocode", "Invalid Option Code").exists().isString(),
                body("new_ocode", "Invalid Option Code").exists().isString(),
                body("name", "Invalid name").exists().isString(),
                body("description", "Invalid description").optional().isString(),
                body("max_point", "Invalid point").exists().isNumeric()
            ]
        }
        case 'getCriteriaOption':
        case 'deleteCriteriaOption':
        case 'restoreCriteriaOption':    
        {
            return [
                param("ocode", "Invalid Option Code").exists().isString()
            ]
        }
    }
}

//get all options of a criteria
exports.getCriteriaOptions = async (req,res,next)=>{
    const {ccode} = req.params;
    const criteria = await Criteria.findOne({
        code: ccode,
        isDeleted: false
    }).select("_id name code");
    if(!criteria){
        return res.status(404).json({
            statusCode: 404,
            message: "Criteria not found"
        })
    }
    const criteriaOptions = await CriteriaOption.find({
        criteria_id: criteria._id,
        isDeleted: false
    }).select("-__v -isDeleted").sort({"max_point": -1});
    
    return res.status(200).json({
        statusCode: 200,
        message: "Success",
        criteria,
        criteriaOptions
    })
}

//get single option info using code
exports.getCriteriaOption = async (req,res,next)=>{
    const {ocode} = req.params;
    const criteriaOption = await CriteriaOption.findOne({
        code: ocode,
        isDeleted: false
    }).select("-__v -isDeleted");
    if(!criteriaOption){
        return res.status(404).json({
            statusCode: 404,
            message: "Option not found"
        })
    }
    return res.status(200).json({
        statusCode: 200,
        message: "Success",
        criteriaOption
    })
}

exports.addCriteriaOption = async (req,res,next)=>{
    try {
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

    } catch (error) {
        next(error);
    }
}

//edit option
exports.editCriteriaOption = async (req,res,next)=>{
    try {
        const {ocode} = req.params;
        const {new_ocode, name, max_point, description } = req.body;

        const criteriaOption = await CriteriaOption.findOne({
            code: ocode,
            isDeleted: false
        })

        criteriaOption.code = new_ocode;
        criteriaOption.name = name;
        criteriaOption.max_point = max_point;
        criteriaOption.description = description;

        criteriaOption.save((err)=>{
            if (err && err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                return res.status(409).send({
                    statusCode: 409,
                    message: 'Criteria already exists!'
                });
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Success"
            })
        })
    } catch (error) {
        next(error);
    }
}

//set isDeleted - true
exports.deleteCriteriaOption = async (req,res,next)=>{
    try {
        const {ocode} = req.params;
        const criteriaOption = await CriteriaOption.findOne({
            code: ocode,
            isDeleted: false
        })

        if(!criteriaOption){
            return res.status(404).json({
                statusCode: 404,
                message: "Option not found"
            })
        }

        criteriaOption.isDeleted = true;
        criteriaOption.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
    } catch (error) {
        next(error);
    }
}

//set isDeleted - false
exports.restoreCriteriaOption = async (req,res,next)=>{
    try {
        const {ocode} = req.params;
        const criteriaOption = await CriteriaOption.findOne({
            code: ocode,
            isDeleted: true
        })

        if(!criteriaOption){
            return res.status(404).json({
                statusCode: 404,
                message: "Option not found"
            })
        }

        criteriaOption.isDeleted = false;
        criteriaOption.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
    } catch (error) {
        next(error);
    }
}

//get deleted options of a criteria
exports.getDeletedCriteriaOptions = async (req,res,next)=>{
    try {
        const {ccode} = req.params;
        const criteria = await Criteria.findOne({
            code: ccode,
            isDeleted: false
        }).select("_id code name");
        if(!criteria){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found"
            })
        }
        const criteriaOptions = await CriteriaOption.find({
            criteria_id: criteria._id,
            isDeleted: true
        }).select("-__v -isDeleted").sort({"max_point": -1});
        
        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            criteria,
            criteriaOptions
        })
    } catch (error) {
        next(error);
    }
}