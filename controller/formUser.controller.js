const db = require("../model");
const EvaluateForm = db.evaluateForm;
const UserForm = db.userForm;
const Department = db.department;
const Form = db.form;
const FormDepartment = db.formDepartment;
const FormUser = db.formUser;
const User = db.user;

//validator
const {body, param, query} = require("express-validator");
const FormRating = require("../model/formRating.model");

exports.validate = (method)=>{
    switch(method){
        case 'getFormUsers':
        case 'getFormUsersAdmin':    
        {
            return [
                param("fcode", "Invalid form").exists().isString(),
                param("dcode", "Invalid department").exists().isString()
            ]
        }
        case 'addFormUser': {
            return [
                param("fcode", "Invalid form").exists().isString(),
                param("dcode", "Invalid department").exists().isString(),
                body("ucode", "Invalid user").exists().isString()
            ]
        }
        case 'removeFormUser': {
            return [
                param("fcode", "Invalid form").exists().isString(),
                param("dcode", "Invalid department").exists().isString(),
                body("delete_users").exists().isArray()
            ]
        }
    }
}


//add single formuser
exports.addFormUser = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const {ucode} = req.body;

        //query form && department
        const [form, department, user] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode}).select("_id"),
            User.findOne({staff_id: ucode, isDeleted: false}).select("_id")
        ])

        //return status 404 if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
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
            formUser.isDeleted = false;
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
        const {form, departments} = req;
        
        const formdepartments = await FormDepartment.find({
            form_id: form._id,
            department_id: departments.map(e=>e._id)
        })
        
        for(formdepartment of formdepartments){
            const users = await User.find({
                department: formdepartment.department_id,
                isDeleted: false
            })

            FormUser.bulkWrite(
                users.map((user)=>({
                    updateOne: {
                        filter: {
                            department_form_id: formdepartment._id, 
                            user_id: user._id,
                            form_id: form._id
                        },
                        update: {
                            isDeleted: false
                        },
                        upsert: true
                    }
                }))
            )
        }

        return res.status(201).json({
            statusCode: 201,
            message: 'Success'
        })
        
    } catch (error) {
        next(error);
    }
}

exports.getFormUsers = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;

        //query form && department
        const [form, department] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode}).select("_id")
        ])

        //return status 404 if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
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
        })
        .lean()
        .select("user_id")
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

        return res.status(200).json({
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

        if(delete_users.length == 0){
            return res.status(422).json({
                statusCode: 422,
                message: "Empty array"
            })
        }

        //query form && department
        const [form, department] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode}).select("_id")
        ])

        //return status 404 if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
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
            staff_id: delete_users,
            isDeleted: false
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

    } catch (error) {
        next(error);
    }
}


//get FormUser if head
exports.getFormUserIfHead = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const user_id = req.userId;

        //query form && department
        const [form, department] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode}).select("_id")
        ])

        //return status 404 if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        //query formRatings && formDepartment
        const [formRatings , formDepartment] = await Promise.all([
            FormRating.find({
                form_id: form._id
            }).sort({"max_point": -1}),
            FormDepartment.findOne({
                form_id: form._id,
                department_id: department._id,
                // head: user_id,
                isDeleted: false
            }).select("_id level head department_id")
            .populate("head", "_id firstname lastname staff_id")
            .populate("department_id", "-_id department_code name")
        ])
        if(!formDepartment){
            return res.status(404).json({
                statusCode: 404,
                message: "Form Department not found"
            })
        }

        if(formDepartment.head._id != user_id){
            const council = await FormDepartment.findOne({
                form_id: form._id,
                level: 3,
                isDeleted: false
            }).select("_id level head")
            if(!council.head.id == user_id){
                return res.status(403).json({
                    statusCode: 403,
                    message: "Require head role"
                })
            }
        }

        const formUsers = await FormUser.find({
            department_form_id: formDepartment._id,
            isDeleted: false
        })
        .lean()
        .select("user_id")
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
        let result = []
        for(let i in formUsers){
            const formUser = formUsers[i];
            const userForm = await UserForm.findOne({
                form_user: formUser._id,
                form_id: form._id
            }).select("_id point").lean()
            
            formUser.userForm = userForm;
            formUser.evaluateForm = null;
            if(userForm){
                const evaluateForm = await EvaluateForm.find({
                    userForm: userForm._id
                }).select("_id status level point")
                .sort({"level": 1}).lean();
                formUser.evaluateForm = evaluateForm;
                formUser.userForm.rating = calculateRating(formRatings, userForm.point);
            }
            result.push(formUser)
        }

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formDepartment,
            formUsers: result
        })

    } catch (error) {
        next(error);
    }
}

//get FormUser if admin
exports.getFormUsersAdmin = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;

        //query form && department
        const [form, department] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode}).select("_id")
        ])

        //return status 404 if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

         
        //query formRatings && formDepartment
        const [formRatings , formDepartment] = await Promise.all([
            FormRating.find({
                form_id: form._id
            }).sort({"max_point": -1}),
            FormDepartment.findOne({
                form_id: form._id,
                department_id: department._id,
                isDeleted: false
            }).select("_id")
        ])
        
        if(!formDepartment){
            return res.status(404).json({
                statusCode: 404,
                message: "Form Department not found"
            })
        }

        const formUsers = await FormUser.find({
            department_form_id: formDepartment._id,
            isDeleted: false
        })
        .lean()
        .select("user_id")
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
        let result = []
        for(let i in formUsers){
            const formUser = formUsers[i];
            const userForm = await UserForm.findOne({
                form_user: formUser._id,
                form_id: form._id
            }).lean().select("_id point")
            
            formUser.evaluateForm = null;
            formUser.userForm = userForm;
            if(userForm){
                const evaluateForm = await EvaluateForm.find({
                    userForm: userForm._id
                }).select("_id status level point")
                .sort({"level": 1}).lean();
                formUser.evaluateForm = evaluateForm;
                formUser.userForm.rating = calculateRating(formRatings, userForm.point);
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

//utils
const calculateRating = (formRatings, point)=>{
    if((formRatings && formRatings.length === 0) || point === null){
        return null;
    }

    for(let i in formRatings){
        const formRating = formRatings[i];
        if(point <= formRating.max_point && point >= formRating.min_point){
            return formRating.name;
        }
    }
    return null;
}


//outdated
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