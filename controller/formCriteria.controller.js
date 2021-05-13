const { standard } = require("../model/");
const db = require("../model/");
const FormStandard = db.formStandard;
const Standard = db.standard;
const Form = db.form;
const Criteria = db.criteria;
const FormCriteria = db.formCriteria;

exports.addFormCriteria = async (req,res,next)=>{
    try {
        const {fcode, scode} = req.params;
        const {criterions} = req.body;

        const form = await Form.findOne({
            code: fcode
        }).select("_id");

        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }

        const standard = await Standard.findOne({
            code: scode
        }).select("_id");

        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }

        const formStandard = await FormStandard.findOne({
            form_id: form._id,
            standard_id: standard._id
        })
        if(!formStandard){
            return res.status(404).json({
                statusCode: 404,
                message: "FormStandard not found"
            })
        }

        const formCriterions = await FormCriteria.find({
            form_standard: formStandard._id,
            isDeleted: false
        }).populate("criteria_id", "code")
        .select("_id criteria_id isDeleted")

        const upCriterions = criterions.map(e=>e.code);
        const deleteCriterions = formCriterions.map(e => e.criteria_id.code).filter(e => !upCriterions.includes(e));

        for(let i in deleteCriterions){
            const del_criteria = await Criteria.findOne({
                code: deleteCriterions[i]
            }).select("_id")
            const formCriteria = await FormCriteria.findOne({
                form_standard: formStandard._id,
                criteria_id: del_criteria._id
            });
            formCriteria.isDeleted = true;
            await formCriteria.save();
        }

        for (let i in criterions){
            const criteria = await Criteria.findOne({
                code: criterions[i].code
            }).select("_id")
            let formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                form_standard: formStandard._id
            });
            if(!formCriteria){
                formCriteria = new FormCriteria({
                    form_standard: formStandard._id,
                    criteria_id: criteria._id,
                    criteria_order: criterions[i].order,
                    point: criterions[i].point
                })
                await formCriteria.save()
            }
            else{
                formCriteria.criteria_order = criterions[i].order;
                formCriteria.point = criterions[i].point;
                formCriteria.isDeleted = formCriteria.isDeleted === true? false : formCriteria.isDeleted;
                await formCriteria.save()
            }
            
        }
        return res.status(200).json({
            statusCode: 200,
            message: "Add FormCriteria successfully"
        })

        // for (let i in criterions){
        //     const criteria = await Criteria.findOne({code: criterions[i].code})
        //             .select("_id");
        //     if(!criteria){
        //         return res.status(404).json({
        //             statusCode: 404,
        //             message: "Criteria not found"
        //         })
        //     }
        //     const formCriteria = new FormCriteria({
        //         criteria_id: criteria._id,
        //         form_standard: formStandard._id,
        //         criteria_order: criterions[i].order
        //     })
        //     await formCriteria.save()
        // }        
        // return res.status(200).json({
        //     statusCode: 200,
        //     message: "Add formCriteria successfully"
        // })

    } catch (error) {
        next(error);
    }
}

exports.getFormCriteria = async (req,res,next)=>{
    try {
        const {fcode, scode} = req.params;
        const form = await Form.findOne({
            code: fcode
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found",
            })
        }

        const standard = await Standard.findOne({
            code: scode
        }).select("_id");
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found",
            })
        }

        const formStandard = await FormStandard.findOne({
            form_id: form._id,
            standard_id: standard._id,
            isDeleted: false
        }).select("_id")

        const formCriteria = await FormCriteria.find({
            form_standard: formStandard._id,
            isDeleted: false
        })
        .sort({"criteria_order": 1})
        .populate("criteria_id","name code")
        .select("-isDeleted -__v -form_standard");

        return res.status(200).json({
            statusCode: 200,
            message: "Success",
            formCriteria
        })

    } catch (error) {
        next(error);
    }
}