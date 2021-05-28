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
        case 'addUser': {
            return [
                body('id','Invalid Code').exists().isString(),
                body('lname','Invalid Last Name').exists().isString(),
                body('fname','Invalid First Name').exists().isString(),
                body('email', "Invalid email").exists().isEmail(),
                body('dcode', "Invalid Department code").exists().isString()
            ]
        };
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