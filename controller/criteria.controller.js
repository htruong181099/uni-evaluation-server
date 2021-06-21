const db = require("../model/");
const {body, param} = require("express-validator");
const Criteria = db.criteria;
const Standard = db.standard;

exports.validate = (method)=>{
    switch(method){
        case 'addCriteria': {
            return [
                param('id', 'Invalid Standard ID').exists().isMongoId(),
                body('code','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('description', "Invalid description format").optional().isString()
            ]
        };
        case 'deleteCriteriaDB':
        case 'getCriteria': {
            return [
                param('id','Invalid Criteria ID').exists().isMongoId()
            ]
        };
        case 'getCriterionsbyCode': {
            return [
                param('scode','Invalid Criteria Code').exists().isString()
            ]
        }
        case 'deleteCriteria':
        case 'restoreCriteria': {
            return [
                param('ccode','Invalid Criteria Code').exists().isString()
            ]
        }
        case 'getCriterions':
        case 'getDeletedCriterions':
        {
            //param {id}
            return [
                param('id','Invalid Standard Id').exists().isMongoId()
            ]
        }
        case 'editCriteria': {
            //param {ccode}
            //body {new_ccode, name, description, type}
            return [
                param('ccode','Invalid Criteria Code').exists().isString(),
                body('new_ccode','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('description','Invalid Description').exists().isString(),
                body('type','Invalid Type').exists().isString(),
            ]
        }
    }
}

//add new criteria
exports.addCriteria = async (req,res,next)=>{
    try{
        const {id} = req.params;
        const {code, name, description, type} = req.body;
    
        const standard = await Standard.findById(id).select("_id");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }

        if (!['radio','checkbox','input','detail'].includes(type)){
            return res.status(422).json({
                statusCode: 422,
                message: "Invalid Type"
            })
        }

        const criteria = new Criteria({
            code,
            name,
            description,
            type,
            standard: standard._id
        });

        await criteria.save((err)=>{
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
                message: "Add criteria successfully"
            })
        })
    }
    catch(error){
        next(err);
    }
}

//get all the criteria in database
exports.getAllCriterions = async (req,res,next)=>{
    try {
        const criterions = await Criteria.find({
            isDeleted: false
        })
        .lean()
        .sort({"create_date": -1})
        .select("-__v -create_date");

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            criterions
        })
    } catch (error) {
        next(error);
    }        
}

//get all the criteria of a standard
exports.getCriterions = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const standard = await Standard.findOne({
            _id: id,
            isDeleted: false
        })
        .lean()
        .select("_id code name");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }
        const criterions = await Criteria.find({
            standard: standard._id,
            isDeleted: false
        })
        .lean()
        .sort({"code": 1})
        .select("-__v -create_date -standard");
        
        return res.status(200).json({
            statusCode: 200,
            standard,
            criterions
        })
    } catch (error) {
        next(error);
    }        
}

//get all the criteria of a standard
exports.getCriterionsbyCode = async (req,res,next)=>{
    try {
        const {scode} = req.params;
        const standard = await Standard.findOne({
            code: scode,
            isDeleted: false
        })
        .lean()
        .select("_id code name");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }
        const criterions = await Criteria.find({
            standard: standard._id,
            isDeleted: false
        })
        .lean()
        .sort({"code": 1})
        .select("-__v -create_date -standard");
        
        return res.status(200).json({
            statusCode: 200,
            standard,
            criterions
        })
    } catch (error) {
        next(error);
    }        
}

//get Criteria detail
exports.getCriteria = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const criteria = await Criteria.find({
            _id: id,
            isDeleted: false
        })
        .lean()
        .select("-__v -create_date");

        if(!criteria){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found"
            })
        }

        return res.status(200).json({
            statusCode: 200,
            message: "OK",
            criteria
        })
    } catch (error) {
        next(error);
    }        
}

//delete Criteria from DB
exports.deleteCriteriaDB = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const criteria = await Criteria.findOne({id}).select("_id");
        
        if(!criteria){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found"
            });
        }
        Criteria.deleteOne({_id: id}, (err)=>{
            if(err){
                next(err);
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

//set Criteria isDeleted to true
exports.deleteCriteria = async (req,res,next)=>{
    try {
        const {ccode} = req.params;
        const criteria = await Criteria.findOne({
            code: ccode,
            isDeleted: false
        }).select("_id isDeleted");
        
        if(!criteria){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found or had been deleted"
            });
        }
        criteria.isDeleted = true;
        criteria.save();
        return res.status(200).send({
            statusCode: 200,
            message: "Success"
        })
    } catch (error) {
        next(error);
    }        
}

//set Criteria isDeleted to false
exports.restoreCriteria = async (req,res,next)=>{
    try {
        const {ccode} = req.params;
        const criteria = await Criteria.findOne({
            code: ccode,
            isDeleted: true
        }).select("_id isDeleted");
        
        if(!criteria){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found or had been deleted"
            });
        }
        criteria.isDeleted = false;
        await criteria.save();
        return res.status(200).send({
            statusCode: 200,
            message: "Restore Criteria successfully"
        })
    } catch (error) {
        next(error);
    }        
}

//edit Criteria
exports.editCriteria = async (req,res,next)=>{
    try {
        const {ccode} = req.params;
        const {new_ccode, name, description, type} = req.body;

        if(!['radio', 'checkbox', 'input', 'detail'].includes(type)){
            return res.status(422).send({
                statusCode: 422,
                message: "Invalid type"
            })
        }

        const criteria = await Criteria.findOne({
            code: ccode,
            isDeleted: false
        })
        
        if(!criteria){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found"
            });
        }

        criteria.code = new_ccode;
        criteria.name = name,
        criteria.description = description;
        criteria.type = type;


        criteria.save((err)=>{
            if (err && err.name === 'MongoError' && err.code === 11000) {  // Duplicate
                return res.status(409).send({
                    statusCode: 409,
                    message: 'Criteria already exists!'
                });
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Success"
            })
        });

    } catch (error) {
        next(error);
    }        
}

//get deleted criterions of a standard
exports.getDeletedCriterions = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const standard = await Standard.findOne({
            _id: id,
            isDeleted: false
        })
        .lean()
        .select("_id code name");
        
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }
        const criterions = await Criteria.find({
            standard: standard._id,
            isDeleted: true
        })
        .lean()
        .sort({"code": 1})
        .select("-__v -create_date -standard");
        
        return res.status(200).json({
            statusCode: 200,
            standard,
            criterions
        })
    } catch (error) {
        next(error);
    }        
}

//get all deleted the criteria in database
exports.getAllDeletedCriterions = async (req,res,next)=>{
    try {
        const criterions = await Criteria.find({
            isDeleted: true
        })
        .lean()
        .sort({"create_date": -1})
        .select("-__v -create_date");

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            criterions
        })
    } catch (error) {
        next(error);
    }        
}

//get all possibles criteria's types
exports.getCriteriaTypes = async (req,res,next)=>{
    try {
        const types = Criteria.getCriteriaTypes();
        res.status(200).send({
            statusCode: 200,
            types
        })
    } catch (error) {
        next(error);
    }
}