const FormType = require("../model/").formType;

exports.getFormType = async (req,res,next)=>{
    try{
        const formTypeList = await FormType.find()
            .select("-__v")    
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