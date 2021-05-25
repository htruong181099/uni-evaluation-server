const db = require("../model/");
const Department = db.department;
const User = db.user;

exports.addDepartment = async (req,res,next)=>{
    try{
        const {department_code, name, manager, parent} = req.body;
        const department = new Department({
            department_code,
            name
        })
        if(manager){
            const user = await User.findOne({
                staff_id: manager
            }).select("_id");
            if(!user){
                return res.status(404).json({
                    statusCode: 404,
                    message: "User not found"
                })
            }
            department.manager = user._id;
        }
        
        
        if(parent){
            const dep = await Department.findOne({
                department_code: parent
            }).select("_id");
            if(!dep){
                return res.status(404).json({
                    statusCode: 404,
                    message: "Department not found"
                })
            }
            department.parent = dep._id;
        }
        await department.save(async (err, dep)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                    return res.status(409).send({
                        statusCode: 409,
                        message: 'Department already exists!'
                    });
                }
                return next(err);
            }
            if(dep.manager){
                const user = await User.findById(dep.manager).select("_id department");
                let depList= user.department;
                depList.push(dep._id);
                if(dep.parent){
                    depList.push(dep.parent);
                }
                user.department = depList;
                await user.save();
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Add Department successfully"
            })
        })
    }
    catch(error){
        next(error);
    }
}

exports.getDepartments = async (req,res,next)=>{
    try{
        const departments = await Department.find({
            isDeleted: false
        })
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
        const {code} = req.params;
        const department = await Department.findOne({
            department_code: code
        })
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

exports.getParentDepartments = async (req,res,next)=>{
    try {
        const parents = await Department.find({
            parent: null,
            isDeleted: false
        }).select("-__v -isDeleted")
        
        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            parents
        })
    } catch (error) {
        next(error);
    }
}

exports.getChildDepartments = async (req,res,next)=>{
    try {
        const {code} = req.params;
        const parent = await Department.findOne({
            department_code: code,
            isDeleted: false
        }).select("-__v -isDeleted");

        if(!parent){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        
        const children = await Department.find({
            parent: parent._id,
            isDeleted: false
        }).select("-__v -isDeleted")

        res.status(200).json({
            statusCode: 200,
            message: "Success",
            parent,
            children
        })
    } catch (error) {
        next(error);
    }
}

exports.getParentsWithChildren = async (req,res,next)=>{
    try {
        const parents = await Department.find({
            parent: null,
            isDeleted: false
        }).select("-__v -isDeleted").lean()
        .populate("manager", "staff_id firstname lastname")
        
        for(let i in parents){
            const parent = parents[i];
            const children = await Department.find({
                parent: parent._id,
                isDeleted: false
            }).select("-__v -isDeleted -parent -_id")
            .populate("manager", "staff_id firstname lastname")
            parent.children = children;
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            parents
        })
    } catch (error) {
        next(error);
    }
}