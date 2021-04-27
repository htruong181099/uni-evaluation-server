const db = require("../model/");
const Department = db.department;

exports.getDepartments = async (req,res,next)=>{
    try{
        const departments = await Department.find()
                    .sort({"department_code": 1})
                    .populate("manager")
                    .select("-__v");
        return res.status(200).json({
            statusCode: 200,
            message: "OK",
            departments
        })
    }
    catch(error){
        next(error);
    }
}

exports.getDepartment = async (req,res,next)=>{
    try{
        const {id} = req.params.id;
        const department = await Department.findById(id)
                    .select("-__v");
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        return res.status(200).json({
            statusCode: 200,
            message: "OK",
            department
        })
    }
    catch(error){
        next(error);
    }
}