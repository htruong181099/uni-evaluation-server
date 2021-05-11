const db = require("../model/");
const FormStandard = db.formStandard;
const Standard = db.standard;
const Form = db.form;

exports.addFormStandard = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {removeStandards, standards_code} = req.body;
        const form = await Form.findOne({
            code: fcode
        }).select("_id");
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found",
            })
        }
        for (let i in removeStandards){
            console.log(removeStandards[i]);
            const removeStandard = await Standard.findOne({
                code: removeStandards[i].code
            }).select("_id")
            let formStandard = await FormStandard.findOne({
                form_id: form._id,
                standard_id: removeStandard._id,
                isDeleted: false
            });
            if(formStandard){
                formStandard.isDeleted = true;
                await formStandard.save()
            }
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
            message: "Add FormStandard successfully"
        })
        
    } catch (error) {
        next(error);
    }
}