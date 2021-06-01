const db = require("../model/");
const Department = db.department;
const User = db.user;

const {body, param} = require("express-validator");

exports.validate = (method)=>{
    switch(method){
        case 'getDepartmentbyID': 
        {
            return [
                param("id", "Invalid Department").exists().isMongoId()
            ]
        }
        case 'addDepartment':
        {
            //body{department_code, name, manager, parent} 
            return [
                body("department_code", "Invalid Department").exists().isString(),
                body("name", "Invalid name").exists().isString(),
                body("manager", "Invalid manager").optional().isString(),
                body("parent", "Invalid parent").optional().isString(),
            ]
        }
        case 'getDepartment':
        case 'getDepartmentUser':
        case 'getChildDepartments':
        case 'deleteDepartment':
        case 'restoreDepartment':
        case 'getDeletedChildren':
        {
            //param {dcode}
            return [
                param("dcode", "Invalid Department").exists().isString()
            ]
        };
        case 'editDepartment': {
            //param {dcode}
            //body {new_dcode, name, manager, parent}
            return [
                param("dcode", "Invalid Department").exists().isString(),
                body("new_dcode", "Invalid Department").exists().isString(),
                body("name", "Invalid name").exists().isString(),
                // body("manager", "Invalid manager").optional().isString(),
                // body("parent", "Invalid parent").optional().isString(),
            ]
        }
        case 'editDepartmentHead': {
            //param {dcode}
            //body {manager}
            return [
                param("dcode", "Invalid Department").exists().isString(),
                body("manager", "Invalid manager").exists().isString(),
            ]
        }
    }
}

exports.addDepartment = async (req,res,next)=>{
    try{
        const {department_code, name, manager, parent} = req.body;
        const department = new Department({
            department_code,
            name
        })
        //check if have manager
        if(manager){
            const user = await User.findOne({
                staff_id: manager,
                isDeleted: false
            }).select("_id");
            if(!user){
                return res.status(404).json({
                    statusCode: 404,
                    message: "User not found"
                })
            }
            department.manager = user._id;
        }
        
        //check if is children
        if(parent){
            const dep = await Department.findOne({
                department_code: parent,
                isDeleted: false
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
            
            res.status(200).json({
                statusCode: 200,
                message: "Add Department successfully"
            })
            req.department_code = department_code;
            next();
        })
    }
    catch(error){
        next(error);
    }
}

//add user's department after add department
exports.addUserDepartment = async (req,res,next)=>{
    const {department_code} = req.department_code;
    const department = await Department.findOne({
        department_code,
        isDeleted: false
    }).populate("parent", "_id")
    if(department.manager){
        const user = await User.findById(department.manager).select("_id department");
        let depList= [...user.department, department._id];
        if(department.parent && !user.department.includes(department.parent.id)){
            depList.push(department.parent._id);
        }
        user.department = depList;
        user.save();
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

//get department by code
exports.getDepartment = async (req,res,next)=>{
    try{
        const {dcode} = req.params;
        const department = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        })
        .select("-__v")
        .populate("manager", "staff_id firstname lastname")
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            department
        })
    }
    catch(error){
        next(error);
    }
}

//get department by mongoid
exports.getDepartmentbyID = async (req,res,next)=>{
    try{
        const {id} = req.params;
        const department = await Department.findOne({
            _id: id,
            isDeleted: false
        })
        .select("-__v")
        .populate("manager", "staff_id firstname lastname")
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            department
        })
    }
    catch(error){
        next(error);
    }
}

//get all users of a department
exports.getDepartmentUsers = async (req,res,next)=>{
    try{
        const {dcode} = req.params;
        const department = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        })
        .populate("manager", "firstname lastname staff_id")
        .select("_id");
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        const user = await User.find({
            department: department._id,
            isDeleted: false
        })
        .sort({
            firstname: 1
        })
        .select("staff_id firstname lastname email roles")
        .populate({
            path: "department",
            match: {
                parent : {$ne : null} ,
                isDeleted: false
            },
            select: "department_code name"
        })
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
        .populate("manager", "staff_id firstname lastname")
        
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
        const {dcode} = req.params;
        const parent = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        })
        .populate("manager", "staff_id firstname lastname")
        .select("-__v -isDeleted");

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
        .populate("manager", "staff_id firstname lastname")

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

//edit Department
exports.editDepartment = async (req,res,next)=>{
    try {
        const {dcode} = req.params;
        const {new_dcode, name, manager, parent} = req.body;
        const department = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        })
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        department.department_code = new_dcode;
        department.name = name;
        
        department.save((err)=>{
            if (err && err.name === 'MongoError' && err.code === 11000) {  // Duplicate isbn
                return res.status(409).send({
                    statusCode: 409,
                    message: 'Department already exists!'
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

exports.editDepartmentHead = async (req,res,next)=>{
    try {
        const {dcode} = req.params;
        const {manager} = req.body;
        const department = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        })
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        if(!await User.findOne({staff_id: manager, isDeleted: false}).select("_id")){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        User.updateOne({
            staff_id: manager,
            isDeleted: false
        },{
            $addToSet: { department: [department._id, department.parent] } 
        })
        
        department.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
        

    } catch (error) {
        next(error);
    }
}

//set delete
exports.deleteDepartment = async (req,res,next)=>{
    try {
        const {dcode} = req.params;
        const department = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        })
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        department.isDeleted = true;
        department.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })

    } catch (error) {
        next(error);
    }
}

exports.restoreDepartment = async (req,res,next)=>{
    try {
        const {dcode} = req.params;
        const department = await Department.findOne({
            department_code: dcode,
            isDeleted: true
        })
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        department.isDeleted = false;
        department.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })

    } catch (error) {
        next(error);
    }
}

//get deleted
exports.getDeletedDepartments = async (req,res,next)=>{
    try {
        const departments = await Department.find({
            isDeleted: true
        })

        return res.status(200).json({
            statusCode: 200,
            departments
        })
    } catch (error) {
        next(error);
    }
}

exports.getDeletedParent = async (req,res,next)=>{
    try {
        const departments = await Department.find({
            isDeleted: true,
            parent: {$ne: null}
        })

        return res.status(200).json({
            statusCode: 200,
            departments
        })
    } catch (error) {
        next(error);
    }
}

exports.getDeletedChildren = async (req,res,next)=>{
    try {
        const {dcode} = req.params;

        const parent = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        }).select("_id")

        if(!parent){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        const departments = await Department.find({
            parent: parent._id,
            isDeleted: true
        })

        return res.status(200).json({
            statusCode: 200,
            departments
        })
    } catch (error) {
        next(error);
    }
}