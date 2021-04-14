const db = require("../model/");
const {body, param, query, validationResult} = require("express-validator");
const Criteria = db.criteria;
const Standard = db.standard;

exports.addCriteriaValidate = async(req,res,next)=>{
    return [
        body('code','Invalid Code').exists().isString(),
        body('content','Invalid Content').exists().isString(),
        param('id','Invalid StandardID').exists().isMongoId()
    ]
}

exports.addCriteria = async (req,res,next)=>{
    try{
        const {code, content} = req.body;
        const standard = req.params.id;
    
    
        const criteria = new Criteria({
            code,
            content,
            standard
        });
        await criteria.save((err)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                    return res.status(409).send({message: 'Criteria already exists!'});
                }
                return res.status(500).send({message: err});
            }
        })
        return res.status(200).json({
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
        const {standard} = req.param.id;
        const criterions = await Criteria.find({standard})
                            .select("-__v -create_date");
        res.status(200).json({
            criterions
        })
    } catch (error) {
        next(error);
    }        
}