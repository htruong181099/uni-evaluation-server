const db = require("../model/");
const User = db.user;

const {body, param, query, validationResult} = require("express-validator");
const Department = db.department;

exports.validate = (method)=>{
    switch(method){
        case 'getUser': {
            return [
                param('id', 'Invalid Id').exists().isMongoId()
            ]
        }
        case 'getUserbyCode': {
            return [
                param('ucode', 'Invalid Id').exists().isString()
            ]
        }
        case 'addUser': {
            return [
                body('id','Invalid Code').exists().isString(),
                body('lname','Invalid Last Name').exists().isString(),
                body('fname','Invalid First Name').exists().isString(),
                body('email', "Invalid email").exists().isEmail(),
                body('dcode', "Invalid Department code").exists().isString()
            ]
        };
        case 'editUser': {
            return [
                param('ucode', "Invalid User ID").exists().isString(),
                body("fname", "Invalid firstname").exists().isString(),
                body("lname", "Invalid lastname").exists().isString(),
                body("email", "Invalid email").exists().isString(),
                body("roles", "Invalid roles").exists().isString()
            ]
        };
        case 'createNewUsertoDepartment': {
            //param {dcode}, body {id, fname, lname, email}
            return [
                param("dcode", "Invalid Department").exists().isString(),
                body("id", "Invalid id").exists().isString(),
                body("fname", "Invalid firstname").exists().isString(),
                body("lname", "Invalid lastname").exists().isString(),
                body("gmail", "Invalid email").exists().isEmail(),
            ]
        }
        case 'removeUserDepartment': {
            return [
                param('ucode', "Invalid User ID").exists().isString(),
                param("dcode", "Invalid Department").exists().isString(),
            ]
        }
        case 'addUsertoDepartment':{
            return [
                param("dcode", "Invalid Department").exists().isString(),
                body("user_id", "Invalid id").exists().isString(),
            ]
        }
        case 'deleteUser':
        case 'restoreUser': {
            return [
                param('ucode', 'Invalid Id').exists().isString()
            ]
        }
    }
}

//get user using id (mongo)
exports.getUser = async (req,res,next)=>{
    const {id} = req.params;
    try{
        const user = await User.findById(id).select("-__v -password");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }
        res.status(200).json({
            statusCode: 200,
            message: "OK",
            user: user
        })
    }
    catch(error){
        next(error);
    }
}

//get user using staff_id (code)
exports.getUserbyCode = async (req,res,next)=>{
    try{
        const {ucode} = req.params;
        const {short} = req.query;
        const user = await User.findOne({
            staff_id: ucode,
            isDeleted: false
        })
        .populate("department", "department_code name")
        .select("-__v -password -isDeleted");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }
        if(short && short == 1){
            return res.status(200).json({
                statusCode: 200,
                message: "Success",
                user: {
                    staff_id: user.staff_id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email
                }   
            })
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            user
        })
    }
    catch(error){
        next(error);
    }
}

//edit user info
exports.editUser = async (req, res, next)=>{
    try {
        const {ucode} = req.params;
        const {new_ucode, fname, lname, email, roles} = req.body;

        const user = await User.findOne({
            staff_id: ucode,
            isDeleted: false
        }).select("-password -isDeleted -__v");
        //required
        user.staff_id = new_ucode;
        user.firstname = fname;
        user.lastname = lname;
        //optional
        if(!['admin', 'user'].includes(roles)){
            return res.status(422).json({
                statusCode: 400,
                message: "Invalid Roles"
            })
        }
        user.roles = roles;
        user.email = email;

        await user.save((err)=>{
            if (err && err.name === 'MongoError' && err.code === 11000) {  // Duplicate staff_id
                return res.status(409).send({
                    statusCode: 409,
                    message: 'User already exists!'
                });
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Edit user successfully"
            })
        });
        

    } catch (error) {
        next(error);
    }
}

//get all users
exports.getUsers = async (req,res,next)=>{
    try{
        const users = await User.find({
            isDeleted: false
        })
        .sort({"staff_id": 1})
        .populate("department","department_code name")
        .select("-__v -password -isDeleted");

        return res.status(200).json({
            statusCode: 200,
            message: "OK",
            users: users
        })
    }
    catch(error){
        next(error);
    }
}

//get deleted users
exports.getDeletedUsers = async (req,res,next)=>{
    try{
        const users = await User.find({
            isDeleted: true
        })
        .sort({"firstname": 1})
        .populate("department","department_code name")
        .select("-__v -password -isDeleted");

        return res.status(200).json({
            statusCode: 200,
            users: users
        })
    }
    catch(error){
        next(error);
    }
}

//create new user
exports.addUser = async (req,res,next)=>{
    try {
        const {id, lname, fname, email, dcode} = req.body;
        const user = new User({
            staff_id: id,
            lastname: lname,
            firstname: fname,
            email,
            password: "password"
        })
        if(dcode){
            const department = await Department.findOne({
                department_code: dcode,
                isDeleted: false
            })
            if(department){
                user.department = department.parent ? [department.parent, department._id] : [department._id];
            }
        }

        user.save((err)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate staff_id
                    return res.status(409).send({
                        statusCode: 409,
                        message: 'User already exists!'
                    });
                }
                return next(err);
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Add user successfully"
            })
        })
    } catch (error) {
        next(error);
    }
}

// create new user to department
exports.createNewUsertoDepartment = async (req,res,next)=>{
    try {
        const {dcode} = req.params;
        const department = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        }).select("_id parent");

        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        const {id, fname, lname, email} = req.body;

        const user = new User({
            staff_id: id,
            firstname : fname,
            lastname : lname,
            email,
            password: "password"
        })

    
        user.department = department.parent ? [department.parent, department._id] : [department._id];
        console.log(user.department);
        user.save((err)=>{
            if(err){
                if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate staff_id
                    return res.status(409).send({
                        statusCode: 409,
                        message: 'User already exists!'
                    });
                }
                return next(err);
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Successful"
            })
    
        });

        
    } catch (error) {
        next(error);
    }
}

// add existed user to department
exports.addUsertoDepartment = async (req,res,next)=>{
    try {
        const {dcode} = req.params;
        const {user_id} = req.body;
        const user = await User.findOne({
            staff_id: user_id,
            isDeleted: false
        }).select("_id department");

        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        const department = await Department.findOne({
            department_code: dcode,
            isDeleted: false
        }).select("_id parent");

        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        if(user.department.includes(department._id)){
            return res.status(409).json({
                statusCode: 409,
                message: "User is already in Department"
            })
        }

        if(department.parent){
            if(user.department.includes(department.parent)){
                user.department = [...user.department, department._id];
            }
            else{
                user.department = [...user.department, department.parent, department._id];
            }
        }
        else{
            user.department = [...user.department, department._id];
        }

        await user.save();
        return res.status(200).json({
            statusCode: 200,
            message: "Successful"
        })

    } catch (error) {
        next(error);
    }
}

// remove user's department
exports.removeUserDepartment = async (req,res,next)=>{
    try{
        const {ucode, dcode} = req.params;
        const user = await User.findOne({
            staff_id: ucode,
            isDeleted: false
        }).select("department")
    
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        const department = await Department.findOne({
            department_code: dcode
        }).select("_id parent")

        if(!user.department.includes(department._id)){
            return res.status(400).json({
                statusCode: 400,
                message: "User is not in department"
            })
        }

        //department is parent
        if(!department.parent){
            const children = await Department.find({
                parent: department._id
            }).select("_id")
            
            User.updateOne({
                staff_id: ucode,
                isDeleted: false
            },
                {"$pull": {"department": {$in: [...children, department._id]}}},
                {},
                (err,res)=>{
                }
            )
            
            return res.status(200).json({
                statusCode: 200,
                message: "Success"
            })
        }
        user.department = user.department.filter(e => e != department.id);
        user.save();
        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
        
    }
    catch(error){
        next(error);
    }
}

//set Delete
exports.deleteUser = async (req,res,next)=>{
    try{
        const {ucode} = req.params;
        const user = await User.findOne({
            staff_id: ucode,
            isDeleted: false
        }).select("isDeleted");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        user.isDeleted = true;
        user.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
    }
    catch(error){
        next(error);
    }
}

//set Delete
exports.restoreUser = async (req,res,next)=>{
    try{
        const {ucode} = req.params;
        const user = await User.findOne({
            staff_id: ucode,
            isDeleted: true
        }).select("isDeleted");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        user.isDeleted = false;
        user.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
    }
    catch(error){
        next(error);
    }
}