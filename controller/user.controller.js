const db = require("../model/");
const User = db.user;

const {body, param} = require("express-validator");
const bcrypt = require("bcrypt");
const FormDepartment = require("../model/formDepartment.model");
const EvaluationReview = require("../model/evaluationReview.model");
const Form = require("../model/form.model");
const Department = require("../model/department.model");

exports.validate = (method)=>{
    switch(method){
        case 'editUser': {
            return [
                body("fname", "Invalid firstname").exists().isString(),
                body("lname", "Invalid lastname").exists().isString(),
                body("birthday", "Invalid birthday").optional().isString(),
                body("phone", "Invalid phone number").optional().isString(),
                body("address", "Invalid address input").optional().isString(),
                body("gender", "Invalid gender").optional().isString()
            ]
        }
        case 'changePassword': {
            return [
                body("old_password", "Invalid old password").exists().isString(),
                body("new_password", "Invalid new password").exists().isString(),
            ]
        }
    }
}

exports.getUser = async (req,res,next)=>{
    const id = req.userId;
    try{
        const user = await User.findById(id)
        .populate("department", "department_code name")
        .select("-__v -password -isDeleted");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
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
        const id = req.userId;
        const {fname, lname, birthday, phone, address, gender} = req.body;

        let user = await User.findById(id).select("-password -isDeleted -__v");
        //required
        user.firstname = fname;
        user.lastname = lname;
        //optional
        user.birthday = birthday;
        user.phone = phone;
        user.address = address;
        user.gender = gender==="Nam"?"Male":"Female";

        await user.save();
        return res.status(200).json({
            statusCode: 200,
            message: "Edit user successfully"
        })

    } catch (error) {
        next(error);
    }
}

exports.changePassword = async (req,res,next)=>{
    try {
        const id = req.userId;
        const {old_password, new_password} = req.body;
        if(old_password === new_password){
            return res.status(400).json({
                statusCode: 400,
                message: "Please enter new password"
            })
        }

        let user = await User.findById(id).select("password");
        const isMatch = bcrypt.compareSync(old_password, user.password);
        if(!isMatch){
            return res.status(400).json({
                statusCode: 400,
                message: "Wrong password"
            })
        }
        user.password = new_password;
        await user.save();
        return res.status(200).json({
            statusCode: 200,
            message: "Change password successfully"
        })

    } catch (error) {
        next(error);
    }
}

exports.checkHead = async (req,res,next)=>{
    try {
        const id = req.userId;
        const {rcode} = req.params;

        const review = await EvaluationReview.findOne({
            code: rcode,
            isDeleted: false
        }).select("_id");

        const forms = await Form.find({
            review: review._id,
            isDeleted: false
        }).select("_id");

        const formDepartment = await FormDepartment.find({
            form_id: forms.map(e=>e._id),
            head: id,
            isDeleted: false
        }).select("-__v -isDeleted -head")
        .populate({
            path: "form_id",
            select: "code name type",
            populate: {
                path: "type",
                select: "name -_id"
            }
        })
        .populate("department_id", "department_code name")
        ;

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formDepartment
        })


    } catch (error) {
        next(error);
    }
}


// add existed user to department
exports.addUsertoDepartment = async (req,res,next)=>{
    try {
        const {dcode} = req.params;
        const user_id = req.body;
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