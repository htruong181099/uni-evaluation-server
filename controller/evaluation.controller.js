const { form } = require("../model");
const db = require("../model");
const Form = require("../model/form.model");
const FormCriteria = require("../model/formCriteria.model");
const UserForm = require("../model/userForm.model");
const Evaluation = db.evaluation;
const FormUser = db.formUser;

exports.submitEvaluation = async (req,res,next)=>{
    const {fcode} = req.params;
    const {body, level} = req.body;
    const user_id = req.userId;

    const form = await Form.findOne({
        code: fcode
    }).select("_id");

    if(!form){
        return res.status(404).json({
            statusCode: 404,
            message: "Form not found"
        })
    }

    const user = FormUser.findOne({
        user_id: user_id,
        form_id: form._id
    })

    const userForm = await UserForm.findOne({

    })

    for(let i in body){
        const standard = body[i];
        const criterias = standard.list;
        for(let j in criterion){
            const criteria = await Criteria.findOne({
                code: crtierion[j].name,
                isDeleted: false
            }).select("_id")
            const formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                isDeleted: false
            })
            const evaluation = await Evaluation.findOne({
                form_crtieria: formCriteria._id,
                user: user._id,
                status: 1
            })
        }
    }

}