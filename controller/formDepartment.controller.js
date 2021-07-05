const db = require("../model");
const Form = db.form;
const FormDepartment = db.formDepartment;
const Department = db.department;
const User = db.user;
const FormUser = db.formUser;

const {body, param, query} = require("express-validator");

exports.validate = (method)=>{
    switch(method){
        case 'addFormDepartment': {
            return [
                param("fcode","Invalid Form code").exists().isString(),
                body("dcode", "Invalid Department code").exists().isString()
            ]
        }
        case 'getFormDepartment':
        case 'deleteFormDepartmentAndUsers':
        case 'addCouncil':
        case 'addHead':
        {
            return [
                param("fcode","Invalid Form code").exists().isString(),
                param("dcode", "Invalid Department code").exists().isString(),
            ]
        }
        case 'getFormDepartments':
        case 'checkCouncil' :{
            return [
                param("fcode","Invalid Form code").exists().isString()
            ]
        }
        case 'addFormDepartments':
        case 'addFormDepartmentsV2': {
            return [
                param("fcode","Invalid Form").exists().isString(),
                body("dcodes", "Invalid Department codes").exists().isArray(),
            ]
        }
    }
}

exports.addFormDepartment = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {dcode} = req.body;

        //query form && department
        const [form, department] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.find({department_code: dcode}).select("_id")
        ]) 

        //return 404 status if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            });
        }

        //check if already have FD in form -> if found return 409
        if(await FormDepartment.findOne({
            form_id : form._id,
            department_id: department._id,
            level: 2
        })){
            return res.status(409).json({
                statusCode: 409,
                message: "FormDepartment is existed"
            });
        }

        //if not found create new FD
        const formDepartment = new FormDepartment({
            form_id : form._id,
            department_id: department._id,
            level
        })
        formDepartment.save();

        return res.status(201).json({
            statusCode: 201,
            message: "Success"
        });

    } catch (error) {
        next(error);
    }
}

exports.getFormDepartment = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        
        //query form, department
        const [form, department] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode, isDeleted: false}).select("_id")
        ])

        //return 404 if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            });
        }

        const formDepartment = await FormDepartment.findOne({
            form_id : form._id,
            department_id: department._id
        })
        .lean()
        .select("department_id head -_id")
        .populate({
            path: "department_id",
            select: "department_code name manager -_id",
            populate: {
                path: "manager",
                select: "firstname lastname staff_id -_id"
            }
        })
        .populate("head", "firstname lastname staff_id -_id")
        
        

        if(!formDepartment){
            return res.status(404).json({
                statusCode: 404,
                message: "FormDepartment not found"
            })
        }

        return res.status(200).json({
            statusCode: 200,
            formDepartment
        })
        
    } catch (error) {
        next(error);
    }
}

//new
exports.addFormDepartments = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {dcodes} = req.body;

        if(dcodes.length == 0){
            return res.status(422).json({
                statusCode: 422,
                message: "Invalid Department codes"
            })
        }

        const [form, departments] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.find({department_code: dcodes})
        ])

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }

        console.log(await FormDepartment.countDocuments({
            form_id: form._id,
            level: 2
        }))
        console.log(await FormDepartment.find({
            form_id: form._id,
            level: 2
        }).lean())

        const writeResult = await FormDepartment.bulkWrite(
            departments.map((department)=>({
            updateOne: {
                filter: {
                    form_id: form._id, 
                    department_id: department._id
                },
                update: {
                    head: department.manager,
                    level: 2,
                    isDeleted: false
                },
                upsert: true
            }
        })))
        
        console.log("FormDepartment Write Result:");
        console.log(writeResult)

        req.form = form;
        req.departments = departments;
        next();
    } catch (error) {
        next(error);
    }
}

exports.deleteFormDepartmentAndUsers = async (req,res,next)=>{
    try {
        const {fcode, dcode} = req.params;
        const [form, department] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode})
        ])

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }

        const formDepartment = await FormDepartment.findOne({
            form_id: form._id,
            department_id: department._id,
        }).select("_id")

        const delete_formUsers_result = await FormUser.deleteMany({
            department_form_id: formDepartment._id
        })

        console.log("Delete FormDepartment result:")
        console.log(delete_formUsers_result)

        const delete_formDepartment_result = await FormDepartment.deleteOne({
            _id: formDepartment._id
        })

        console.log("Delete FormDepartment result:")
        console.log(delete_formDepartment_result)

        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })

    } catch (error) {
        next(error);
    }
}

//end new

exports.getFormDepartments = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {level} = req.query;

        if(level && ![2,3].includes(parseInt(level))){
            return res.status(422).json({
                statusCode: 422,
                message: "Invalid level"
            })
        }

        const form = await Form.findOne({code: fcode}).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        const formDepartments = await FormDepartment.find({
            form_id: form._id,
            isDeleted: false,
            level: level?level: [2,3]
        })
        .lean()
        .populate("department_id","department_code name")
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
            level: 2,
            isDeleted: false
        })
        .populate("department_id", "department_code")
        .select("_id");

        //filter fd to be deleted
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
                department_id: department._id,
                level: 2
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
        const [form, department] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Department.findOne({department_code: dcode, isDeleted: false})
        ]);
        
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            });
        }
        
        if(!department){
            return res.status(404).json({
                statusCode: 404,
                message: "Department not found"
            })
        }

        let formDepartment = await FormDepartment.findOne({
            form_id: form._id,
            department_id: department._id,
            level: 3
        })
        
        if(!formDepartment){
            formDepartment = new FormDepartment({
                form_id: form._id,
                department_id: department._id,
                head: department.manager,
                level: 3
            })
        }

        formDepartment.isDeleted = false;
        formDepartment.save();

        req.form = form;
        req.departments = [department];

        next();
        
    } catch (error) {
        next(error);
    }
}

exports.checkCouncil = async (req,res,next)=>{
    try {
        const {fcode} = req.params;

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

exports.deleteDB = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const form = await Form.findOne({
            code: fcode
        }).select("_id")
        const formDepartments = await FormDepartment.find({
            form_id: form._id,
            level: 3
        })
        FormUser.deleteMany({
            department_form_id: formDepartments.map(e=>e._id),
            form_id: form._id
        },async(err, doc)=>{
            // console.log(doc);
            const result = await FormDepartment.deleteMany({
                _id: formDepartments.map(e=>e._id)
            })
            return res.status(200).json({
                statusCode: 200,
                result
            })
        })
    } catch (error) {
        next(error);
    }
}