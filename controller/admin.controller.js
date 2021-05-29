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
        }
    }
}

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

exports.editUser = async (req, res, next)=>{
    try {
        const {ucode} = req.params;
        const {fname, lname, email, roles} = req.body;

        const user = await User.findOne({
            staff_id: ucode,
            isDeleted: false
        }).select("-password -isDeleted -__v");
        //required
        user.staff_id = ucode;
        user.firstname = fname;
        user.lastname = lname;
        //optional
        if(!['admin', 'user'].includes(roles)){
            res.status(422).json({
                statusCode: 400,
                message: "Invalid Roles"
            })
        }
        user.roles = roles;
        user.email = email;

        await user.save((err)=>{
            if (err.name === 'MongoError' && err.code === 11000) {  // Duplicate staff_id
                return res.status(409).send({
                    statusCode: 409,
                    message: 'User already exists!'
                });
            }
            next(err);
        });
        return res.status(200).json({
            statusCode: 200,
            message: "Edit user successfully"
        })

    } catch (error) {
        next(error);
    }
}

exports.getUsers = async (req,res,next)=>{
    try{
        const users = await User.find()
                    .sort({"staff_id": 1})
                    .populate("department","department_code name")
                    .select("-__v -password");

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