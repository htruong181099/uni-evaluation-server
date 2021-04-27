const db = require("../model/");
const {body, param, query, validationResult} = require("express-validator");
const Criteria = db.criteria;
const Standard = db.standard;

exports.validate = (method)=>{
    switch(method){
        case 'add': {
            return [
                body('code','Invalid Code').exists().isString(),
                body('name','Invalid Name').exists().isString(),
                body('description', "Invalid description format").optional().isString()
            ]
        };
        case 'getCriteria':{
            return [
                param('id','Invalid CriteriaId').exists().isMongoId()
            ]
        };
        case 'deleteCriteria':{
            return [
                param('id','Invalid CriteriaId').exists().isMongoId()
            ]
        }
    }
}

exports.addCriteria = async (req,res,next)=>{
    try{
        const {id} = req.params;
        const {code, name, description} = req.body;
    
        const criteria = new Criteria({
            code,
            name,
            description,
            standard: id
        });
        await criteria.save((err)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                    return res.status(409).send({
                        statusCode: 409,
                        message: 'Criteria already exists!'
                    });
                }
                return res.status(500).send({message: err});
            }
        })
        return res.status(200).json({
            statusCode: 200,
            message: "Add criteria successfully"
        })
    }
    catch(error){
        next(err);
    }
}

//get all the criteria in database
exports.getAllCriterions = async (req,res,next)=>{
    try {
        const criterions = await Criteria.find()
                            .sort({"create_date": -1})
                            .select("-__v -create_date");
        res.status(200).json({
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
        const standard = id;
        const criterions = await Criteria.find({standard})
                            .select("-__v -create_date");
        res.status(200).json({
            criterions
        })
    } catch (error) {
        next(error);
    }        
}

exports.getCriteria = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const criteria = await Criteria.findById(id)
                            .select("-__v -create_date");
        if(!criteria){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found"
            })
        }
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            criteria
        })
    } catch (error) {
        next(error);
    }        
}

exports.deleteCriteria = async (req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            statusCode: 422,
            errors: [...new Set(errors.array().map(err=>err.msg))]
        });
    }
    try {
        const {id} = req.params;
        const criteria = await Criteria.findById(id).select("_id");
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
            res.status(200).json({
                statusCode: 200,
                message: "Delete successfully"
            })
        });

    } catch (error) {
        next(error);
    }        
}