const db = require("../model");
const Form = require("../model/form.model");
const FormCriteria = require("../model/formCriteria.model");
const UserForm = require("../model/userForm.model");
const EvaluateCriteria = db.evaluateCriteria;
const FormUser = db.formUser;

//complete
exports.submitEvaluation = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const {body, level} = req.body;
        const user_id = req.userId;

        const userForm = await UserForm.findById(ufid)
            .select("_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "User Form not found"
            })
        }
        const user = await FormUser.findOne({
            user_id
        }).select("_id");

        for(let i in body){
            const standard = body[i];
            const criterion = standard.list;
            for(let j in criterion){
                const criteria = await Criteria.findOne({
                    code: crtierion[j].name,
                    isDeleted: false
                }).select("_id")
                const formCriteria = await FormCriteria.findOne({
                    criteria_id: criteria._id,
                    isDeleted: false
                })
                const evaluateCriteria = await EvaluateCriteria.findOne({
                    userForm: userForm._id,
                    user: user._id,
                    form_crtieria: formCriteria._id,
                    level
                })
                if(!evaluateCriteria){
                    evaluateCriteria = new EvaluateCriteria({
                        userForm: userForm._id,
                        user: user._id,
                        form_crtieria: formCriteria._id,
                        point: crtierion[j].point,
                        level
                    })
                }
                evaluateCriteria.point = crtierion[j].point;
                await evaluateCriteria.save();
            }
        }
    } catch (error) {
        next(error);
    }

}


//save Evaluation
exports.submitEvaluation = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const {body, level} = req.body;
        const user_id = req.userId;

        const userForm = await UserForm.findById(ufid)
            .select("_id status");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "User Form not found"
            })
        }

        const user = await FormUser.findOne({
            user_id
        }).select("_id");

        for(let i in body){
            const standard = body[i];
            const criterion = standard.list;
            for(let j in criterion){
                const criteria = await Criteria.findOne({
                    code: crtierion[j].name,
                    isDeleted: false
                }).select("_id")
                const formCriteria = await FormCriteria.findOne({
                    criteria_id: criteria._id,
                    isDeleted: false
                })
                const evaluateCriteria = await Evaluation.findOne({
                    userForm: userForm._id,
                    user: user._id,
                    form_crtieria: formCriteria._id,
                    level
                })
                if(!evaluateCriteria){
                    evaluateCriteria = new Evaluation({
                        userForm: userForm._id,
                        user: user._id,
                        form_crtieria: formCriteria._id,
                        point: crtierion[j].point,
                        level
                    })
                }
                evaluation.point = crtierion[j].point;
                await evaluation.save();
            }
        }
        return res.status(200).json({
            statusCode: 200,
            message: "Save evaluation successfully"
        })
    } catch (error) {
        next(error);
    }

}