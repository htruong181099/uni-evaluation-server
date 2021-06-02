const db = require("../model");
const EvaluateForm = require("../model/evaluateForm.model");
const Form = require("../model/form.model");
const FormCriteria = require("../model/formCriteria.model");
const FormDepartment = require("../model/formDepartment.model");
const FormStandard = require("../model/formStandard.model");
const Standard = require("../model/standard.model");
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
        }).select("_id status level").lean();

        for(let i in evaluateForms){
            const evaluateForm = evaluateForms[i];
            const evaluateCriteria = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id
            }).select("form_criteria point -_id")
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
            userForm: userForm._id,
            level
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
                    point: body[i].value?body[i].value:null
                })
            }
            evaluateCriteria.point = body[i].value?body[i].value:null;
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
                form_criteria: formCriteria._id
            })
    
            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriteria._id,
                    point: body[i].value?body[i].value:null
                })
            }
            evaluateCriteria.point = body[i].value?body[i].value:null;
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

//version 3
exports.submitEvaluationV3 = async (req,res,next)=>{
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
            .select("_id form_id");
        
        if(!userForm){
            return res.status(404).json({
                statusCode: 404,
                message: "UserForm not found"
            })
        }

        const evaluateForm = await EvaluateForm.findOne({
            user: user._id,
            userForm: userForm._id,
            level
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
                })
            }
            let point = body[i].value?body[i].value:0;
            point = formCriteria.point?(point>formCriteria.point? formCriteria.point:point):point;
            evaluateCriteria.point = body[i].value?body[i].value:0;
            await evaluateCriteria.save();
        }
        evaluateForm.status = 1;
        await evaluateForm.save();
        
        res.status(200).json({
            statusCode: 200,
            message: "Save evaluation successfully"
        })
        
        req.form_id = userForm.form_id;
        req.level = level;
        req.userForm_id = userForm._id;
        req.fbody = body;
        next();
        
    } catch (error) {
        next(error);
    }
}

exports.cloneEvaluateCriteria = async (req,res,next)=>{
    try {
        const {form_id, level, userForm_id, fbody} = req;
        const body = fbody;
        //get formdepartment level + 1
        const formDepartment = await FormDepartment.findOne({
            form_id: form_id,
            level: level + 1,
            isDeleted: false
        }).select("_id head")

        if(!formDepartment){
            const userForm = await UserForm.findOne({
                _id: userForm_id
            })
            const form_id = userForm.form_id;
            const evaluateForm = await EvaluateForm.findOne({
                userForm: userForm._id,
                status: 1
            }).sort({
                "level": -1
            })
    
            const formStandards = await FormStandard.find({
                form_id: form_id,
                isDeleted: false
            }).sort({standard_order: 1})
            .select("standard_id standard_order standard_point")
            .populate("standard_id", "code name")
    
    
            let final_point = 0;
            for(let i in formStandards){
                const formStandard = formStandards[i];
                const formCriterias = await FormCriteria.find({
                    form_standard: formStandard._id,
                    isDeleted: false
                }).select("_id")
                const evaluateCriteria = await EvaluateCriteria.find({
                    evaluateForm: evaluateForm._id,
                    form_criteria: formCriterias
                })
                .select("-__v -isDeleted")
                
                let standard_point = evaluateCriteria.reduce((acc,ele) => acc + ele.point, 0)
                if(formStandard.standard_point){
                    standard_point = standard_point > formStandard.standard_point? formStandard.standard_point: standard_point
                } 
                final_point += standard_point;
            }
            userForm.point = final_point;
            userForm.save();
            return;
        }

        //head formuser
        const upperLevelHead = await FormUser.findOne({
            isDeleted: false,
            department_form_id: formDepartment._id,
            user_id: formDepartment.head
        }).select("_id")

        //clone head evaluate form
        const evaluateForm = new EvaluateForm({
            user: upperLevelHead._id,
            userForm: userForm_id,
            status: 0,
            level: level + 1
        })

        const doc = await evaluateForm.save();

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
                evaluateForm: doc._id,
                form_criteria: formCriteria._id,
                level: level+1
            })
    
            if(!evaluateCriteria){
                evaluateCriteria = new EvaluateCriteria({
                    evaluateForm: doc._id,
                    form_criteria: formCriteria._id,
                    point: body[i].value?body[i].value:0,
                    level: level+1
                })
            }
            evaluateCriteria.point = body[i].value?body[i].value:0;
            await evaluateCriteria.save();
        }

    } catch (error) {
        next(error);
    }
}

//delete Evaluate Form DB
exports.deleteEvaluateFormDB = async (req,res,next)=>{
    try {
        const {id} = req.params;

        const evaluateForm = await EvaluateForm.findById(id);
        EvaluateCriteria.deleteMany({
            evaluateForm: evaluateForm._id
        },{},()=>{
            EvaluateForm.deleteOne({_id: id},{},()=>{
                return res.status(200).json({
                    statusCode: 200,
                    message: "Success"
                })
            })
        })

    } catch (error) {
        next(error);
    }
}

exports.testS = async (req,res,next)=>{
    try {
        const {fcode} = req.params;
        const {scode} = req.body;

        const form = await Form.findOne({
            code: fcode,
            isDeleted: false
        }).select("_id")
        if(!form){
            return res.status(404).json({
                statusCode: 404,
                message: "Form not found"
            })
        }
        const standard = await Standard.findOne({
            code: scode,
            isDeleted: false
        }).select("_id")
        if(!standard){
            return res.status(404).json({
                statusCode: 404,
                message: "Standard not found"
            })
        }

        const formStandard = await FormStandard.findOne({
            form_id: form._id,
            standard_id: standard._id,
            isDeleted: false
        })
        if(!formStandard){
            return res.status(404).json({
                statusCode: 404,
                message: "FormStandard not found"
            })
        }

        // let spoint = 0;
        const formCriterias = await FormCriteria.find({
            form_standard: formStandard._id,
            isDeleted: false
        }).select("_id")

        // const evaluateCriteria = await EvaluateCriteria.find({
        //     form_criteria: formCriterias
        // })
        // if(formStandard.standard_point){
        //     standard_point = standard_point > formStandard.standard_point? formStandard.standard_point: standard_point
        // } 
        // spoint += standard_point;

        const evaluateCriteria = EvaluateCriteria.aggregate([{
            $match: {
                form_criteria: {$in: formCriterias.map(e=>e._id)}
            },
        },{
            $group: {
                _id: "$evaluateForm",
                point: {$sum: "$point"}
            }
        }],(err,doc)=>{
            console.log(doc);
            res.status(200).json({
                doc: doc
            })
            return;
        })
        
        // console.log(evaluateCriteria);

    } catch (error) {
        next(error);
    }
}

exports.test = async (req,res,next)=>{
    const userForm_id = req.params.ufid;
    try {
        const userForm = await UserForm.findOne({
            _id: userForm_id
        })
        const form_id = userForm.form_id;
        const evaluateForm = await EvaluateForm.findOne({
            userForm: userForm._id,
            status: 1
        }).sort({
            "level": -1
        })

        const formStandards = await FormStandard.find({
            form_id: form_id,
            isDeleted: false
        }).sort({standard_order: 1})
        .select("standard_id standard_order standard_point")
        .populate("standard_id", "code name")


        let lst = []
        let final_point = 0;
        for(let i in formStandards){
            const formStandard = formStandards[i];
            const formCriterias = await FormCriteria.find({
                form_standard: formStandard._id,
                isDeleted: false
            }).select("_id")
            const evaluateCriteria = await EvaluateCriteria.find({
                evaluateForm: evaluateForm._id,
                form_criteria: formCriterias
            }).populate({
                path: "form_criteria",
                select: "form_standard criteria_id criteria_order point -_id",
                sort: {criteria_order: 1},
                populate: {
                    path: "criteria_id",
                    select: "code name type -_id",
                }
            })
            .select("-__v -isDeleted")
            let standard_point = evaluateCriteria.reduce((acc,ele) => acc + ele.point, 0)
            
            lst.push({
                formStandard,
                evaluateCriteria,
                count: evaluateCriteria.length,
                standard_point
            })
            if(formStandard.standard_point){
                standard_point = standard_point > formStandard.standard_point? formStandard.standard_point: standard_point
            } 
            final_point += standard_point;
        }

        res.status(200).json({
            final_point,
            lst
        })
        return;
    } catch (error) {
        next(error);
    }
}