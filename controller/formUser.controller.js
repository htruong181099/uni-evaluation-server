const db = require("../model");
const Department = db.department;
const Form = db.form;
const FormCriteria = db.formCriteria;
const FormDepartment = db.formDepartment;
const FormUser = db.formUser;
const User = db.user;

exports.addFormUser = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const form = await Form.findOne({code: fcode}).select("_id");
        const formdepartments = await FormDepartment.find({
            form_id: form._id,
        })
        .populate("department_id")
        .select("_id department_id");
        for(let i in formdepartments){
            if(!formdepartments[i].department_id.parent && formdepartments[i].department_id.parent == null){
                const users = await User.find({
                    department: formdepartments[i].department_id._id
                })
                for(let x in users){
                    if(!await FormUser.findOne({
                        form_id: form._id,
                        user_id: users[x]._id
                    })){
                        const formUser = new FormUser({
                            user_id: users[x]._id,
                            department_form_id: formdepartments[i]._id,
                            form_id: form._id
                        })
                        await formUser.save()
                    }
                }
            }
        }
        return res.status(200).json({
            statusCode: 200,
            message: 'Add form departments and users successfully'
        })
        
    } catch (error) {
        next(error);
    }
}


exports.getFormUser = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const form = await Form.findOne({
            code: fcode
        }).select("_id");
        if(!form){
            res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const department = await Department.findOne({
            department_code: dcode
        }).select("_id")
        if(!department){
            res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        const formDepartment = await FormDepartment.findOne({
            form_id: form._id,
            department_id: department._id,
            isDeleted: false
        }).select("_id");
        if(!formDepartment){
            res.status(404).json({
                statusCode: 404,
                message: "FormDepartment not found"
            })
        }
        const formUser = await FormUser.find({
            department_form_id: formDepartment._id,
            isDeleted: false
        }).select("user_id")
        .populate({
            path: 'user_id',
            select: 'staff_id firstname lastname department',
            populate: {
                path: 'department',
                select: 'department_code name parent',
                match: {
                    parent: {$ne : null}
                }
            }
        })

        res.status(200).json({
            statusCode: 200,
            message: "Success",
            formUser
        })

    } catch (error) {
        next(error);
    }
} 