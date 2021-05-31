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
        case 'editStandard': {
            return [
                param('scode','Invalid Standard Code').exists().isString(),
                body('new_ccode','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('description').optional().isString()
            ]
        };
        case 'editStandardbyID': {
            return [
                param('id','Invalid Standard Id').exists().isMongoId(),
                body('new_ccode','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('description').optional().isString()
            ]
        };
        case 'deleteStandardbyID':
        case 'getStandardbyID':{
            return [
                param('id','Invalid Standard Id').exists().isMongoId()
            ]
        };
        case 'deleteStandardDB':{
            return [
                param('id','Invalid Standard Id').exists().isMongoId()
            ]
        }
        case 'getStandard':
        case 'deleteStandard':
        case 'restoreStandard':{
            return [
                param('scode','Invalid Standard Id').exists().isString()
            ]
        }
    }
}

//create new standard
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
                return next(err);
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
        const standards = await Standard.find({
            isDeleted: false
        }).sort({"code": 1})
        .select("-__v -create_date -isDeleted");

        res.status(200).json({
            statusCode: 200,
            message: "Success",
            standards
        })
    } catch (error) {
        next(error);
    }        
}

//get all the standards
exports.getDeletedStandards = async (req,res,next)=>{
    try {
        const standards = await Standard.find({
            isDeleted: true
        }).sort({"code": 1})
        .select("-__v -create_date -isDeleted");

        res.status(200).json({
            statusCode: 200,
            message: "Success",
            standards
        })
    } catch (error) {
        next(error);
    }        
}

//get standard info by ID
exports.getStandardbyID = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const standard = await Standard.findOne({
            _id: id,
            isDeleted: false
        }).select("-__v -create_date");
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

//get standard info by Code
exports.getStandard = async (req,res,next)=>{
    try {
        const {scode} = req.params;
        const standard = await Standard.findOne({
            code: scode,
            isDeleted: false
        }).select("-__v -create_date");
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

//delete standard by ID from DB
exports.deleteStandardDB = async (req,res,next)=>{
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
                next(err);
                return;
            }
            return res.status(200).json({
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
        const standards = await Standard.find({
            isDeleted: false
        })
        .sort({"code": 1})
        .select("-__v -create_date -isDeleted")
        .lean();
        for(let i in standards){
            const criteria = await Criteria.find({
                standard: standards[i]._id,
                isDeleted: false
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

//set isDeleted - true by ID
exports.deleteStandardbyID = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const standard = await Standard.findOne({
            _id: id,
            isDeleted: false
        }).select("_id");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            });
        }
        
        standard.isDeleted = true;
        standard.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
        
    } catch (error) {
        next(error);
    }        
}

//set isDeleted - true by Code
exports.deleteStandard = async (req,res,next)=>{
    try {
        const {scode} = req.params;
        const standard = await Standard.findOne({
            code: scode,
            isDeleted: false
        }).select("_id");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            });
        }
        
        standard.isDeleted = true;
        standard.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
        
    } catch (error) {
        next(error);
    }        
}

//set isDeleted - false
exports.restoreStandard = async (req,res,next)=>{
    try {
        const {scode} = req.params;
        const standard = await Standard.findOne({
            code: scode,
            isDeleted: true
        }).select("_id");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            });
        }
        
        standard.isDeleted = false;
        standard.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
        
    } catch (error) {
        next(error);
    }        
}

//edit Standard
exports.editStandard = async (req,res,next)=>{
    try{
        const {scode} = req.params;
        const {new_ccode, name, description} = req.body;

        const standard = await Standard.findOne({
            code: scode,
            isDeleted: false
        });

        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }

        standard.code = new_ccode;
        standard.name = name;
        standard.description = description;

        standard.save((err)=>{
            if (err && err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                return res.status(409).json({
                    statusCode: 409,
                    message: 'Standard already exists!'
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

//edit Standard by ID
exports.editStandardbyID = async (req,res,next)=>{
    try{
        const {id} = req.params;
        const {new_ccode, name, description} = req.body;

        const standard = await Standard.findOne({
            _id: id,
            isDeleted: false
        });

        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }

        standard.code = new_ccode;
        standard.name = name;
        standard.description = description;

        standard.save((err)=>{
            if (err && err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                return res.status(409).json({
                    statusCode: 409,
                    message: 'Standard already exists!'
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