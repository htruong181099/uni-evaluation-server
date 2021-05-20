const db = require("../model");
const Form = db.form;
const FormDepartment = db.formDepartment;
const Department = db.department;

const {body, param, query, validationResult} = require("express-validator");

exports.validate = (method)=>{
    switch(method){
        case 'addFormDepartment': {
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
        let recoverDepartments = [];
        for (let i in dcodes){
            const department = await Department.findOne({
                department_code: dcodes[i]
            }).select("_id manager")
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
        req.deleteDepartments = deleteDepartments;
        req.recoverDepartments = recoverDepartments;
        next();
        
    } catch (error) {
        next(error);
    }
}