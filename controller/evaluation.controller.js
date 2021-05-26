const db = require("../model");
const EvaluateForm = require("../model/evaluateForm.model");
const Form = require("../model/form.model");
const FormCriteria = require("../model/formCriteria.model");
const UserForm = require("../model/userForm.model");
const EvaluateCriteria = db.evaluateCriteria;
const FormUser = db.formUser;
const Criteria = db.criteria;

//complete
exports.submitEvaluation = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const {sent, level} = req.body;
        const user_id = req.userId;
        const user = await FormUser.findOne({
            user_id
        }).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const userForm = await UserForm.findById(ufid)
            .select("_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id
        }).select("_id status");
        if(!evaluateForm){
            return res.status(404).json({
                statusCode: 404,
                message: "Evaluate Form not found"
            })
        }

        if(evaluateForm.status === 1){
            return res.status(400).json({
                statusCode: 400,
                message: "Form is completed. Cannot submit"
            })
        }
        const body = sent;
        for(let i in body){
            const standard = body[i];
            const criterion = standard.list;
            for(let j in criterion){
                const criteria = await Criteria.findOne({
                    code: criterion[j].name,
                    isDeleted: false
                }).select("_id")
                const formCriteria = await FormCriteria.findOne({
                    criteria_id: criteria._id,
                    isDeleted: false
                })
                let evaluateCriteria = await EvaluateCriteria.findOne({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    level
                })
        
                if(!evaluateCriteria){
                    evaluateCriteria = new EvaluateCriteria({
                        evaluateForm: evaluateForm._id,
                        form_criteria: formCriteria._id,
                        point: criterion[j].value?criterion[j].value:0,
                        level
                    })
                }
                evaluateCriteria.point = criterion[j].value?criterion[j].value:0;
                await evaluateCriteria.save();
            }
        }
        evaluateForm.status = 1;
        await evaluateForm.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Submit form successfully"
        })
    } catch (error) {
        next(error);
    }

}


//save Evaluation
exports.saveEvaluation = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const {sent, level} = req.body;
        const user_id = req.userId;
        const user = await FormUser.findOne({
            user_id
        }).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const userForm = await UserForm.findById(ufid)
            .select("_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id
        }).select("_id status");
        if(!evaluateForm){
            return res.status(404).json({
                statusCode: 404,
                message: "Evaluate Form not found"
            })
        }

        if(evaluateForm.status === 1){
            return res.status(400).json({
                statusCode: 400,
                message: "Form is completed. Cannot submit"
            })
        }
        const body = sent;
        for(let i in body){
            const standard = body[i];
            const criterion = standard.list;
            for(let j in criterion){
                const criteria = await Criteria.findOne({
                    code: criterion[j].name,
                    isDeleted: false
                }).select("_id")
                const formCriteria = await FormCriteria.findOne({
                    criteria_id: criteria._id,
                    isDeleted: false
                })
                let evaluateCriteria = await EvaluateCriteria.findOne({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    level
                })
        
                if(!evaluateCriteria){
                    evaluateCriteria = new EvaluateCriteria({
                        evaluateForm: evaluateForm._id,
                        form_criteria: formCriteria._id,
                        point: criterion[j].value?criterion[j].value:0,
                        level
                    })
                }
                evaluateCriteria.point = criterion[j].value?criterion[j].value:0;
                await evaluateCriteria.save();
            }
        }
        evaluateForm.status = 0;
        await evaluateForm.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Save evaluation successfully"
        })
    } catch (error) {
        next(error);
    }
}


exports.getEvaluation = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const user_id = req.userId;

        const userForm = await UserForm.findById(ufid)
            .select("_id form_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const formUser = await FormUser.findOne({
            user_id,
            form_id: userForm.form_id
        }).select("_id");

        if(!formUser){
            return res.status(404).json({
                statusCode: 404,
                message: "FormUser not found"
            })
        }

        const evaluateForms = await EvaluateForm.find({
            // user: formUser._id,
            userForm: userForm._id,
            status: [0,1]
        }).select("_id status").lean();

        for(let i in evaluateForms){
            const evaluateForm = evaluateForms[i];
            const evaluateCriteria = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id
            }).select("form_criteria point level -_id")
            .populate({
                path: "form_criteria",
                select: "criteria_id criteria_order -_id",
                sort: {"criteria_order": 1},
                populate: {
                    path: "criteria_id",
                    select: "code -_id"
                }
            })
            evaluateForm.evaluateCriteria = evaluateCriteria;
        }
        

        return res.status(200).json({
            statusCode: 200,
            evaluateForms
        })


    } catch (error) {
        next(error);
    }
}

//Admin
exports.getEvaluationAdmin = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const user_id = req.userId;

        const userForm = await UserForm.findById(ufid)
            .select("_id form_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const evaluateForms = await EvaluateForm.find({
            // user: formUser._id,
            userForm: userForm._id,
            status: [0,1]
        }).select("_id status").lean();

        for(let i in evaluateForms){
            const evaluateForm = evaluateForms[i];
            const evaluateCriteria = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id
            }).select("form_criteria point level -_id")
            .populate({
                path: "form_criteria",
                select: "criteria_id criteria_order -_id",
                sort: {"criteria_order": 1},
                populate: {
                    path: "criteria_id",
                    select: "code -_id"
                }
            })
            evaluateForm.evaluateCriteria = evaluateCriteria;
        }
        

        return res.status(200).json({
            statusCode: 200,
            evaluateForms
        })


    } catch (error) {
        next(error);
    }
}


//version 2
//save Evaluation
exports.saveEvaluationV2 = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const {dataToSend, level} = req.body;
        const user_id = req.userId;
        const user = await FormUser.findOne({
            user_id
        }).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const userForm = await UserForm.findById(ufid)
            .select("_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id
        }).select("_id status");
        if(!evaluateForm){
            return res.status(404).json({
                statusCode: 404,
                message: "Evaluate Form not found"
            })
        }

        if(evaluateForm.status === 1){
            return res.status(400).json({
                statusCode: 400,
                message: "Form is completed. Cannot submit"
            })
        }
        const body = dataToSend;
        for(let i in body){
            const criteria = await Criteria.findOne({
                code: body[i].name,
                isDeleted: false
            }).select("_id")
            const formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                isDeleted: false
            })
            let evaluateCriteria = await EvaluateCriteria.findOne({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriteria._id
            })
    
            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    point: body[i].value?body[i].value:0,
                    level
                })
            }
            evaluateCriteria.point = body[i].value?body[i].value:0;
            await evaluateCriteria.save();
        }
        evaluateForm.status = 0;
        await evaluateForm.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Save evaluation successfully"
        })
    } catch (error) {
        next(error);
    }
}


exports.submitEvaluationV2 = async (req,res,next)=>{
    try {
        const {ufid} = req.params;
        const {dataToSend, level} = req.body;
        const user_id = req.userId;
        const user = await FormUser.findOne({
            user_id
        }).select("_id");
        if(!user){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const userForm = await UserForm.findById(ufid)
            .select("_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id
        }).select("_id status");
        if(!evaluateForm){
            return res.status(404).json({
                statusCode: 404,
                message: "Evaluate Form not found"
            })
        }

        if(evaluateForm.status === 1){
            return res.status(400).json({
                statusCode: 400,
                message: "Form is completed. Cannot submit"
            })
        }
        const body = dataToSend;
        for(let i in body){
            const criteria = await Criteria.findOne({
                code: body[i].name,
                isDeleted: false
            }).select("_id")
            const formCriteria = await FormCriteria.findOne({
                criteria_id: criteria._id,
                isDeleted: false
            })
            let evaluateCriteria = await EvaluateCriteria.findOne({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriteria._id,
                level
            })
    
            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    point: body[i].value?body[i].value:0,
                    level
                })
            }
            evaluateCriteria.point = body[i].value?body[i].value:0;
            await evaluateCriteria.save();
        }
        evaluateForm.status = 1;
        await evaluateForm.save();

        return res.status(200).json({
            statusCode: 200,
            message: "Save evaluation successfully"
        })
    } catch (error) {
        next(error);
    }
}




