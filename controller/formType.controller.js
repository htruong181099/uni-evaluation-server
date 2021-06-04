const FormType = require("../model/").formType;

exports.getFormTypes = async (req,res,next)=>{
    try{
        const formTypeList = await FormType.find()
        .select("-__v -isDeleted")    
        .sort({"code": 1})
        res.status(200).json({
            statusCode: 200,
            message: "Success",
            formTypeList
        })
    }
    catch(error){
        next(error);
    }
}