const db = require("../model/");
const FormStandard = db.formStandard;
const Standard = db.standard;
const Form = db.form;
const Criteria = db.criteria;
const FormCriteria = db.formCriteria;

//validator
const {body, param, query} = require("express-validator");

exports.validate = (method)=>{
    switch(method){
        case 'getFormCriteria': {
            return [
                param("fcode", "Invalid Form").exists().isString(),
                param("scode", "Invalid Standard").exists().isString(),
            ]
        };
        case 'addSingleFormCriteria': {
            return [
                param("fcode", "Invalid Form").exists().isString(),
                param("scode", "Invalid Standard").exists().isString(),
                body("criteria", "Invalid Criteria").exists().isObject()
            ]
        };
        case 'editFormCriteria': {
            return [
                param("fcode", "Invalid Form").exists().isString(),
                param("scode", "Invalid Standard").exists().isString(),
                body("criterions", "Invalid Criteria").exists().isArray()
            ]
        }
    }
}

//add FormCriteria v1 -> outdated
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
//outdated

//get formCriteria of a formStandard
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
        if(!formStandard){
            return res.status(404).json({
                statusCode: 404,
                message: "FormStandard not found"
            })
        }

        const formCriteria = await FormCriteria.find({
            form_standard: formStandard._id,
            isDeleted: false
        })
        .lean()
        .sort({"criteria_order": 1})
        .populate("criteria_id","name code type description")
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

//add FormCriteria v2 - single formCriteria a time
exports.addSingleFormCriteria = async (req,res,next)=>{
    try {
        const {fcode, scode} = req.params;
        const {criteria} = req.body;
        /**
         *  criteria : {
         *      criteria_id,
         *      criteria_order,
         *      criteria_point
         *      base_point (optional)
         *  }
         */
        //find form && standard && criteria
        const [form, standard, criteriaDoc] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Standard.findOne({code: scode}).select("_id"),
            Criteria.findOne({code: criteria.criteria_id}).select("_id")
        ])

        //return 404 error if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }
        if(!criteriaDoc){
            return res.status(404).json({
                statusCode: 404,
                message: "Criteria not found"
            })
        }

        //find formStandard
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

        //check if formCriteria is already existed
        let formCriteria = await FormCriteria.findOne({
            form_standard: formStandard._id,
            criteria_id: criteriaDoc._id
        })
        if(!formCriteria){
            //create a new formCriteria if not existed
            formCriteria = new FormCriteria({
                form_standard: formStandard._id,
                criteria_id: criteriaDoc._id,
                criteria_order: criteria.criteria_order,
                base_point : criteria.base_point,
                point: criteria.criteria_point
            })

            formCriteria.save();

            return res.status(201).json({
                statusCode: 201,
                message: "Add FormCriteria successfully"
            })
        }
        //modify if existed
        formCriteria.criteria_order = criteria.criteria_order;
        formCriteria.point = criteria.criteria_point;
        formCriteria.base_point = criteria.base_point;
        formCriteria.isDeleted = false;

        formCriteria.save();

        return res.status(201).json({
            statusCode: 201,
            message: "Add FormCriteria successfully"
        })

    } catch (error) {
        next(error);
    }
}


//edit formCriteria(s)
exports.editFormCriteria = async (req,res,next)=>{
    try {
        const {fcode, scode} = req.params;
        const {criterions} = req.body;
        /**
         *  criterions = [
         *      {
         *          criteria_id,
         *          criteria_order,
         *          criteria_point
         *      },{},{}
         *  ]
         **/        
        
        //find form && standard && criteria
        const [form, standard] = await Promise.all([
            Form.findOne({code: fcode}).select("_id"),
            Standard.findOne({code: scode}).select("_id")
        ])

        //return 404 status if not found
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found",
            })
        }
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found",
            })
        }

        //find formStandard
        const formStandard = await FormStandard.findOne({
            form_id: form._id,
            standard_id: standard._id,
            isDeleted: false
        }).select("_id")
        if(!formStandard){
            return res.status(404).json({
                statusCode: 404,
                message: "FormStandard not found"
            })
        }

        //find all formCriteria of a formStandard
        const formCriterions = await FormCriteria.find({
            form_standard: formStandard._id,
            isDeleted: false
        })
        .populate("criteria_id", "code")
        .select("_id criteria_id isDeleted")

        //filter formCriteria to be deleted
        const upCriterions = criterions.map(e=>e.criteria_id);
        const deleteCriterions = formCriterions.map(e => e.criteria_id.code).filter(e => !upCriterions.includes(e));
        
        //if there are sth to be deleted
        if(deleteCriterions){
            const deleteCriterionsObj = await Criteria.find({
                code: deleteCriterions
            }).select("_id")
            const delFormCriteria = await FormCriteria.deleteMany({
                form_standard: formStandard._id,
                criteria_id: deleteCriterionsObj.map(e=>e._id)
            })
        }

        //update formCriteria
        for(const criteriaObj of criterions){
            const criteria = await Criteria.findOne({
                code: criteriaObj.criteria_id
            }).select("_id")
            const formCriteria = await FormCriteria.findOne({
                form_standard: formStandard._id,
                criteria_id: criteria._id
            })
            if(formCriteria){
                formCriteria.criteria_order = criteriaObj.criteria_order;
                formCriteria.point = criteriaObj.criteria_point;
                formCriteria.base_point = criteriaObj.base_point;
                formCriteria.save();
            }
        }
            
        return res.status(200).json({
            statusCode: 200,
            message: "Success"
        })

    } catch (error) {
        next(error);
    }
}
