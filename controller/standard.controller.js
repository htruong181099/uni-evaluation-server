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

exports.addStandard = async (req,res,next)=>{
    try{
    
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


//get all the standards
exports.getStandards = async (req,res,next)=>{
    try {
        const standards = await Standard.find()
                            .filter({"create_date": -1})
                            .select("-__v -create_date");
        res.status(200).json({
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
        const standard = await Standard.findById(id).select("-__v");
        res.status(200).json({
            standard
        })
    } catch (error) {
        next(error);
    }        
}