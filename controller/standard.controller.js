const db = require("../model/");
const {body, param, query, validationResult} = require("express-validator");
const Criteria = require("../model/criteria.model");
const Standard = db.standard;

exports.validate = (method)=>{
    switch(method){
        case 'addStandard': {
            return [
                body('code','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('description').optional().isString()
            ]
        };
        case 'getStandard':{
            return [
                param('id','Invalid Standard Id').exists().isMongoId()
            ]
        };
        case 'deleteStandard':{
            return [
                param('id','Invalid Standard Id').exists().isMongoId()
            ]
        }
    }
}

exports.addStandard = async (req,res,next)=>{
    try{
        const {code, name, description} = req.body;
        const standard = new Standard({
            code,
            name,
            description
        });
        standard.save((err)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                    return res.status(409).json({
                        statusCode: 409,
                        message: 'Standard already exists!'
                    });
                }
                next(err);
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Add standard successfully"
            })
        })
        
    }
    catch(error){
        next(error);
    }
}


//get all the standards
exports.getStandards = async (req,res,next)=>{
    try {
        const standards = await Standard.find()
                        .sort({"code": 1})
                        .select("-__v -create_date");
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            standards
        })
    } catch (error) {
        next(error);
    }        
}

//get standard info
exports.getStandard = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const standard = await Standard.findById(id).select("-__v -create_date");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            });
        }
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            standard
        })
    } catch (error) {
        next(error);
    }        
}

exports.deleteStandard = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const standard = await Standard.findById(id).select("_id");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            });
        }
        Standard.deleteOne({_id: id}, (err)=>{
            if(err){
                res.status(500).json({
                    error: err
                })
            }
            res.status(200).json({
                statusCode: 200,
                message: "Delete successfully"
            })
        });
        
        
    } catch (error) {
        next(error);
    }        
}

exports.getStandardsWithCriteria = async (req,res,next)=>{
    try {
        const standards = await Standard.find()
                        .sort({"code": 1})
                        .select("-__v -create_date -isDeleted")
                        .lean();
        for(let i in standards){
            const criteria = await Criteria.find({
                standard: standards[i]._id
            })
            .sort({"code": 1})
            .select("-__v -isDeleted -create_date");
            standards[i].criteria = criteria;
        }
        return res.status(200).json({
            statusCode: 200,
            message: "OK",
            standards
        })
    } catch (error) {
        next(error);
    }        
}