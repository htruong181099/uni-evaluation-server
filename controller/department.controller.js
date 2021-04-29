const db = require("../model/");
const Department = db.department;
const User = db.user;

exports.getDepartments = async (req,res,next)=>{
    try{
        const departments = await Department.find()
                    .sort({"department_code": 1})
                    .populate("manager","staff_id firstname lastname")
                    .populate("parent","department_code name")
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
        const {id} = req.params;
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

exports.getDepartmentUser = async (req,res,next)=>{
    try{
        const {id} = req.params;
        const department = await Department.findById(id)
                    .select("_id");
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        const user = await User.find({department: department._id})
                    .select("-__v -password")
        return res.status(200).json({
            statusCode: 200,
            message: "OK",
            user
        })
    }
    catch(error){
        next(error);
    }
}

