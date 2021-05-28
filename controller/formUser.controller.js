const db = require("../model");
const EvaluateForm = require("../model/evaluateForm.model");
const UserForm = require("../model/userForm.model");
const Department = db.department;
const Form = db.form;
const FormDepartment = db.formDepartment;
const FormUser = db.formUser;
const User = db.user;

//add single formuser
exports.addFormUser = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const {ucode} = req.body;

        const form = await Form.findOne({code: fcode}).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        const department = await Department.findOne({department_code: dcode}).select("_id");
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        const formDepartment = await FormDepartment.findOne({
            department_id: department._id,
            isDeleted: false
        }).select("_id");
        if(!formDepartment){
            return res.status(404).json({
                statusCode: 404,
                message: "FormDepartment not found"
            })
        }

        const user = await User.findOne({
            staff_id: ucode,
            isDeleted: false
        }).select("_id")
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        let formUser = await FormUser.findOne({
            department_form_id: formDepartment._id,
            user_id: user._id,
            form_id: form._id
        })

        //if not in db, create new formuser
        if(!formUser){
            formUser = new FormUser({
                department_form_id: formDepartment._id,
                user_id: user._id,
                form_id: form._id
            })
            formUser.save();
            return res.status(200).json({
                statusCode: 200,
                message: 'Add FormUser successfully'
            })
        }

        //if isdeleted, recover formuser
        if(formUser.isDeleted){
            formUser.isDeleted = true;
            formUser.save();
            return res.status(200).json({
                statusCode: 200,
                message: 'Add FormUser successfully'
            })
        }

        //if formuser -> existed
        return res.status(409).json({
            statusCode: 409,
            message: 'FormUser already exist'
        })
        
    } catch (error) {
        next(error);
    }
}

//add multiple form users
exports.addFormUsers = async (req,res,next)=>{
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


exports.getFormUsers = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const form = await Form.findOne({
            code: fcode
        }).select("_id");
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
            isDeleted: false
        }).select("_id");
        if(!formDepartment){
            return res.status(404).json({
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
                    parent: {$ne : null} //not null
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

exports.removeFormUser = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const {delete_users} = req.body;

        const form = await Form.findOne({
            code: fcode
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const department = await Department.findOne({
            department_code: dcode
        }).select("_id");
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        const formDepartment = await FormDepartment.findOne({
            form_id: form._id,
            department_id: department._id
        }).select("_id");
        if(!formDepartment){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        const users = await User.find({
            staff_id: delete_users
        }).select("_id")

        const del_users = users.map(e => e._id);

        const query = {
            department_form_id: formDepartment._id,
            user_id: del_users
        }
        FormUser.updateMany(query, {isDeleted: true}, (err)=>{
            if(err){
                return next(err);
            }
            return res.status(200).json({
                statusCode: 200,
                message: "Delete FormUser successfully"
            })
        })
        // const u = await FormUser.find({
        //     user_id: del_users
        // }).populate("user_id")
        


    } catch (error) {
        next(error);
    }
}


// version 2
exports.addFormUsersV2 = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const form = await Form.findOne({code: fcode}).select("_id");

        //set formuser isDeleted to false
        const recoverFDepartments = req.recoverDepartments;
        console.log(recoverFDepartments);
        await FormUser.updateMany({
            department_form_id: recoverFDepartments
        },
        {
            isDeleted: false
        })

        //set formuser isDeleted to true
        const deleteDepartmentsCode = req.deleteDepartments;
        const deleteDepartments = await Department.find({
            department_code: deleteDepartmentsCode
        })
        const deletedFormDepartments = await FormDepartment.find({
            form_id: form._id,
            department_id: deleteDepartments.map(e=>e._id)
        }).select("_id")
        const query = {
            department_form_id: deletedFormDepartments.map(e=>e._id)
        }
        await FormUser.updateMany(query, {
            isDeleted: true
        })

        //add new user to form
        const formdepartments = await FormDepartment.find({
            form_id: form._id,
            isDeleted: false
        })
        .populate("department_id")
        .select("_id department_id");
        
        for(let i in formdepartments){
            if(!formdepartments[i].department_id.parent){
                const users = await User.find({
                    department: formdepartments[i].department_id._id,
                    isDeleted: false
                })
                for(let x in users){
                    if(!await FormUser.findOne({
                        form_id: form._id,
                        user_id: users[x]._id
                    }).select("_id")){
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


//get FormUser if head
exports.getFormUserIfHead = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const user_id = req.userId;

        const form = await Form.findOne({
            code: fcode
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const department = await Department.findOne({
            department_code: dcode
        }).select("_id");
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        const formDepartment = await FormDepartment.findOne({
            form_id: form._id,
            department_id: department._id,
            head: user_id,
            isDeleted: false
        }).select("_id level");
        if(!formDepartment){
            return res.status(404).json({
                statusCode: 404,
                message: "Form Department not found"
            })
        }

        const formUsers = await FormUser.find({
            department_form_id: formDepartment._id,
            isDeleted: false
        }).select("user_id")
        .populate({
            path: "user_id",
            select: "staff_id lastname firstname department",
            populate: {
                path: "department",
                match: {
                    parent: {$ne: null}
                },
                select: "department_code name _id"
            }
        })
        .lean();
        let result = []
        for(let i in formUsers){
            const formUser = formUsers[i];
            const userForm = await UserForm.findOne({
                form_user: formUser._id,
                form_id: form._id
            }).select("_id")
            
            formUser.evaluateForm = null;
            if(userForm){
                const evaluateForm = await EvaluateForm.findOne({
                    userForm: userForm._id
                }).select("_id status").lean();
                formUser.evaluateForm = evaluateForm;
                if(evaluateForm){
                    formUser.evaluateForm.userForm = userForm;
                }
                
            }
            
            result.push(formUser)
        }


        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formUsers: result
        })

    } catch (error) {
        next(error);
    }
}

//get FormUser if admin
exports.getFormUserAdmin = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;

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

        const department = await Department.findOne({
            department_code: dcode
        }).select("_id");
        if(!department){
            return res.status(404).json({
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
            return res.status(404).json({
                statusCode: 404,
                message: "Form Department not found"
            })
        }

        const formUsers = await FormUser.find({
            department_form_id: formDepartment._id,
            isDeleted: false
        }).select("user_id")
        
        .populate({
            path: "user_id",
            select: "staff_id lastname firstname department",
            populate: {
                path: "department",
                match: {
                    parent: {$ne: null}
                },
                select: "department_code name _id"
            }
        })
        .lean();
        let result = []
        for(let i in formUsers){
            const formUser = formUsers[i];
            const userForm = await UserForm.findOne({
                form_user: formUser._id,
                form_id: form._id
            }).select("_id")
            
            formUser.evaluateForm = null;
            if(userForm){
                const evaluateForm = await EvaluateForm.findOne({
                    userForm: userForm._id
                }).select("_id status").lean();
                formUser.evaluateForm = evaluateForm;
                if(evaluateForm){
                    formUser.evaluateForm.userForm = userForm;
                }
            }
            
            result.push(formUser)
        }


        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formUsers: result
        })

    } catch (error) {
        next(error);
    }
}