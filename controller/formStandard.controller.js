const db = require("../model/");
const Criteria = require("../model/criteria.model");
const FormCriteria = require("../model/formCriteria.model");
const FormStandard = db.formStandard;
const Standard = db.standard;
const Form = db.form;

//validator
const {body, param, query} = require("express-validator");

//add formStandards
exports.addFormStandard = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {standards_code} = req.body;
        const form = await Form.findOne({
            code: fcode
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found",
            })
        }
        
        const formStandards = await FormStandard.find({
            form_id: form._id,
            isDeleted: false
        })
        .populate("standard_id", "code")
        .select("_id standard_id isDeleted")
        
        const upStandards = standards_code.map(e=>e.code);
        const deleteStandards = formStandards.map(e => e.standard_id.code).filter(e=>!upStandards.includes(e));
        
        for(let i in deleteStandards){
            const del_standard = await Standard.findOne({
                code: deleteStandards[i]
            }).select("_id")
            const formStandard = await FormStandard.findOne({
                form_id: form._id,
                standard_id: del_standard._id
            });
            formStandard.isDeleted = true;
            await formStandard.save();
        }

        for (let i in standards_code){
            const standard = await Standard.findOne({
                code: standards_code[i].code
            }).select("_id")
            let formStandard = await FormStandard.findOne({
                form_id: form._id,
                standard_id: standard._id
            });
            if(!formStandard){
                formStandard = new FormStandard({
                    form_id: form._id,
                    standard_id: standard._id,
                    standard_order: standards_code[i].order,
                    standard_point: standards_code[i].point
                })
                await formStandard.save()
            }
            else{
                formStandard.standard_order = standards_code[i].order;
                formStandard.standard_point = standards_code[i].point;
                formStandard.isDeleted = formStandard.isDeleted === true? false : formStandard.isDeleted;
                await formStandard.save()
            }
            
        }
        return res.status(200).json({
            statusCode: 200,
            formStandards,
            message: "Add FormStandard successfully"
        })
        
    } catch (error) {
        next(error);
    }
}

//get all formStandards of a form
exports.getFormStandards = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const form = await Form.findOne({
            code: fcode
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found",
            })
        }
        const formStandards = await FormStandard.find({
            form_id: form._id,
            isDeleted: false
        })
        .lean()
        .sort({"standard_order": 1})
        .populate("standard_id","code name")
        .select("standard_id standard_order standard_point")

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formStandards
        })

    } catch (error) {
        next(error);
    }
}

//add formStandard and its formCriteria(s)
exports.addFormStandardV2 = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {standard} = req.body;

        const criterions = standard.criterions;
        if (criterions.length === 0){
            return res.status(400).json({
                statusCode: 400,
                message: "Empty criterions"
            })
        }

        //query form && standard
        const [form, standardDoc] = await Promise.all([
            Form.findOne({code: fcode, isDeleted: false}).select("_id"),
            Standard.findOne({
                code: standard.standard_id,
                isDeleted: false
            }).select("_id")
        ])

        //return 404 if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found",
            })
        }
        if(!standardDoc){
            return res.status(404).json({
                statusCode: 400,
                message: "Standard not found"
            })
        }
        const standard_id = standardDoc._id;

        let formStandard = await FormStandard.findOne({
            standard_id,
            form_id: form._id
        })
        if(!formStandard){
            formStandard = new FormStandard({
                standard_id,
                form_id: form._id,
                standard_order: standard.standard_order
            })
        }
        formStandard.standard_order = standard.standard_order;
        formStandard.standard_point = standard.standard_point;
        formStandard.isDeleted = false;

        const formStandard_doc = await formStandard.save();

        for(const criteria_obj of criterions){
            const criteria = await Criteria.findOne({
                code: criteria_obj.criteria_id,
                isDeleted: false
            }).select("_id");
            const formCriteria = new FormCriteria({
                criteria_id: criteria._id,
                form_standard: formStandard_doc._id,
                criteria_order: criteria_obj.criteria_order,
                point: criteria_obj.criteria_point
            })
            formCriteria.save();
        }
        
        return res.status(201).json({
            statusCode: 201,
            message: "Success"
        })
        
    } catch (error) {
        next(error);
    }
}

//edit and delete formStandards
exports.editFormStandard = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {standards} = req.body;
        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found",
            })
        }
        
        //find all formStandard
        const formStandards = await FormStandard.find({
            form_id: form._id,
            isDeleted: false
        })
        .populate("standard_id", "code")
        .select("_id standard_id isDeleted")

        //filter formStandard to be deleted
        const upStandards = standards.map(e=>e.standard_id);
        const deleteStandards = formStandards.map(e => e.standard_id.code).filter(e=>!upStandards.includes(e));

        //delete formStandard and its formCriteria
        for(const standardObj of deleteStandards){
            const standard = await Standard.findOne({code: standardObj}).select("_id");
            const formStandard = await FormStandard.findOne({
                form_id: form._id,
                standard_id: standard._id
            }).select("_id")
            FormCriteria.deleteMany({
                form_standard: formStandard._id
            },async (err)=>{
                if(err){return next(err)}
                const doc = await FormStandard.deleteOne({_id: formStandard._id});
                console.log(doc);
            })
        }

        //update formStandard
        for(const standardObj of standards){
            const standard = await Standard.findOne({
                code: standardObj.standard_id
            }).select("_id")
            const formStandard = await FormStandard.findOne({
                form_id: form._id,
                standard_id: standard._id
            })
            if(formStandard){
                formStandard.standard_order = standardObj.standard_order;
                formStandard.standard_point = standardObj.standard_point;
                formStandard.save();
            }
        }
        
        return res.status(200).json({
            statusCode: 200,
            message: "Successful"
        })
        
    } catch (error) {
        next(error);
    }
}