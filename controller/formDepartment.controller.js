const db = require("../model");
const Form = db.form;
const FormDepartment = db.formDepartment;
const Department = db.department;

const {body, param, query, validationResult} = require("express-validator");
const User = require("../model/user.model");
const FormUser = require("../model/formUser.model");

exports.validate = (method)=>{
    switch(method){
        case 'addFormDepartment':
        case 'addCouncil':
        case 'addHead':
        case 'checkCouncil' :{
            return [
                param("fcode","").exists().isString(),
                body("dcode").exists().isString(),
            ]
        }
        case 'addFormDepartments': {
            return [
                param("fcode","").exists().isString(),
                body("dcodes").exists().isArray(),
            ]
        }
    }
}

exports.addFormDepartment = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {dcode, level} = req.body;
        const form = await Form.findOne({code: fcode}).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        const department = await Department.find({department_code: dcode}).select("_id");
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            });
        }
        const formDepartment = new FormDepartment({
            form_id : form._id,
            department_id: department._id,
            level
        })
        formDepartment.save((err)=>{

        })
    } catch (error) {
        next(error);
    }
}

exports.addFormDepartments = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {dcodes} = req.body;
        const form = await Form.findOne({code: fcode}).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        for(let i in dcodes){
            const department = await Department.findOne({department_code: dcodes[i]}).select("_id");
            if(!department){
                return res.status(404).json({
                    statusCode: 404,
                    message: "Department not found"
                });
            }
            const exist = await FormDepartment.findOne({
                form_id : form._id,
                department_id: department._id,
            }).select("_id");
            if(!exist){
                const formDepartment = new FormDepartment({
                    form_id : form._id,
                    department_id: department._id,
                    level: 1
                })
                await formDepartment.save(async (err)=>{
                    const children = await Department.find({parent: department._id}).select("_id");
                    for(let index in children){
                        const childDepartment = await Department.findById(children[index]._id).select("_id");
                        if(!childDepartment){
                            return res.status(404).json({
                                statusCode: 404,
                                message: "Department not found"
                            });
                        }
                        const existChild = await FormDepartment.findOne({
                            form_id : form._id,
                            department_id: childDepartment._id,
                        }).select("_id");
                        if(!existChild){
                            const childFormDepartment = new FormDepartment({
                                form_id : form._id,
                                department_id: childDepartment._id,
                                level: 2
                            })
                            await childFormDepartment.save();
                        }
                    }
                });
            }
        }
        next();
    } catch (error) {
        next(error);
    }
}

exports.getFormDepartments = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const form = await Form.findOne({code: fcode}).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        const formDepartments = await FormDepartment.find({
            form_id: form._id,
            isDeleted: false
        }).populate("department_id","department_code name")
        .select("-__v -isDeleted");
        
        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formDepartments
        })
    } catch (error) {
        next(error);
    }
}

exports.addFormDepartmentsV2 = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {dcodes} = req.body;
        const form = await Form.findOne({code: fcode}).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        
        const existedDepartment = await FormDepartment.find({
            form_id: form._id,
            isDeleted: false
        })
        .populate("department_id", "department_code")
        .select("_id");

        const deleteDepartments = existedDepartment.map(e => e.department_id.department_code).filter(e=>!dcodes.includes(e));

        let recoverDepartments = [];
        for (let i in dcodes){
            const department = await Department.findOne({
                department_code: dcodes[i]
            }).select("_id manager")
            if(!department.manager){
                return res.status(400).json({
                    statusCode: 404,
                    message: "Some of departments dont have manager"
                })
            }
            let formDepartment = await FormDepartment.findOne({
                form_id: form._id,
                department_id: department._id
            });
            if(!formDepartment){
                formDepartment = new FormDepartment({
                    form_id: form._id,
                    department_id: department._id,
                    head: department.manager,                    
                    level: 2
                })
                await formDepartment.save();
            }
            else{
                if(formDepartment.isDeleted){
                    formDepartment.isDeleted = false;
                    recoverDepartments.push(formDepartment._id)
                    await formDepartment.save();
                }
            }
        }

        for(let i in deleteDepartments){
            const dep = await Department.findOne({
                department_code: deleteDepartments[i]
            }).select("_id")
            const formDepartment = await FormDepartment.findOne({
                form_id: form._id,
                department_id: dep._id
            });
            formDepartment.isDeleted = true;
            await formDepartment.save();
        }

        req.deleteDepartments = deleteDepartments;
        req.recoverDepartments = recoverDepartments;
        next();
        
    } catch (error) {
        next(error);
    }
}

exports.addFormDepartmentCouncil = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const form = await Form.findOne({code: fcode}).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        
        const department = await Department.findOne({
            department_code: dcode
        }).select("_id manager")
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        if(!department.manager){
            return res.status(400).json({
                statusCode: 400,
                message: "Head department not found"
            })
        }

        const formDepartment = new FormDepartment({
            form_id: form._id,
            department_id: department._id,
            head: department.manager,
            level: 3
        })
        const fd = await formDepartment.save();

        const users = await User.find({
            department: department._id,
            isDeleted: false
        }).select("_id")

        const formUsers = users.map(user=>{
            return {
                user_id: user._id,
                form_id: form._id,
                department_form_id: fd._id
            }
        })

        FormUser.insertMany(
            formUsers
        ,{})

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })
        
    } catch (error) {
        next(error);
    }
}

exports.checkCouncil = async (req,res,next)=>{
    try {
        const {dcode, fcode} = req.params;
        const department = await Department.findOne({
            department_code: dcode
        }).select("_id");
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const form = await Form.findOne({
            code: fcode
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const formDepartment = await FormDepartment.findOne({
            form_id: form._id,
            department_id: department._id,
            level: 3,
            isDeleted: false
        }).select("_id department_id head level")
        .populate("department_id", "name department_code")
        .populate("head", "firstname lastname staff_id");
        
        if(!formDepartment){
            return res.status(200).json({
                statusCode: 200,
                formDepartment: {}
            })
        }

        return res.status(200).json({
            statusCode: 200,
            formDepartment: formDepartment
        })
    } catch (error) {
        next(error);
    }
}

exports.addHead = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const {ucode} = req.body;
        const form = await Form.findOne({code: fcode}).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        
        const department = await Department.findOne({department_code: dcode}).select("_id");
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
        })
        if(!formDepartment){
            return res.status(404).json({
                statusCode: 404,
                message: "FormDepartment not found"
            })
        }

        const user = await User.findOne({
            staff_id: ucode,
            isDeleted: false
        }).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "User not found"
            })
        }

        //if user is already a head
        if(formDepartment.head == user._id){
            return res.status(409).json({
                statusCode: 409,
                message: "User is already a head"
            })
        }

        //check if user in form
        let formUser = await FormUser.findOne({
            department_form_id: formDepartment._id,
            user_id: user._id
        })

        if(formUser){
            formUser.isDeleted = formUser.isDeleted? false: formUser.isDeleted;
        }

        if(!formUser){
            formUser = new FormUser({
                department_form_id: formDepartment._id,
                user_id: user._id,
                form_id: form._id
            })
            formUser.save();
        }

        formDepartment.head = user._id;
        formDepartment.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })

    } catch (error) {
        next(error);
    }
}