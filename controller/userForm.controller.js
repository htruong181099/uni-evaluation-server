const db = require("../model");
const Department = require("../model/department.model");
const FormDepartment = require("../model/formDepartment.model");
const FormUser = db.formUser;
// const Evaluation = db.evaluation;
const EvaluateForm = db.evaluateForm;
const UserForm = db.userForm;
const Form = db.form;

exports.getUserForm = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const user_id = req.userId;
        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id");

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const formUser = await FormUser.findOne({
            user_id,
            form_id: form._id
        }).select("_id")
        if(!formUser){
            return res.status(404).json({
                statusCode: 404,
                message: "FormUser not found"
            })
        }

        let userForm = await UserForm.findOne({
            form_user: formUser._id,
            form_id: form._id
        });
        if(!userForm){
            userForm = new UserForm({
                form_user: formUser._id,
                form_id: form._id
            })

            userForm.save((err,doc)=>{
                req.userForm = doc._id;
            })
        }
        else{
            req.userForm = userForm._id;
        }
        // return res.status(200).json({
        //     statusCode: 200,
        //     message: "Success",
        //     userForm: userForm._id
        // })
        req.form_id = form._id;
        return next();

    } catch (error) {
        next(error);
    }
}

//V2
exports.getUserFormV2 = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const user_id = req.userId;

        const userForm = await UserForm.findOne({
            _id: ufid
        }).populate("form_id", "code name")
        .populate({
            path: "form_user",
            populate: [{
                path: "user_id",
                select: "staff_id firstname lastname department_code name -_id",
            },
            {
                path: "department_form_id",
                populate: {
                    path: "department_id",
                    select: "department_code name -_id"
                }
            }
            ]
        });
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }
        
        const user = await FormUser.findOne({
            user_id
        }).select("_id")
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "FormUser not found"
            })
        }

        let evaluateForm = await EvaluateForm.findOne({
            userForm: userForm._id,
            user: user._id
        })
        if(!evaluateForm){
            evaluateForm = new EvaluateForm({
                userForm: userForm._id,
                user: user._id,
                status: -1,
                level: 1
            })
            await evaluateForm.save()
        }
        
        req.ufform= userForm.form_id;
        req.form_user = userForm.form_user._id;
        req.user_form = userForm._id;
        req.ufuser = userForm.form_user.user_id;
        req.ufdep = userForm.form_user.department_form_id.department_id;
        req.final_point = userForm.point;
        return next();

    } catch (error) {
        next(error);
    }
}


exports.getResults = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        
        let {size, page} = req.query;
        page = page || 1;
        size = parseInt(size);

        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id")

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const userforms = await UserForm.find({
            form_id: form._id,
            point: {$ne: null},
            isDeleted: false
        }).sort({
            point: -1
        })
        .skip((size*page) - size)
        .limit(size)
        .select("-isDeleted -__v -form_id")
        .populate({
            path: "form_user",
            select: "-isDeleted -__v -form_id",
            populate: [{
                path: "user_id",
                select: "firstname lastname staff_id"
            },
            {
                path: "department_form_id",
                select: "department_id",
                populate: {
                    select: "department_code name",
                    path: "department_id"
                }
            }]
        })
        

        return res.status(200).json({
            statusCode: 200,
            userforms,
            total: 50
        })

    } catch (error) {
        next(error);
    }
}

exports.getResultsDepartment = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {dcode} = req.params;
        let {size, page} = req.query;
        page = page || 1;
        size = size? parseInt(size) : 10;

        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id")

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const department = await Department.findOne({
            department_code: dcode
        }).select("_id")

        const formDepartment = await FormDepartment.findOne({
            department_id: department._id,
            form_id: form._id,
            isDeleted: false
        }).select("_id")

        const formUsers = await FormUser.find({
            department_form_id: formDepartment._id
        }).select("_id")

        const userforms = await UserForm.find({
            form_user: formUsers.map(e=>e._id),
            form_id: form._id,
            point: {$ne: null},
            isDeleted: false
        }).sort({
            point: -1
        })
        .skip((size*page) - size)
        .limit(size)
        .select("form_user")
        .populate({
            path: "form_user",
            select: "-isDeleted -__v -form_id",
            populate: {
                path: "user_id",
                select: "firstname lastname staff_id"
            }
        })
        return res.status(200).json({
            statusCode: 200,
            userforms
        })

    } catch (error) {
        next(error);
    }
}

exports.getPoints = async (req,res,next)=>{
    try {
        const {fcode} = req.params;

        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id")

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const formDepartments = await FormDepartment.find({
            form_id: form._id,
            level: 2,
            isDeleted: false
        })
        const total = await FormUser.count({
            department_form_id: formDepartments,
            isDeleted: false
        }) 

        const userforms = await UserForm.find({
            form_id: form._id,
            point: {$ne: null},
            isDeleted: false
        }).sort({
            point: -1
        })
        .select("point -_id")
        

        return res.status(200).json({
            statusCode: 200,
            userforms: userforms.map(e=>e.point),
            total
        })

    } catch (error) {
        next(error);
    }
}

exports.getPointsDepartment = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;

        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id")

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        const department = await Department.findOne({
            department_code: dcode
        }).select("_id")
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        const formDepartment = await FormDepartment.findOne({
            form_id: form._id,
            department_id: department._id,
            level: 2,
            isDeleted: false
        })
        const total = await FormUser.count({
            department_form_id: formDepartment
        }) 

        const userforms = await UserForm.find({
            form_id: form._id,
            point: {$ne: null},
            isDeleted: false
        }).sort({
            point: -1
        })
        .select("point -_id")
        

        return res.status(200).json({
            statusCode: 200,
            userforms: userforms.map(e=>e.point),
            total
        })

    } catch (error) {
        next(error);
    }
}