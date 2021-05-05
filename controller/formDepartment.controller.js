const db = require("../model");
const Form = db.form;
const FormDepartment = db.formDepartment;

const {body, param, query, validationResult} = require("express-validator");
const Department = require("../model/department.model");

exports.validate = (method)=>{
    switch(method){
        case '': {
            return [
                
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
            if(exist){
                return res.status(409).send({
                    message: "Dup"
                })
            }
            const formDepartment = new FormDepartment({
                form_id : form._id,
                department_id: department._id,
                level: 1
            })
            await formDepartment.save(async (err)=>{
                if(err){
                    return next(err);
                }
                const children = await Department.find({parent: department._id}).select("_id");
                for(let index in children){
                    // console.log(children[index]._id);

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
                    if(existChild){
                        return res.status(409).send({
                            message: "Dup"
                        })
                    }
                    const childFormDepartment = new FormDepartment({
                        form_id : form._id,
                        department_id: childDepartment._id,
                        level: 2
                    })
                    await childFormDepartment.save();
                }
                return res.status(200).json({
                    message: "Add Form Department successfully"
                })
            });
        }
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
        const formDepartments = await FormDepartment.find({form_id: form._id})
            .populate("department_id","department_code name").select("-__v -isDeleted");
        res.status(200).json({
            statusCode: 200,
            message: "Success",
            formDepartments
        })
    } catch (error) {
        next(error);
    }
}