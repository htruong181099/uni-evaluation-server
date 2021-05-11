const db = require("../model/");
const FormStandard = db.formStandard;
const Standard = db.standard;
const Form = db.form;

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
        let standards = []
        for (let i in standards_code){
            const standard = await Standard.findOne({
                code: standards_code[i]
            }).select("_id")
            console.log(standard);
            standards += [standard]
            const formStandard = new FormStandard({
                form_id: form._id,
                standard_id: standard._id,
                standard_order: i+1
            })
            await formStandard.save()
        }
        res.status(200).json({
            statusCode: 200,
            message: "Add FormStandard successfully"
        })
        

    } catch (error) {
        next(error);
    }
}