const db = require("../model/");
const FormStandard = db.formStandard;
const Standard = db.standard;
const Form = db.form;
const Criteria = db.criteria;
const FormCriteria = db.formCriteria;

exports.addFormCriteria = async (req,res,next)=>{
    try {
        const {fcode, standard} = req.params;
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

        const standard_id = await Standard.findOne({
            code: fcode
        }).select("_id");

        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }

        const formStandard = await FormStandard.findOne({
            form_id: form._id,
            standard_id: standard_id._id
        })
        if(!formStandard){
            return res.status(404).json({
                statusCode: 404,
                message: "FormStandard not found"
            })
        }

        for (let i in criterions){
            const criteria = await Criteria.findOne({code: criterions[i].code})
                    .select("_id");
            if(!criteria){
                return res.status(404).json({
                    statusCode: 404,
                    message: "Criteria not found"
                })
            }
            const formCriteria = new FormCriteria({
                criteria_id: criteria._id,
                form_standard: formStandard._id,
                criteria_order: criterions[i].order
            })
            await formCriteria.save()
        }        
        return res.status(200).json({
            statusCode: 200,
            message: "Add formCriteria successfully"
        })

    } catch (error) {
        next(error);
    }
}