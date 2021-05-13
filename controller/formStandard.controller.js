const db = require("../model/");
const FormStandard = db.formStandard;
const Standard = db.standard;
const Form = db.form;

// exports.addFormStandard = async (req,res,next)=>{
//     try {
//         const {fcode} = req.params;
//         const {removeStandards, standards_code} = req.body;
//         const form = await Form.findOne({
//             code: fcode
//         }).select("_id");
//         if(!form){
//             return res.status(404).json({
//                 statusCode: 404,
//                 message: "Form not found",
//             })
//         }
//         for (let i in removeStandards){
//             console.log(removeStandards[i]);
//             const removeStandard = await Standard.findOne({
//                 code: removeStandards[i].code
//             }).select("_id")
//             let formStandard = await FormStandard.findOne({
//                 form_id: form._id,
//                 standard_id: removeStandard._id,
//                 isDeleted: false
//             });
//             if(formStandard){
//                 formStandard.isDeleted = true;
//                 await formStandard.save()
//             }
//         }
//         for (let i in standards_code){
//             const standard = await Standard.findOne({
//                 code: standards_code[i].code
//             }).select("_id")
//             let formStandard = await FormStandard.findOne({
//                 form_id: form._id,
//                 standard_id: standard._id
//             });
//             if(!formStandard){
//                 formStandard = new FormStandard({
//                     form_id: form._id,
//                     standard_id: standard._id,
//                     standard_order: standards_code[i].order,
//                     standard_point: standards_code[i].point
//                 })
//                 await formStandard.save()
//             }
//             else{
//                 formStandard.standard_order = standards_code[i].order;
//                 formStandard.standard_point = standards_code[i].point;
//                 formStandard.isDeleted = formStandard.isDeleted === true? false : formStandard.isDeleted;
//                 await formStandard.save()
//             }
            
//         }
//         return res.status(200).json({
//             statusCode: 200,
//             message: "Add FormStandard successfully"
//         })
        
//     } catch (error) {
//         next(error);
//     }
// }

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